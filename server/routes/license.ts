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
      console.error("[DEBUG] No user object in request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Add detailed logging
    console.error("[DEBUG] User object:", {
      id: (req.user as any).id,
      type: typeof (req.user as any).id,
      email: (req.user as any).email,
      fullUser: req.user
    });

    // Get the user ID, ensuring it's a number
    const userId = typeof (req.user as any).id === 'string' 
      ? parseInt((req.user as any).id, 10) 
      : Number((req.user as any).id);
    
    console.error("[DEBUG] Parsed userId:", {
      value: userId,
      type: typeof userId,
      isNaN: isNaN(userId),
      originalValue: (req.user as any).id
    });
    
    if (isNaN(userId)) {
      console.error("[DEBUG] Invalid user ID:", {
        original: (req.user as any).id,
        parsed: userId,
        type: typeof userId,
        userObject: req.user
      });
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    console.error("[DEBUG] Fetching licenses for userId:", userId);
    const licenses = await storage.getUserLicenses(userId);
    console.error("[DEBUG] Found licenses:", {
      count: licenses?.length || 0,
      licenses: licenses?.map(l => ({ id: l.id, userId: l.userId, isActive: l.isActive }))
    });
    
    res.json(licenses || []);
  } catch (error) {
    console.error("[DEBUG] Error fetching user licenses:", error);
    if (error instanceof Error) {
      console.error("[DEBUG] Error details:", {
        message: error.message,
        stack: error.stack
      });
    }
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