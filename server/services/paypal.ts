import fetch from "node-fetch";
import { User, Subscription } from "@shared/schema";
import { storage } from "../storage";
import { getSubscriptionEndDate, getSubscriptionPrice } from "@/lib/utils";

// PayPal API configuration
const PAYPAL_API = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "sandbox_client_id";
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || "sandbox_secret";
const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5000";

export class PayPalService {
  // Get access token for PayPal API
  static async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
      
      const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${auth}`
        },
        body: "grant_type=client_credentials"
      });
      
      const data = await response.json() as { access_token: string };
      
      if (!response.ok) {
        throw new Error(`PayPal OAuth error: ${JSON.stringify(data)}`);
      }
      
      return data.access_token;
    } catch (error) {
      console.error("PayPal getAccessToken error:", error);
      throw new Error("Failed to authenticate with PayPal");
    }
  }
  
  // Create a subscription in PayPal
  static async createSubscription(
    user: User, 
    plan: string, 
    billingType: string
  ): Promise<{ id: string; approvalUrl: string }> {
    try {
      const accessToken = await this.getAccessToken();
      const productName = `Cloud Canvas ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
      const amount = getSubscriptionPrice(plan, billingType);
      
      // Determine billing cycle interval
      const billingInterval = billingType === "annual" ? "YEAR" : "MONTH";
      const billingIntervalCount = 1;
      
      // Create a product
      const productResponse = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: productName,
          type: "SERVICE",
          description: `Cloud Canvas ${plan} subscription - ${billingType} billing`
        })
      });
      
      const productData = await productResponse.json() as { id: string };
      
      if (!productResponse.ok) {
        throw new Error(`PayPal product creation error: ${JSON.stringify(productData)}`);
      }
      
      // Create a plan for the product
      const planResponse = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          product_id: productData.id,
          name: `${productName} ${billingType.charAt(0).toUpperCase() + billingType.slice(1)} Plan`,
          billing_cycles: [
            {
              frequency: {
                interval_unit: billingInterval,
                interval_count: billingIntervalCount
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: 0, // Infinite cycles
              pricing_scheme: {
                fixed_price: {
                  value: amount.toString(),
                  currency_code: "USD"
                }
              }
            }
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: {
              value: "0",
              currency_code: "USD"
            },
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3
          }
        })
      });
      
      const planData = await planResponse.json() as { id: string };
      
      if (!planResponse.ok) {
        throw new Error(`PayPal plan creation error: ${JSON.stringify(planData)}`);
      }
      
      // Create a subscription with the plan
      const subscriptionResponse = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "PayPal-Request-Id": `${user.id}-${Date.now()}`
        },
        body: JSON.stringify({
          plan_id: planData.id,
          application_context: {
            brand_name: "Cloud Canvas",
            locale: "en-US",
            shipping_preference: "NO_SHIPPING",
            user_action: "SUBSCRIBE_NOW",
            payment_method: {
              payer_selected: "PAYPAL",
              payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
            },
            return_url: `${BASE_URL}/success?subscription_id={id}`,
            cancel_url: `${BASE_URL}/#pricing`
          },
          subscriber: {
            name: {
              given_name: user.firstName || "",
              surname: user.lastName || ""
            },
            email_address: user.email
          }
        })
      });
      
      const subscriptionData = await subscriptionResponse.json() as { 
        id: string; 
        links: Array<{ rel: string; href: string }> 
      };
      
      if (!subscriptionResponse.ok) {
        throw new Error(`PayPal subscription creation error: ${JSON.stringify(subscriptionData)}`);
      }
      
      // Get the approval URL from the response links
      const approvalUrl = subscriptionData.links.find(link => link.rel === "approve")?.href;
      
      if (!approvalUrl) {
        throw new Error("PayPal approval URL not found in response");
      }
      
      return {
        id: subscriptionData.id,
        approvalUrl
      };
    } catch (error) {
      console.error("PayPal createSubscription error:", error);
      throw new Error("Failed to create PayPal subscription");
    }
  }
  
  // Get subscription details from PayPal
  static async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`PayPal subscription details error: ${JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      console.error("PayPal getSubscriptionDetails error:", error);
      throw new Error("Failed to get PayPal subscription details");
    }
  }
  
  // Cancel a subscription in PayPal
  static async cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reason
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`PayPal subscription cancellation error: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("PayPal cancelSubscription error:", error);
      throw new Error("Failed to cancel PayPal subscription");
    }
  }
  
  // Execute subscription after approval
  static async executeSubscription(
    user: User,
    subscriptionId: string,
    plan: string,
    billingType: string
  ): Promise<Subscription> {
    try {
      // Get subscription details from PayPal
      const paypalSubscription = await this.getSubscriptionDetails(subscriptionId);
      
      // Calculate subscription dates
      const startDate = new Date();
      
      // Create subscription in storage
      const subscription = await storage.createSubscription({
        userId: user.id,
        paypalSubscriptionId: subscriptionId,
        plan,
        status: "active",
        billingType,
        startDate,
        endDate: getSubscriptionEndDate(startDate, billingType)
      });
      
      return subscription;
    } catch (error) {
      console.error("PayPal executeSubscription error:", error);
      throw new Error("Failed to execute subscription");
    }
  }
}
