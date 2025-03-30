import { Request, Response } from "express";
import { storage } from "../storage";
import { PayPalService } from "../services/paypal";
import { LicenseGateService } from "../services/licenseGate";
import { EmailService } from "../services/email";
import { getSubscriptionEndDate } from "@/lib/utils";

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
    const subscriptionId = req.params.id;

    // Get subscription from storage
    const subscription = await storage.getSubscription(parseInt(subscriptionId));

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

    // Get all subscriptions for the user, prioritizing active ones
    const subscriptions = await storage.getUserSubscriptions(userId);
    
    // Get the most recent active subscription
    const activeSubscription = subscriptions
      .filter(sub => sub.status === "active")
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

    if (activeSubscription) {
      return res.status(200).json(activeSubscription);
    }

    // If no active subscription, return the most recent one
    const mostRecentSubscription = subscriptions
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

    res.status(200).json(mostRecentSubscription || null);
  } catch (error) {
    console.error("Get user subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
