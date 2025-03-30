import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

/**
 * Create a PayPal subscription
 */
export async function createSubscription(plan: string, billingType: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/subscriptions/create", { plan, billingType });
    const data = await response.json();
    return data.approvalUrl;
  } catch (error) {
    console.error("Create subscription error:", error);
    toast({
      title: "Subscription creation failed",
      description: "There was an error creating your subscription. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Execute a PayPal subscription after approval
 */
export async function executeSubscription(subscriptionId: string, token: string): Promise<any> {
  try {
    const response = await apiRequest("POST", "/api/subscriptions/execute", { subscriptionId, token });
    const data = await response.json();
    
    toast({
      title: "Subscription activated",
      description: "Your subscription has been successfully activated.",
    });
    
    return data;
  } catch (error) {
    console.error("Execute subscription error:", error);
    toast({
      title: "Subscription activation failed",
      description: "There was an error activating your subscription. Please contact support.",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Cancel a PayPal subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    await apiRequest("POST", `/api/subscriptions/cancel/${subscriptionId}`);
    
    toast({
      title: "Subscription cancelled",
      description: "Your subscription has been cancelled. You'll have access until the end of your billing period.",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    toast({
      title: "Cancellation failed",
      description: "There was an error cancelling your subscription. Please try again or contact support.",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  try {
    const response = await apiRequest("GET", `/api/subscriptions/${subscriptionId}`);
    return response.json();
  } catch (error) {
    console.error("Get subscription details error:", error);
    throw error;
  }
}

/**
 * Get active subscription for current user
 */
export async function getUserSubscription(): Promise<any> {
  try {
    const response = await apiRequest("GET", "/api/subscriptions/user");
    return response.json();
  } catch (error) {
    console.error("Get user subscription error:", error);
    return null;
  }
}
