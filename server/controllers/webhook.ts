import { Request, Response } from "express";
import crypto from "crypto";
import { storage } from "../storage";
import { LicenseGateService } from "../services/licenseGate";
import { EmailService } from "../services/email";
import { getSubscriptionEndDate } from "../lib/utils";

// PayPal webhook secret
const WEBHOOK_SECRET = process.env.PAYPAL_WEBHOOK_SECRET || "";

// Verify PayPal webhook signature
function verifyWebhookSignature(requestBody: string, headers: any): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("PayPal webhook secret not configured, skipping signature verification");
    return true; // Skip verification in development
  }

  try {
    // Extract PayPal headers
    const transmissionId = headers["paypal-transmission-id"];
    const transmissionTime = headers["paypal-transmission-time"];
    const transmissionSig = headers["paypal-transmission-sig"];
    const certUrl = headers["paypal-cert-url"];
    const authAlgo = headers["paypal-auth-algo"];
    
    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
      console.error("Missing required PayPal headers for webhook verification");
      return false;
    }
    
    // Create the validation string according to PayPal's documentation
    // https://developer.paypal.com/api/rest/webhooks/payment-webhooks/
    const validationStr = transmissionId + "|" + transmissionTime + "|" + WEBHOOK_SECRET + "|" + requestBody;
    
    // Create the hash
    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    hmac.update(validationStr);
    const expectedSignature = hmac.digest("base64");
    
    // Compare signatures
    const result = expectedSignature === transmissionSig;
    
    if (!result) {
      console.error("Webhook signature validation failed");
      console.error("Expected:", expectedSignature);
      console.error("Received:", transmissionSig);
    }
    
    return result;
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return false;
  }
}

// Handle PayPal webhook events
export const handlePayPalWebhook = async (req: Request, res: Response) => {
  try {
    // Log receipt of webhook
    console.log("Received PayPal webhook:", req.body.event_type);
    console.log("Headers:", req.headers);
    
    // Get the raw request body for signature verification
    const rawBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const isVerified = verifyWebhookSignature(rawBody, req.headers);
    
    if (!isVerified && process.env.NODE_ENV === 'production') {
      console.error("Invalid webhook signature");
      return res.status(403).json({
        success: false,
        message: "Invalid webhook signature"
      });
    }
    
    // Process the event even if signature fails in development mode
    if (!isVerified) {
      console.warn("Webhook signature verification failed, but processing anyway in development mode");
    }
    
    const event = req.body;
    const eventType = event.event_type;
    
    console.log("Processing PayPal webhook event:", eventType);
    
    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
        // New subscription created - already handled in executeSubscription
        break;
        
      case "PAYMENT.SALE.COMPLETED":
        // Payment processed successfully
        await handlePaymentCompleted(event);
        break;
        
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        // Payment failed
        await handlePaymentFailed(event);
        break;
        
      case "BILLING.SUBSCRIPTION.CANCELLED":
        // Subscription cancelled
        await handleSubscriptionCancelled(event);
        break;
        
      case "BILLING.SUBSCRIPTION.EXPIRED":
        // Subscription expired
        await handleSubscriptionExpired(event);
        break;
        
      case "BILLING.SUBSCRIPTION.UPDATED":
        // Subscription updated
        await handleSubscriptionUpdated(event);
        break;
    }
    
    // Return 200 to acknowledge receipt of the event
    res.status(200).json({
      success: true,
      message: "Webhook received"
    });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing webhook"
    });
  }
};

// Handle payment completed event
async function handlePaymentCompleted(event: any) {
  try {
    console.log("Processing PAYMENT.SALE.COMPLETED event with resource:", event.resource);
    
    // Extract subscription ID from the event
    const resource = event.resource;
    const subscriptionId = resource.billing_agreement_id;
    
    if (!subscriptionId) {
      console.error("No subscription ID in payment completed event");
      return;
    }
    
    console.log("Processing payment for subscription:", subscriptionId);
    
    // Find the subscription in our database
    const subscription = await storage.getSubscriptionByPaypalId(subscriptionId);
    
    if (!subscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }
    
    console.log("Found subscription:", subscription.id);
    
    // Find the user
    const user = await storage.getUser(subscription.userId);
    
    if (!user) {
      console.error("User not found for subscription:", subscription.userId);
      return;
    }
    
    // Find the associated license
    const licenses = await storage.getUserLicenses(user.id);
    const license = licenses.find(l => l.subscriptionId === subscription.id);
    
    if (!license) {
      console.error("No license found for subscription:", subscription.id);
      
      // If no license is found but we have a valid subscription and user,
      // create a new license for them
      console.log("Creating new license for subscription:", subscription.id);
      try {
        const newLicense = await LicenseGateService.createLicense(user, subscription);
        console.log("Created new license successfully:", newLicense.id);
        return;
      } catch (licenseError) {
        console.error("Failed to create new license:", licenseError);
        return;
      }
    }
    
    console.log("Found license:", license.id);
    
    // Calculate new expiry date based on the subscription billing type
    const currentExpiryDate = new Date(license.expiryDate);
    let newExpiryDate: Date;
    
    if (subscription.billingType === "monthly") {
      newExpiryDate = new Date(currentExpiryDate);
      newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
    } else { // annual
      newExpiryDate = new Date(currentExpiryDate);
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    }
    
    console.log("Extending license expiry from:", currentExpiryDate, "to:", newExpiryDate);
    
    // Extend the license in LicenseGate and our database
    await LicenseGateService.extendLicense(license, newExpiryDate);
    
    // Update the subscription end date
    await storage.updateSubscription(subscription.id, {
      endDate: newExpiryDate
    });
    
    console.log("License and subscription extended successfully");
    
    // Send renewal email notification
    await EmailService.sendLicenseRenewalEmail(user, license, subscription);
    
    console.log("Renewal email sent");
  } catch (error) {
    console.error("Error handling payment completed:", error);
  }
}

