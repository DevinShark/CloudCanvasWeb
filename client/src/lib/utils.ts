import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to human readable string
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Generate a random string for temporary tokens
 */
export function generateRandomToken(length: number = 32): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Convert plan name to human readable format with extra safety
 */
export function formatPlanName(plan?: string | null): string {
  if (!plan) return "Trial"; // Default to "Trial" if plan is undefined or empty
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

/**
 * Safely get plan name from license object
 * This helps prevent the 'Cannot read properties of undefined' error
 */
export function getLicensePlan(license: any): string {
  if (!license) return "Trial";
  if (!license.plan) return "Trial";
  return license.plan;
}

/**
 * Calculate subscription price
 */
export function getSubscriptionPrice(plan: string, billingType: string): number {
  const prices = {
    standard: {
      monthly: 59,
      annual: 708 // $59 * 12
    },
    professional: {
      monthly: 99,
      annual: 1188 // $99 * 12
    },
    enterprise: {
      monthly: 249,
      annual: 2988 // $249 * 12
    }
  };
  
  return prices[plan as keyof typeof prices]?.[billingType as keyof typeof prices.standard] || 0;
}

/**
 * Get subscription end date
 */
export function getSubscriptionEndDate(startDate: Date, billingType: string): Date {
  const date = new Date(startDate);
  if (billingType === "annual") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(str?: string | null): string {
  if (!str) return ""; // Return empty string if input is null or undefined
  return str.charAt(0).toUpperCase() + str.slice(1);
}
