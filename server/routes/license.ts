import { Router } from "express";
import { generateLicense, generateTrialLicense } from "../controllers/license";
import { requireAuth } from "../middleware/auth";
import { License, User } from "../../shared/schema";
import { storage } from "../storage";
import { Request, Response } from "express";
import { LicenseGateService, LicenseDetails } from "../services/licenseGate";
import axios from "axios";

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
    
    // Get all licenses from LicenseGate API
    let allLicenses = [];
    try {
      // Get API credentials from environment 
      const API_KEY = process.env.LICENSEGATE_API_KEY;
      const API_URL = (process.env.LICENSEGATE_API_URL || "https://api.licensegate.io").replace(/\/+$/, '');
      
      console.log("[DEBUG] Fetching all licenses from LicenseGate API");
      
      // Make direct API call to get all licenses
      const response = await axios.get(`${API_URL}/admin/licenses`, {
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.licenses) {
        allLicenses = response.data.licenses;
        console.log(`[DEBUG] Got ${allLicenses.length} licenses from LicenseGate API`);
      }
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
    
    // Filter licenses by email in notes field
    const userLicenses = [];
    
    for (const license of allLicenses) {
      console.log(`[DEBUG] Processing license: ${license.licenseKey}`);
      console.log(`[DEBUG] License notes: ${license.notes}`);

      // Skip if no notes field
      if (!license.notes) {
        console.log(`[DEBUG] Skipping license ${license.licenseKey} - no notes field`);
        continue;
      }
      
      // Match different email formats in notes
      const emailPatterns = [
        new RegExp(`Email:\\s*${user.email}`, 'i'),
        new RegExp(`Email -\\s*${user.email}`, 'i'),
        new RegExp(`email:\\s*${user.email}`, 'i'),
        new RegExp(`email -\\s*${user.email}`, 'i')
      ];
      
      // Check if any pattern matches
      const matchesUserEmail = emailPatterns.some(pattern => pattern.test(license.notes));
      
      if (!matchesUserEmail) {
        console.log(`[DEBUG] Skipping license ${license.licenseKey} - email doesn't match ${user.email}`);
        continue;
      }
      
      console.log(`[DEBUG] Found matching license for user: ${license.licenseKey}`);
      
      // Extract plan from notes
      let plan = 'standard';
      if (license.notes.includes('Trial')) {
        plan = 'trial';
      } else if (license.notes.includes('Professional')) {
        plan = 'professional';
      } else if (license.notes.includes('Enterprise')) {
        plan = 'enterprise';
      }
      
      // Check expiration status
      const expiryDate = new Date(license.expirationDate);
      const now = new Date();
      const isExpired = now > expiryDate;
      const isActive = isExpired ? false : license.active;
      
      // Create license object with correct format
      const licenseObj = {
        id: license.id,
        licenseKey: license.licenseKey,
        isActive: isActive,
        expiryDate: license.expirationDate,
        subscriptionId: null,
        plan,
        isExpired
      };
      
      userLicenses.push(licenseObj);
      
      // Update map if this license is already there
      if (licensesByKey.has(license.licenseKey)) {
        licensesByKey.set(license.licenseKey, {
          ...licensesByKey.get(license.licenseKey),
          isActive: isActive,
          expiryDate: license.expirationDate,
          plan,
          isExpired
        });
      } else {
        licensesByKey.set(license.licenseKey, licenseObj);
      }
    }
    
    // If we found licenses directly from the API, use those
    // Otherwise fall back to database licenses
    const finalLicenses = userLicenses.length > 0 
      ? userLicenses 
      : Array.from(licensesByKey.values());
    
    console.log("[DEBUG] Returning licenses:", JSON.stringify(finalLicenses, null, 2));
    
    return res.status(200).json({ 
      success: true, 
      licenses: finalLicenses || [] 
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