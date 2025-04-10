import { Request, Response } from "express";
import { storage } from "../storage";
import { LicenseGateService } from "../services/licenseGate";
import { EmailService } from "../services/email";

// Generate a license key for a subscription
export const generateLicense = async (req: Request, res: Response) => {
  try {
    console.log("License generation - Starting process");
    console.log("API URL check:", process.env.LICENSEGATE_API_URL || "https://api.licensegate.io");
    console.log("API KEY check:", process.env.LICENSEGATE_API_KEY ? "Present (not shown for security)" : "Missing!");
    console.log("USER ID check:", process.env.LICENSEGATE_USER_ID ? "Present (not shown for security)" : "Missing!");
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    const { subscriptionId } = req.body;
    
    console.log("License request for user:", userId, (req.user as any).email);
    console.log("Subscription ID:", subscriptionId);

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID is required"
      });
    }

    // Get the subscription
    const subscription = await storage.getSubscription(parseInt(subscriptionId));
    
    console.log("Subscription found:", !!subscription);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }
    
    console.log("Subscription details:", {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      billingType: subscription.billingType
    });

    // Verify subscription belongs to the user
    if (subscription.userId !== userId) {
      console.log("Subscription belongs to userId:", subscription.userId, "but request is from:", userId);
      return res.status(403).json({
        success: false,
        message: "Unauthorized to generate license for this subscription"
      });
    }

    // Verify subscription is active
    if (subscription.status !== "active") {
      console.log("Subscription status is not active:", subscription.status);
      return res.status(400).json({
        success: false,
        message: "Cannot generate license for inactive subscription"
      });
    }
    
    console.log("Creating license via LicenseGateService...");

    // Create license
    const license = await LicenseGateService.createLicense(req.user as any, subscription);
    
    console.log("License created successfully:", license.licenseKey);

    // Send license key email
    console.log("Sending license key email...");
    await EmailService.sendLicenseKeyEmail(req.user as any, license, subscription);
    console.log("Email sent successfully");

    res.status(201).json({
      success: true,
      message: "License key generated successfully",
      licenseKey: license.licenseKey,
      license
    });
  } catch (error) {
    console.error("Generate license error:", error);
    
    // Add more detailed error logging
    if ((error as any).response) {
      console.error("LicenseGate API error response:", {
        status: (error as any).response.status,
        data: (error as any).response.data,
        headers: (error as any).response.headers
      });
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error during license generation"
    });
  }
};

// Get a specific license
export const getLicense = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    const licenseId = parseInt(req.params.id);

    // Get the license
    const license = await storage.getLicense(licenseId);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: "License not found"
      });
    }

    // Verify license belongs to the user
    if (license.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this license"
      });
    }

    res.status(200).json({
      success: true,
      license
    });
  } catch (error) {
    console.error("Get license error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get all licenses for the current user
export const getUserLicenses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;

    // Get all licenses for the user
    const licenses = await storage.getUserLicenses(userId);
    
    // Always return an array (empty if no licenses)
    res.status(200).json(licenses || []);
  } catch (error) {
    console.error("Get user licenses error:", error);
    // Return empty array instead of error to prevent frontend issues
    res.status(200).json([]);
  }
};

// Deactivate a license
export const deactivateLicense = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    const licenseId = parseInt(req.params.id);

    // Get the license
    const license = await storage.getLicense(licenseId);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: "License not found"
      });
    }

    // Verify license belongs to the user
    if (license.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to deactivate this license"
      });
    }

    // Deactivate the license
    const updatedLicense = await LicenseGateService.updateLicenseStatus(license, false);

    res.status(200).json({
      success: true,
      message: "License deactivated successfully",
      license: updatedLicense
    });
  } catch (error) {
    console.error("Deactivate license error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during license deactivation"
    });
  }
};

