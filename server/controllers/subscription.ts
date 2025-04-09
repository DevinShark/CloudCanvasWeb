import { Request, Response } from "express";
import { storage } from "../storage";
import { PayPalService } from "../services/paypal";
import { LicenseGateService } from "../services/licenseGate";
import { EmailService } from "../services/email";
import { getSubscriptionEndDate } from "../lib/utils";

// Create a new subscription
export const createSubscription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { plan, billingType } = req.body;

    // Validate plan and billing type
    if (!plan || !["standard", "professional", "enterprise"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type"
      });
    }

    if (!billingType || !["monthly", "annual"].includes(billingType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing type"
      });
    }

    // Create PayPal subscription
    const paypalSubscription = await PayPalService.createSubscription(
      req.user as any,
      plan,
      billingType
    );

    res.status(200).json({
      success: true,
      message: "Subscription created successfully",
      subscriptionId: paypalSubscription.id,
      approvalUrl: paypalSubscription.approvalUrl
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during subscription creation"
    });
  }
};

// Execute a subscription after PayPal approval
export const executeSubscription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { subscriptionId, token } = req.body;

    if (!subscriptionId || !token) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID and token are required"
      });
    }

    // Check if subscription already exists
    const existingSubscription = await storage.getSubscriptionByPaypalId(subscriptionId);
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "Subscription has already been executed"
      });
    }

    // Get PayPal subscription details to determine plan and billing type
    const paypalDetails = await PayPalService.getSubscriptionDetails(subscriptionId);
    const planName = paypalDetails.plan?.product_id?.toLowerCase().includes('professional') 
      ? 'professional' 
      : paypalDetails.plan?.product_id?.toLowerCase().includes('enterprise') 
        ? 'enterprise' 
        : 'standard';
    
    const billingType = paypalDetails.billing_info?.cycle_executions?.[0]?.tenure_type?.toLowerCase() === 'year' 
      ? 'annual' 
      : 'monthly';

    // Execute subscription
    const subscription = await PayPalService.executeSubscription(
      req.user as any,
      subscriptionId,
      planName,
      billingType
    );

    // Generate license key
    const license = await LicenseGateService.createLicense(req.user as any, subscription);

    // Send confirmation emails
    await EmailService.sendSubscriptionConfirmationEmail(req.user as any, subscription);
    await EmailService.sendLicenseKeyEmail(req.user as any, license, subscription);

    res.status(200).json({
      success: true,
      message: "Subscription executed successfully",
      subscription,
      license
    });
  } catch (error) {
    console.error("Execute subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during subscription execution"
    });
  }
};

// Cancel a subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    const subscriptionId = parseInt(req.params.id);

    if (isNaN(subscriptionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    // Get subscription from storage
    const subscription = await storage.getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Verify subscription belongs to the user
    if (subscription.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this subscription"
      });
    }

    // Cancel subscription in PayPal
    await PayPalService.cancelSubscription(
      subscription.paypalSubscriptionId,
      "Cancelled by user"
    );

    // Update subscription status in storage
    const updatedSubscription = await storage.updateSubscription(subscription.id, {
      status: "cancelled"
    });

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during subscription cancellation"
    });
  }
};

// Get a specific subscription
export const getSubscription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    const subscriptionId = parseInt(req.params.id);

    if (isNaN(subscriptionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    // Get subscription from storage
    const subscription = await storage.getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Verify subscription belongs to the user
    if (subscription.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this subscription"
      });
    }

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get all subscriptions for the current user
export const getUserSubscriptions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    if (typeof userId !== 'number' || isNaN(userId)) {
      console.error("Invalid userId:", userId);
      return res.status(400).json({ success: false, message: "Invalid user identifier" });
    }

    // Get all subscriptions for the user
    const subscriptions = await storage.getUserSubscriptions(userId);

    // Find the most recent active subscription (if any)
    const activeSubscription = subscriptions
      .filter(sub => sub.status === "active" && sub.id && !isNaN(sub.id))
      .sort((a, b) => {
        // Ensure dates are valid before comparing
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        // Handle potential NaN from invalid dates
        if (isNaN(dateA) || isNaN(dateB)) {
          console.warn("Invalid date encountered during subscription sort", { a, b });
          return 0; // Maintain original order if dates are invalid
        }
        return dateB - dateA; // Sort descending by start date
      })[0]; // Get the first element (most recent)

    let detailedSubscription = null;
    if (activeSubscription && activeSubscription.id && !isNaN(activeSubscription.id)) {
      try {
        // Fetch detailed information ONLY if we have a valid active subscription ID
        detailedSubscription = await storage.getSubscription(activeSubscription.id);
      } catch (detailError) {
        console.error(`Error fetching details for active subscription ID ${activeSubscription.id}:`, detailError);
        // Proceed without detailed info if fetching fails, but log the error
      }
    }

    // Return the active subscription details if available, otherwise the full list (or null if empty)
    if (detailedSubscription) {
       res.status(200).json({
         success: true,
         activeSubscription: detailedSubscription, // Send detailed active one if found
         allSubscriptions: subscriptions // Optionally include all for history
       });
    } else if (subscriptions.length > 0) {
       res.status(200).json({
         success: true,
         activeSubscription: null, // Explicitly null if no active one found/detailed fetch failed
         allSubscriptions: subscriptions // Send the full list
       });
    } else {
      // No subscriptions found at all
      res.status(200).json({
        success: true,
        activeSubscription: null,
        allSubscriptions: [] // Send empty array
      });
    }

  } catch (error) {
    console.error("Get user subscriptions error:", error);
    // Check if it's the specific NaN error we identified
    if (error instanceof Error && error.message.includes('invalid input syntax for type integer: "NaN"')) {
        return res.status(500).json({
            success: false,
            message: "Server error retrieving subscription details due to invalid ID."
        });
    }
    res.status(500).json({
      success: false,
      message: "Server error retrieving subscriptions"
    });
  }
};
