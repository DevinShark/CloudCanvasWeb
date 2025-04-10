import { Router } from "express";
import { generateLicense, generateTrialLicense } from "../controllers/license";
import { requireAuth } from "../middleware/auth";
import { License } from "@shared/schema";
import { storage } from "../storage";
import { User } from "@shared/schema";

const router = Router();

// Generate a license key for a subscription
router.post("/generate", requireAuth, generateLicense);

// Generate a trial license
router.post("/trial", requireAuth, generateTrialLicense);

// Get user's licenses
router.get("/user", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Get the user ID, ensuring it's a number
    const userId = typeof (req.user as any).id === 'string' 
      ? parseInt((req.user as any).id, 10) 
      : Number((req.user as any).id);
    
    if (isNaN(userId)) {
      console.error("Invalid user ID:", (req.user as any).id);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const licenses = await storage.getUserLicenses(userId);
    res.json(licenses || []);
  } catch (error) {
    console.error("Error fetching user licenses:", error);
    res.status(200).json([]);
  }
});

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
    console.error("Error fetching user licenses from DB:", error);
    
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

export default router; 