// Feature types
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  detailContent?: string;
}

export interface WorkflowStep {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface Application {
  id: string;
  title: string;
  description: string;
  link?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isPopular?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

// Form types
export interface DemoRequestFormData {
  fullName: string;
  email: string;
  company: string;
  industry: string;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// User types
export interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

// Subscription types
export interface SubscriptionDetails {
  id: number;
  paypalSubscriptionId: string;
  plan: string;
  status: string;
  billingType: string;
  startDate: string;
  endDate?: string;
}

// License types
export interface LicenseDetails {
  id: number;
  licenseKey: string;
  isActive: boolean;
  expiryDate: string;
  subscriptionId: number;
}
