import { Router } from "express";
import { generateLicense, generateTrialLicense } from "../controllers/license";
import { requireAuth } from "../middleware/auth";
import { License, User } from "../../shared/schema";
import { storage } from "../storage";
import { Request, Response } from "express";
import { LicenseGateService, LicenseDetails } from "../services/licenseGate";

const router = Router();

// Generate a license key for a subscription
router.post("/generate", requireAuth, generateLicense);

// Generate a trial license
router.post("/trial", requireAuth, generateTrialLicense);

// Get licenses for the currently logged-in user
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    console.log("[DEBUG] /me endpoint called - auth passed");
    const user = req.user as User | undefined; 
    console.log("[DEBUG] User from request:", JSON.stringify(user, null, 2));

    if (!user || !user.id) {
      console.log("[DEBUG] No user or user ID found in request");
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated or ID missing." 
      });
    }

    const userId = user.id;
    console.log("[DEBUG] Fetching licenses for user ID:", userId);
    
    // First get all licenses for this user from our database
    const dbLicenses: License[] = await storage.getUserLicenses(userId);
    console.log("[DEBUG] Found licenses in DB:", dbLicenses.length, JSON.stringify(dbLicenses, null, 2));
    
    // Then get user licenses from LicenseGate API based on email
    let lgLicenses: any[] = [];
    try {
      lgLicenses = await LicenseGateService.getUserLicensesFromLicenseGate(user.email);
      console.log("[DEBUG] Found licenses in LicenseGate for email", user.email, ":", lgLicenses.length);
    } catch (error) {
      console.error("[DEBUG] Error fetching licenses from LicenseGate:", error);
      // Continue with DB licenses if LicenseGate fetch fails
    }
    
    // Create a map of licenses by license key for quick lookup
    const licensesByKey = new Map();
    
    // Add all DB licenses to the map first
    for (const dbLicense of dbLicenses) {
      licensesByKey.set(dbLicense.licenseKey, {
        ...dbLicense,
        // Default plan to 'trial' if subscriptionId is null
        plan: !dbLicense.subscriptionId ? 'trial' : undefined,
      });
    }
    
    // Update or add licenses from LicenseGate
    for (const lgLicense of lgLicenses) {
      // Extract plan type and billing type from notes if available
      let plan = 'standard'; // Default
      let billingType = 'monthly'; // Default
      
      if (lgLicense.hasOwnProperty('name') && lgLicense.hasOwnProperty('notes')) {
        // This is the raw API response - the method didn't fully transform it
        const notes = lgLicense.notes || '';
        
        // Perform strict email matching to ensure we only get user-specific licenses
        // Look for common patterns like "Email: user@example.com" or "Email - user@example.com"
        const emailPatterns = [
          `Email: ${user.email}`,
          `Email - ${user.email}`,
          `email: ${user.email}`,
          `email - ${user.email}`
        ];
        
        // Skip if none of the email patterns match
        if (!emailPatterns.some(pattern => notes.includes(pattern))) {
          console.log("[DEBUG] Skipping license", lgLicense.licenseKey, "- email doesn't match user:", user.email);
          continue;
        }
        
        console.log("[DEBUG] License matches user email:", lgLicense.licenseKey);
        
        // Check for plan in notes
        if (notes.includes('Trial')) {
          plan = 'trial';
          billingType = 'trial';
        } else if (notes.includes('Professional') || notes.includes('- Professional')) {
          plan = 'professional';
        } else if (notes.includes('Enterprise') || notes.includes('- Enterprise')) {
          plan = 'enterprise';
        }
        
        // Check for billing type in notes
        if (notes.includes('Monthly') || notes.includes('- Monthly')) {
          billingType = 'monthly';
        } else if (notes.includes('Yearly') || notes.includes('- Yearly') || 
                  notes.includes('Annual') || notes.includes('- Annual')) {
          billingType = 'annual';
        }
      } else if (lgLicense.plan) {
        // If the license already has plan info (transformed by service)
        plan = lgLicense.plan;
      }
      
      // Check if the license is expired - override isActive flag
      const expiryDate = new Date(lgLicense.expirationDate || lgLicense.expiryDate);
      const now = new Date();
      // If expiry date is in the past, license is not active regardless of the isActive flag
      const isExpired = expiryDate < now;
      const isActive = isExpired ? false : (lgLicense.active || lgLicense.isActive);
      
      // Update existing license or add new one
      if (licensesByKey.has(lgLicense.licenseKey)) {
        licensesByKey.set(lgLicense.licenseKey, {
          ...licensesByKey.get(lgLicense.licenseKey),
          isActive: isActive,
          expiryDate: lgLicense.expirationDate || lgLicense.expiryDate,
          plan,
          billingType,
          isExpired // Add explicit expired flag
        });
      } else {
        licensesByKey.set(lgLicense.licenseKey, {
          id: lgLicense.id || 0,
          userId,
          licenseKey: lgLicense.licenseKey,
          isActive: isActive,
          expiryDate: lgLicense.expirationDate || lgLicense.expiryDate,
          createdAt: lgLicense.createdAt,
          subscriptionId: null,
          plan,
          billingType,
          isExpired // Add explicit expired flag
        });
      }
    }
    
    // Convert map to array
    const mergedLicenses = Array.from(licensesByKey.values());
    console.log("[DEBUG] Merged licenses:", JSON.stringify(mergedLicenses, null, 2));
    
    return res.status(200).json({ 
      success: true, 
      licenses: mergedLicenses || [] 
    });

  } catch (error) {
    console.error("[DEBUG] Error fetching user licenses:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      return res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to fetch user licenses",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }

    // Generic error response
    return res.status(500).json({ 
      success: false, 
      message: "An unexpected error occurred while fetching licenses"
    });
  }
});

router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        error: "Invalid user ID format" 
      });
    }

    const licenses = await storage.getUserLicenses(userId);
    res.json(licenses);
  } catch (error) {
    console.error("Error fetching user licenses:", error);
    res.status(500).json({ 
      error: "Failed to fetch user licenses" 
    });
  }
});

// Get license by key (for LicenseGate API calls)
router.get("/key/:licenseKey", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const licenseKey = req.params.licenseKey;
    console.log("Fetching license by key:", licenseKey);
    
    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        message: "Invalid license key format"
      });
    }

    // Validate the license with LicenseGate API
    const result = await LicenseGateService.validateLicense(licenseKey);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message || "License validation failed"
      });
    }

    res.status(200).json({
      success: true,
      license: result.license
    });
  } catch (error) {
    console.error("Get license by key error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during license validation"
    });
  }
});

export default router; 