// Handle payment failed event
async function handlePaymentFailed(event: any) {
  try {
    // Extract subscription ID from the event
    const resource = event.resource;
    const subscriptionId = resource.id;
    
    if (!subscriptionId) {
      console.error("No subscription ID in payment failed event");
      return;
    }
    
    console.log("Processing payment failure for subscription:", subscriptionId);
    
    // Find the subscription in our database
    const subscription = await storage.getSubscriptionByPaypalId(subscriptionId);
    
    if (!subscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }
    
    // Find the user
    const user = await storage.getUser(subscription.userId);
    
    if (!user) {
      console.error("User not found for subscription:", subscription.userId);
      return;
    }
    
    // Find the associated license
    const licenses = await storage.getUserLicenses(user.id);
    const license = licenses.find(l => l.subscriptionId === subscription.id);
    
    if (!license) {
      console.error("No license found for subscription:", subscription.id);
      return;
    }
    
    // Send payment failure email
    await EmailService.sendPaymentFailureEmail(user, subscription);
    
    console.log("Payment failure email sent");
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

// Handle subscription cancelled event
async function handleSubscriptionCancelled(event: any) {
  try {
    // Extract subscription ID from the event
    const resource = event.resource;
    const subscriptionId = resource.id;
    
    if (!subscriptionId) {
      console.error("No subscription ID in subscription cancelled event");
      return;
    }
    
    console.log("Processing cancellation for subscription:", subscriptionId);
    
    // Find the subscription in our database
    const subscription = await storage.getSubscriptionByPaypalId(subscriptionId);
    
    if (!subscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }
    
    // Update subscription status
    await storage.updateSubscription(subscription.id, {
      status: "cancelled"
    });
    
    // Find the user
    const user = await storage.getUser(subscription.userId);
    
    if (!user) {
      console.error("User not found for subscription:", subscription.userId);
      return;
    }
    
    // Find the associated license
    const licenses = await storage.getUserLicenses(user.id);
    const license = licenses.find(l => l.subscriptionId === subscription.id);
    
    if (!license) {
      console.error("No license found for subscription:", subscription.id);
      return;
    }
    
    // Send cancellation email
    await EmailService.sendSubscriptionCancellationEmail(user, subscription);
    
    console.log("Cancellation email sent");
  } catch (error) {
    console.error("Error handling subscription cancelled:", error);
  }
}

// Handle subscription expired event
async function handleSubscriptionExpired(event: any) {
  try {
    // Extract subscription ID from the event
    const resource = event.resource;
    const subscriptionId = resource.id;
    
    if (!subscriptionId) {
      console.error("No subscription ID in subscription expired event");
      return;
    }
    
    console.log("Processing expiration for subscription:", subscriptionId);
    
    // Find the subscription in our database
    const subscription = await storage.getSubscriptionByPaypalId(subscriptionId);
    
    if (!subscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }
    
    // Update subscription status
    await storage.updateSubscription(subscription.id, {
      status: "expired"
    });
    
    // Find the user
    const user = await storage.getUser(subscription.userId);
    
    if (!user) {
      console.error("User not found for subscription:", subscription.userId);
      return;
    }
    
    // Find the associated license
    const licenses = await storage.getUserLicenses(user.id);
    const license = licenses.find(l => l.subscriptionId === subscription.id);
    
    if (!license) {
      console.error("No license found for subscription:", subscription.id);
      return;
    }
    
    // Deactivate the license
    await LicenseGateService.updateLicenseStatus(license, false);
    
    // Send expiration email
    await EmailService.sendSubscriptionExpiredEmail(user, subscription);
    
    console.log("Expiration email sent");
  } catch (error) {
    console.error("Error handling subscription expired:", error);
  }
}

// Handle subscription updated event
async function handleSubscriptionUpdated(event: any) {
  try {
    // Extract subscription ID from the event
    const resource = event.resource;
    const subscriptionId = resource.id;
    
    if (!subscriptionId) {
      console.error("No subscription ID in subscription updated event");
      return;
    }
    
    console.log("Processing update for subscription:", subscriptionId);
    
    // Find the subscription in our database
    const subscription = await storage.getSubscriptionByPaypalId(subscriptionId);
    
    if (!subscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }
    
    // Update subscription plan if changed
    // This would require additional logic to determine the new plan and billing type
    // from the PayPal event data
    
    console.log("Subscription updated successfully");
  } catch (error) {
    console.error("Error handling subscription updated:", error);
  }
}