// Reactivate a license
export const reactivateLicense = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    const licenseId = parseInt(req.params.id);

    // Get the license
    const license = await storage.getLicense(licenseId);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: "License not found"
      });
    }

    // Verify license belongs to the user
    if (license.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to reactivate this license"
      });
    }

    // Get the associated subscription (if any - trial licenses don't have subscriptions)
    const subscription = license.subscriptionId 
      ? await storage.getSubscription(license.subscriptionId)
      : null;

    // For regular licenses, verify that the subscription is active
    // For trial licenses (null subscriptionId), skip this check
    if (license.subscriptionId && (!subscription || subscription.status !== "active")) {
      return res.status(400).json({
        success: false,
        message: "Cannot reactivate license: associated subscription is not active"
      });
    }

    // For subscription-based licenses, check if the subscription has expired
    if (subscription) {
      const now = new Date();
      const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
      
      if (endDate && now > endDate) {
        return res.status(400).json({
          success: false,
          message: "Cannot reactivate license: associated subscription has expired"
        });
      }
    } else {
      // For trial licenses, check if the trial has expired
      const now = new Date();
      const licenseEndDate = new Date(license.expiryDate);
      
      if (now > licenseEndDate) {
        return res.status(400).json({
          success: false,
          message: "Cannot reactivate license: trial period has expired"
        });
      }
    }

    // Reactivate the license
    const updatedLicense = await LicenseGateService.updateLicenseStatus(license, true);

    res.status(200).json({
      success: true,
      message: "License reactivated successfully",
      license: updatedLicense
    });
  } catch (error) {
    console.error("Reactivate license error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during license reactivation"
    });
  }
};

// Generate a trial license for current user
export const generateTrialLicense = async (req: Request, res: Response) => {
  try {
    console.log("Trial license generation - Starting process");
    console.log("API URL check:", process.env.LICENSEGATE_API_URL || "https://api.licensegate.io");
    console.log("API KEY check:", process.env.LICENSEGATE_API_KEY ? "Present (not shown for security)" : "Missing!");
    console.log("USER ID check:", process.env.LICENSEGATE_USER_ID ? "Present (not shown for security)" : "Missing!");
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    const user = req.user as any;
    
    console.log("Trial license request for user:", userId, user.email);
    
    // Check if user is admin
    const isAdmin = user.email === "dms@live.co.za";
    
    // Only check for existing licenses if not admin
    if (!isAdmin) {
      // Check if user already has any active licenses (including trial licenses)
      const existingLicenses = await storage.getUserLicenses(userId);
      console.log("User existing licenses:", existingLicenses.length, existingLicenses.map(l => ({ id: l.id, isActive: l.isActive, type: l.subscriptionId ? 'paid' : 'trial' })));
      
      const hasActiveLicense = existingLicenses.some(license => license.isActive);
      
      if (hasActiveLicense) {
        console.log("User already has active license - rejecting trial request");
        return res.status(400).json({
          success: false,
          message: "You already have an active license. You cannot create a trial license."
        });
      }

      // Check if user already used a trial before
      const hasUsedTrial = existingLicenses.some(license => 
        license.subscriptionId === null || license.subscriptionId === 0
      );
      
      if (hasUsedTrial) {
        console.log("User already used trial - rejecting trial request");
        return res.status(400).json({
          success: false,
          message: "You have already used your trial license. Only one trial is allowed per account."
        });
      }
    }
    
    console.log("User eligible for trial - proceeding with license creation");
    
    try {
      // Create a trial license with the integrated LicenseGate service
      // Reduced to 7-day trial to match CloudCanvas requirements
      console.log("Calling LicenseGateService.createTrialLicense");
      const trialLicense = await LicenseGateService.createTrialLicense(user, 7); // 7-day trial
      
      console.log("Trial license created successfully:", trialLicense);
      
      // Only send email if license creation was successful
      // Create mock subscription object for email template
      const trialStartDate = new Date(trialLicense.createdAt || new Date());
      const trialEndDate = new Date(trialLicense.expiryDate);
      
      // Send trial license email
      console.log("Sending trial license email to user");
      await EmailService.sendLicenseKeyEmail(
        user, 
        trialLicense, 
        {
          id: 0,
          paypalSubscriptionId: 'TRIAL',
          userId,
          plan: 'trial',
          status: 'active',
          billingType: 'one-time',
          startDate: trialStartDate,
          endDate: trialEndDate,
          createdAt: trialStartDate
        } as any
      );

      console.log("Trial license process complete - returning success response");
      return res.status(201).json({
        success: true,
        message: "Trial license generated successfully",
        licenseKey: trialLicense.licenseKey,
        license: trialLicense
      });
    } catch (err: any) {
      console.error("Error creating trial license:", err);
      if (err.response) {
        console.error("LicenseGate API error response:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to generate trial license. Please try again later."
      });
    }
  } catch (error) {
    console.error("Generate trial license error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during trial license generation"
    });
  }
};
