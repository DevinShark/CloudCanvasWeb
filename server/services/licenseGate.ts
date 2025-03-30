import crypto from "crypto";
import { User, Subscription, License } from "@shared/schema";
import { storage } from "../storage";
import { getSubscriptionEndDate } from "@/lib/utils";

export class LicenseGateService {
  // Generate a unique license key
  static generateLicenseKey(length: number = 32): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let licenseKey = "";
    
    // Generate random bytes
    const randomBytes = crypto.randomBytes(length);
    
    // Convert random bytes to license key format
    for (let i = 0; i < length; i++) {
      const index = randomBytes[i] % chars.length;
      licenseKey += chars.charAt(index);
      
      // Add hyphens for readability
      if ((i + 1) % 4 === 0 && i < length - 1) {
        licenseKey += "-";
      }
    }
    
    return licenseKey;
  }
  
  // Create a new license for a subscription
  static async createLicense(user: User, subscription: Subscription): Promise<License> {
    // Generate a unique license key
    const licenseKey = this.generateLicenseKey();
    
    // Set the expiry date based on subscription end date
    const expiryDate = subscription.endDate || 
      getSubscriptionEndDate(new Date(subscription.startDate), subscription.billingType);
    
    // Create the license in storage
    const license = await storage.createLicense({
      userId: user.id,
      subscriptionId: subscription.id,
      licenseKey,
      isActive: true,
      expiryDate
    });
    
    return license;
  }
  
  // Validate a license key
  static async validateLicense(licenseKey: string): Promise<{ 
    isValid: boolean; 
    message?: string;
    license?: License;
  }> {
    // Find license by key
    const licenses = Array.from((await Promise.all(
      Array.from(Array(1000).keys()).map(i => storage.getLicense(i))
    )).filter(Boolean) as License[]);
    
    const license = licenses.find(l => l.licenseKey === licenseKey);
    
    if (!license) {
      return { isValid: false, message: "Invalid license key" };
    }
    
    if (!license.isActive) {
      return { isValid: false, message: "License is inactive", license };
    }
    
    const now = new Date();
    const expiryDate = new Date(license.expiryDate);
    
    if (now > expiryDate) {
      return { isValid: false, message: "License has expired", license };
    }
    
    return { isValid: true, license };
  }
  
  // Update license status
  static async updateLicenseStatus(license: License, isActive: boolean): Promise<License | undefined> {
    return storage.updateLicense(license.id, { isActive });
  }
  
  // Handle subscription renewal - extend license expiry date
  static async extendLicense(license: License, newExpiryDate: Date): Promise<License | undefined> {
    return storage.updateLicense(license.id, { 
      expiryDate: newExpiryDate,
      isActive: true
    });
  }
}
