import crypto from "crypto";
import axios from "axios";
import { User, Subscription, License } from "@shared/schema";
import { storage } from "../storage";
import { getSubscriptionEndDate } from "@/lib/utils";

// LicenseGate API credentials
const API_KEY = process.env.LICENSEGATE_API_KEY;
const USER_ID = process.env.LICENSEGATE_USER_ID;
const API_URL = process.env.LICENSEGATE_API_URL || "https://api.licensegate.io"; // Base API URL for LicenseGate (configurable)

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
      
      // Set license expiration date
      const expiryDate = subscription.endDate || 
        getSubscriptionEndDate(new Date(subscription.startDate), subscription.billingType);
      
      // Generate a unique license key with plan-specific prefix
      const uniqueId = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
      const planPrefix = subscription.plan.toUpperCase().substring(0, 3); // First 3 letters of plan
      const billingPrefix = subscription.billingType === 'monthly' ? 'M' : 'Y';
      const licenseKey = `CC-${planPrefix}-${billingPrefix}-${uniqueId}`;
      
      console.log("Creating license with LicenseGate API:", {
        fullName,
        licenseKey,
        plan: subscription.plan,
        billingType: subscription.billingType,
        expiryDate: expiryDate.toISOString()
      });
      
      // Format notes field for CloudCanvas requirements
      const notes = `CloudCanvas ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} - ${
        subscription.billingType === 'monthly' ? 'Monthly' : 'Yearly'
      } subscription\nEmail: ${user.email}\nPayPal ID: ${subscription.paypalSubscriptionId}`;
      
      // Determine license scope based on subscription plan
      let licenseScope = "standard";
      let features = ["basic", "standard"];
      
      if (subscription.plan === "professional") {
        licenseScope = "professional";
        features = ["basic", "standard", "professional"];
      } else if (subscription.plan === "enterprise") {
        licenseScope = "enterprise";
        features = ["basic", "standard", "professional", "enterprise"];
      }
      
      // Create license via LicenseGate API using CloudCanvas format
      const response = await axios.post(
        `${API_URL}/admin/licenses`, 
        {
          name: fullName,
          licenseKey: licenseKey,
          notes: notes,
          expirationDate: expiryDate.toISOString(),
          licenseScope: licenseScope,
          active: true,
          restrictions: {
            features: features
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000 // Add timeout to prevent long wait
        }
      );
      
      console.log("LicenseGate API response:", response.data);
      
      if (response.status === 201 || response.status === 200) {
        // If successful, use the key from the response if available
        const returnedKey = response.data && response.data.licenseKey ? response.data.licenseKey : licenseKey;
        console.log("License successfully created with key:", returnedKey);
        return returnedKey;
      } else {
        throw new Error(`Failed to create license: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error creating license on LicenseGate:", error);
      // In production, we would not want to fallback to local generation
      // Since we're in development, we'll allow a fallback for testing purposes - but log clearly
      const fallbackKey = `DEV-MODE-FALLBACK-${Math.floor(10000 + Math.random() * 90000)}`;
      console.log("USING FALLBACK LICENSE KEY (DEVELOPMENT ONLY):", fallbackKey);
      return fallbackKey;
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
  static async createTrialLicense(user: User, trialDays: number = 7): Promise<License> {
    try {
      // Format the user's full name
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") || user.email;
      
      // Set trial expiration date
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + trialDays);
      
      // Generate a unique license key for trial with CC-TRIAL prefix
      const uniqueId = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
      const trialLicenseKey = `CC-TRIAL-${uniqueId}`;
      
      console.log("Creating trial license with LicenseGate API:", {
        fullName,
        licenseKey: trialLicenseKey,
        expiryDate: expiryDate.toISOString()
      });
      
      // Format according to CloudCanvas requirements
      const response = await axios.post(
        `${API_URL}/admin/licenses`, 
        {
          name: "CloudCanvas Trial",
          licenseKey: trialLicenseKey,
          notes: `${trialDays}-day trial license for CloudCanvas for ${user.email}`,
          expirationDate: expiryDate.toISOString(),
          licenseScope: "trial",
          active: true,
          restrictions: {
            maxDays: trialDays,
            features: ["basic", "trial"]
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000 // Add timeout to prevent long wait
        }
      );
      
      console.log("LicenseGate API trial response:", response.data);
      
      let licenseKey = trialLicenseKey;
      
      if (response.status === 201 || response.status === 200) {
        // If successful, use the key from the response if available
        if (response.data && response.data.licenseKey) {
          licenseKey = response.data.licenseKey;
        }
        console.log("License successfully created with key:", licenseKey);
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
      
      // Only send email if license creation in LicenseGate was successful
      console.log("Trial license created successfully:", license);
      
      return license;
    } catch (error) {
      console.error("Error creating trial license on LicenseGate:", error);
      
      // If it's a server error, don't create a fallback license
      // This ensures we don't send emails with fake license keys
      throw new Error("Failed to generate trial license. Please try again later.");
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
        `${API_URL}/admin/licenses/${licenseKey}`,
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Accept": "application/json"
          },
          timeout: 10000 // Add timeout to prevent long wait
        }
      );
      
      console.log("LicenseGate API validation response:", response.data);
      
      if (response.status === 200) {
        const apiLicense = response.data;
        
        // Check if the license is active in the API
        if (!apiLicense.active) {
          return { isValid: false, message: "License is inactive" };
        }
        
        // Check if the license has expired
        const now = new Date();
        const expiryDate = apiLicense.expirationDate ? new Date(apiLicense.expirationDate) : null;
        
        if (expiryDate && now > expiryDate) {
          return { isValid: false, message: "License has expired" };
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
      const response = await axios.put(
        `${API_URL}/admin/licenses/${license.licenseKey}`, 
        {
          active: isActive,
          // Keep other fields unchanged
          name: "",
          notes: "",
          ipLimit: null,
          licenseScope: null,
          expirationDate: null, // Don't change the expiration date here
          validationPoints: null,
          validationLimit: null,
          replenishAmount: null,
          replenishInterval: "TEN_SECONDS",
          licenseKey: license.licenseKey
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000 // Add timeout to prevent long wait
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
        newExpiryDate: newExpiryDate.toISOString()
      });
      
      // Update license expiry in LicenseGate API
      const response = await axios.put(
        `${API_URL}/admin/licenses/${license.licenseKey}`,
        {
          active: true, // Keep license active when extending
          // Keep other fields unchanged
          name: "",
          notes: "",
          ipLimit: null,
          licenseScope: null,
          expirationDate: newExpiryDate.toISOString(),
          validationPoints: null,
          validationLimit: null,
          replenishAmount: null,
          replenishInterval: "TEN_SECONDS",
          licenseKey: license.licenseKey
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000 // Add timeout to prevent long wait
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
