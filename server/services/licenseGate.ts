import crypto from "crypto";
import axios from "axios";
import { User, Subscription, License } from "@shared/schema";
import { storage } from "../storage";
import { getSubscriptionEndDate } from "@/lib/utils";

// LicenseGate API credentials
const API_KEY = process.env.LICENSEGATE_API_KEY;
const USER_ID = process.env.LICENSEGATE_USER_ID;
const API_URL = "https://api.licensegate.com/v1"; // Base API URL for LicenseGate

export class LicenseGateService {
  // Generate a unique license key locally (backup if API fails)
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
  
  // Create a license on LicenseGate
  static async createLicenseOnLicenseGate(
    user: User, 
    subscription: Subscription
  ): Promise<string> {
    try {
      // Format the user's full name
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") || user.email;
      
      // Format plan details for the Notes field
      const planInfo = `Plan - ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
Billing - ${subscription.billingType.charAt(0).toUpperCase() + subscription.billingType.slice(1)}
Email - ${user.email}`;
      
      // Set license expiration date
      const expiryDate = subscription.endDate || 
        getSubscriptionEndDate(new Date(subscription.startDate), subscription.billingType);
      
      console.log("Creating license with LicenseGate API:", {
        fullName,
        planInfo,
        expiryDate: expiryDate.toISOString().split("T")[0]
      });
      
      // Create license via LicenseGate API
      const response = await axios.post(
        `${API_URL}/key/generate`, 
        {
          customer_name: fullName,
          customer_email: user.email,
          notes: planInfo,
          expires_at: expiryDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
          product_id: USER_ID // Using the user ID as the product ID
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      console.log("LicenseGate API response:", response.data);
      
      if (response.status === 201 || response.status === 200) {
        return response.data.key; // Using the correct field name for license key
      } else {
        throw new Error(`Failed to create license: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error creating license on LicenseGate:", error);
      // Fallback to local generation if API fails
      return this.generateLicenseKey();
    }
  }
  
  // Create a new license for a subscription
  static async createLicense(user: User, subscription: Subscription): Promise<License> {
    // Create a license on LicenseGate
    const licenseKey = await this.createLicenseOnLicenseGate(user, subscription);
    
    // Set the expiry date based on subscription end date
    const expiryDate = subscription.endDate || 
      getSubscriptionEndDate(new Date(subscription.startDate), subscription.billingType);
    
    // Create the license in local storage
    const license = await storage.createLicense({
      userId: user.id,
      subscriptionId: subscription.id,
      licenseKey,
      isActive: true,
      expiryDate
    });
    
    return license;
  }
  
  // Create a trial license via LicenseGate API
  static async createTrialLicense(user: User, trialDays: number = 30): Promise<License> {
    try {
      // Format the user's full name
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") || user.email;
      
      // Format plan details for the Notes field
      const planInfo = `Plan - Trial
Billing - One-time
Email - ${user.email}`;
      
      // Set trial expiration date
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + trialDays);
      
      console.log("Creating trial license with LicenseGate API:", {
        fullName,
        planInfo,
        expiryDate: expiryDate.toISOString().split("T")[0]
      });
      
      // Create trial license via LicenseGate API
      const response = await axios.post(
        `${API_URL}/key/generate`, 
        {
          customer_name: fullName,
          customer_email: user.email,
          notes: planInfo,
          expires_at: expiryDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
          product_id: USER_ID, // Using the user ID as the product ID
          meta: {
            is_trial: true,
            trial_days: trialDays
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      console.log("LicenseGate API trial response:", response.data);
      
      let licenseKey = "";
      
      if (response.status === 201 || response.status === 200) {
        licenseKey = response.data.key; // Using the correct field name for license key
      } else {
        throw new Error(`Failed to create trial license: ${response.statusText}`);
      }
      
      // Create the license in local storage
      const license = await storage.createLicense({
        userId: user.id,
        subscriptionId: null, // Null for trial licenses
        licenseKey,
        isActive: true,
        expiryDate,
        createdAt: startDate.toISOString()
      });
      
      return license;
    } catch (error) {
      console.error("Error creating trial license on LicenseGate:", error);
      
      // Fallback to local generation if API fails
      const licenseKey = this.generateLicenseKey();
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + trialDays);
      
      // Create the license in local storage with fallback key
      const license = await storage.createLicense({
        userId: user.id,
        subscriptionId: null, // Null for trial licenses
        licenseKey,
        isActive: true,
        expiryDate,
        createdAt: startDate.toISOString()
      });
      
      return license;
    }
  }
  
  // Validate a license key with LicenseGate API
  static async validateLicense(licenseKey: string): Promise<{ 
    isValid: boolean; 
    message?: string;
    license?: License;
  }> {
    try {
      console.log("Validating license with LicenseGate API:", licenseKey);
      
      // Try to validate with the LicenseGate API first
      const response = await axios.get(
        `${API_URL}/key/validate/${licenseKey}`,
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Accept": "application/json"
          }
        }
      );
      
      console.log("LicenseGate API validation response:", response.data);
      
      if (response.status === 200) {
        const apiLicense = response.data;
        
        // Check the status from the API - valid is true/false in the response
        if (!apiLicense.valid) {
          return { isValid: false, message: apiLicense.message || "License is invalid" };
        }
        
        // If valid in API, find in our local storage
        const licenses = Array.from((await Promise.all(
          Array.from(Array(1000).keys()).map(i => storage.getLicense(i))
        )).filter(Boolean) as License[]);
        
        const license = licenses.find(l => l.licenseKey === licenseKey);
        
        // Return valid with local license if found
        if (license) {
          return { isValid: true, license };
        }
        
        return { isValid: true, message: "Valid license, but not found in local storage" };
      } else {
        throw new Error("API validation failed");
      }
    } catch (error) {
      console.error("Error validating license with LicenseGate API:", error);
      
      // Fallback to local validation if API fails
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
  }
  
  // Update license status on LicenseGate API
  static async updateLicenseStatus(license: License, isActive: boolean): Promise<License | undefined> {
    try {
      console.log("Updating license status with LicenseGate API:", {
        licenseKey: license.licenseKey,
        isActive
      });
      
      // Update license status in LicenseGate API
      const response = await axios.post(
        `${API_URL}/key/update/${license.licenseKey}`,
        {
          status: isActive ? "active" : "inactive"
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      console.log("LicenseGate API status update response:", response.data);
      
      if (response.status !== 200) {
        throw new Error(`Failed to update license status: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating license status on LicenseGate:", error);
      // Continue with local update even if API fails
    }
    
    // Update license in local storage
    return storage.updateLicense(license.id, { isActive });
  }
  
  // Extend license expiry date on LicenseGate API
  static async extendLicense(license: License, newExpiryDate: Date): Promise<License | undefined> {
    try {
      console.log("Extending license with LicenseGate API:", {
        licenseKey: license.licenseKey,
        newExpiryDate: newExpiryDate.toISOString().split("T")[0]
      });
      
      // Update license expiry in LicenseGate API
      const response = await axios.post(
        `${API_URL}/key/update/${license.licenseKey}`,
        {
          expires_at: newExpiryDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
          status: "active"
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      console.log("LicenseGate API extension response:", response.data);
      
      if (response.status !== 200) {
        throw new Error(`Failed to extend license: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error extending license on LicenseGate:", error);
      // Continue with local update even if API fails
    }
    
    // Update license in local storage
    return storage.updateLicense(license.id, { 
      expiryDate: newExpiryDate,
      isActive: true
    });
  }
}
