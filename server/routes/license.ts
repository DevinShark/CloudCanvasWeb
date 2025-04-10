import { Router } from "express";
import { generateLicense, generateTrialLicense } from "../controllers/license";
import { requireAuth } from "../middleware/auth";
import { License, User } from "../../shared/schema";
import { storage } from "../storage";
import { Request, Response } from "express";
import { LicenseGateService } from "../services/licenseGate";

const router = Router();

// Generate a license key for a subscription
router.post("/generate", requireAuth, generateLicense);

// Generate a trial license
router.post("/trial", requireAuth, generateTrialLicense);

// Get licenses for the currently logged-in user
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = req.user as User | undefined; 

    if (!user || !user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated or ID missing." 
      });
    }

    const userId = user.id;
    const licenses: License[] = await storage.getUserLicenses(userId);
    
    return res.status(200).json({ 
      success: true, 
      licenses: licenses || [] 
    });

  } catch (error) {
    console.error("[DEBUG] Error fetching user licenses from DB:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      return res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to fetch user licenses from DB",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }

    // Generic error response
    return res.status(500).json({ 
      success: false, 
      message: "An unexpected error occurred while fetching licenses from DB"
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