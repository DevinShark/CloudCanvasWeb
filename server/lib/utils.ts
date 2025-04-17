/**
 * Format a date as a human-readable string
 */
export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return "N/A";
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a plan name with proper capitalization and spacing
 */
export function formatPlanName(plan: string): string {
  if (!plan) return "N/A";
  
  // Split by underscore or hyphen and capitalize each word
  const formattedPlan = plan
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return formattedPlan;
}

/**
 * Calculate the end date for a subscription based on its type (monthly/annual)
 */
export function getSubscriptionEndDate(startDate: Date, billingType: string, isTrial: boolean = false): Date {
  const endDate = new Date(startDate);
  
  if (isTrial) {
    // Trial licenses last 30 days regardless of billing type
    endDate.setDate(endDate.getDate() + 30);
  } else if (billingType === "annual") {
    // Annual subscriptions last 1 year
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else { // monthly
    // Monthly subscriptions last 1 month
    endDate.setMonth(endDate.getMonth() + 1);
  }
  
  return endDate;
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  
  return token;
}

/**
 * Get the subscription price based on plan and billing type
 */
export function getSubscriptionPrice(plan: string, billingType: string): number {
  // Price configuration
  const prices = {
    standard: {
      monthly: 75, // $75/month
      annual: 720  // $60/month billed annually ($720/year)
    },
    enterprise: {
      monthly: 300, // $300/month
      annual: 2880  // $240/month billed annually ($2880/year)
    },
    trial: {
      monthly: 0,
      annual: 0
    }
  };
  
  // Default to standard plan if plan not found
  const planPrices = prices[plan as keyof typeof prices] || prices.standard;
  
  // Return price based on billing type
  return planPrices[billingType as keyof typeof planPrices];
}