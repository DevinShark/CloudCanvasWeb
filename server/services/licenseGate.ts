import crypto from "crypto";
import axios from "axios";
import { User, Subscription, License } from "@shared/schema";
import { storage } from "../storage";
import { getSubscriptionEndDate } from "../lib/utils";

// LicenseGate API credentials
const API_KEY = process.env.LICENSEGATE_API_KEY;
const API_URL = (process.env.LICENSEGATE_API_URL || "https://api.licensegate.io").replace(/\/+$/, ''); // Remove trailing slashes

if (!API_KEY) {
  console.error("LICENSEGATE_API_KEY is not set in environment variables");
}

if (!API_URL) {
  console.error("LICENSEGATE_API_URL is not set in environment variables");
}

// Define a type for the relevant license data we want to send to the frontend
// Modifying to match exactly what the frontend expects
export interface LicenseDetails {
  id: number;
  licenseKey: string;
  isActive: boolean;
  expiryDate: string; // Must be string, not null
  subscriptionId: number | null;
}

export class LicenseGateService {
  private static readonly headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

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

  // Create a license on LicenseGate API - returns the created license key
  static async createLicenseOnLicenseGate(
    user: User,
    subscription: Subscription,
  ): Promise<string> {
    // Format the user's full name
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

    // Set license expiration date
    const expiryDate =
      subscription.endDate ||
      getSubscriptionEndDate(
        new Date(subscription.startDate),
        subscription.billingType,
      );

    // Generate a unique license key with plan-specific prefix
    const uniqueId = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
    const planPrefix = subscription.plan.toUpperCase().substring(0, 3); // First 3 letters of plan
    const billingPrefix = subscription.billingType === "monthly" ? "M" : "Y";
    const licenseKey = `CC-${planPrefix}-${billingPrefix}-${uniqueId}`;

    console.log("Creating license for user:", {
      fullName,
      email: user.email,
      licenseKey,
      plan: subscription.plan,
      billingType: subscription.billingType,
      expiryDate: expiryDate.toISOString(),
    });

    // Check if we have valid API credentials
    if (!API_KEY || !API_URL) {
      console.error("Missing API credentials for LicenseGate");
      throw new Error(
        "LicenseGate API credentials are not configured. Contact administrator.",
      );
    }

    // Format notes field for CloudCanvas requirements
    const notes = `CloudCanvas ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} - ${
      subscription.billingType === "monthly" ? "Monthly" : "Yearly"
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

    try {
      console.log("Connecting to LicenseGate API...");
      // Create license via LicenseGate API using CloudCanvas format
      const response = await axios.post(
        `${API_URL}/admin/licenses`,
        {
          // Payload matching the working Python script
          active: true,
          name: fullName,
          notes: `Plan - ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}\nEmail - ${user.email}`,
          ipLimit: 1,
          licenseScope: licenseScope || "",
          expirationDate: expiryDate.toISOString(),
          validationPoints: 0.0,
          validationLimit: 0,
          replenishAmount: 0,
          replenishInterval: "TEN_SECONDS"
        },
        {
          headers: {
            // Correct Authorization format based on successful test
            Authorization: API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000, // Add timeout to prevent long wait
        },
      );

      console.log("LicenseGate API response:", response.data);

      if (response.status === 201 || response.status === 200) {
        // If successful, use the key from the response if available
        const returnedKey =
          response.data && response.data.licenseKey
            ? response.data.licenseKey
            : licenseKey;
        console.log(
          "License successfully created in LicenseGate with key:",
          returnedKey,
        );
        return returnedKey;
      } else {
        throw new Error(
          `Unexpected response from LicenseGate API: ${response.statusText}`,
        );
      }
    } catch (err) {
      const error = err as any;
      console.error("Error connecting to LicenseGate API:", error);

      if (error.response) {
        console.error("LicenseGate API error response:", {
          status: error.response.status,
          data: error.response.data,
        });

        if (error.response.status === 401) {
          throw new Error(
            "Authentication failed with LicenseGate. Invalid API credentials.",
          );
        }
      }

      // Don't create license if LicenseGate call fails
      throw new Error(
        "Failed to generate license in LicenseGate. Please try again later.",
      );
    }
  }

  // Create a new license for a subscription - only creates after successful LicenseGate creation
  static async createLicense(
    user: User,
    subscription: Subscription,
  ): Promise<License> {
    // Create a license on LicenseGate - this will throw an error if it fails
    const licenseKey = await this.createLicenseOnLicenseGate(
      user,
      subscription,
    );

    // Set the expiry date based on subscription end date
    const expiryDate =
      subscription.endDate ||
      getSubscriptionEndDate(
        new Date(subscription.startDate),
        subscription.billingType,
      );

    try {
      // Create the license in our database ONLY after successful LicenseGate creation
      const license = await storage.createLicense({
        userId: user.id,
        subscriptionId: subscription.id,
        licenseKey,
        isActive: true,
        expiryDate,
      });

      console.log("License created successfully in database:", license);
      return license;
    } catch (storageError) {
      console.error("Error creating license in database:", storageError);
      throw new Error(
        "License was created in LicenseGate but failed to save in database. Please contact support.",
      );
    }
  }

  // Create a trial license via LicenseGate API
  static async createTrialLicense(
    user: User,
    trialDays: number = 7,
  ): Promise<License> {
    try {
      // Check if user already has an active trial license in LicenseGate
      const existingLicenses = await this.getUserLicensesFromLicenseGate(user.email);
      const hasTrialLicense = existingLicenses.some(license => 
        license.isActive && 
        (license.subscriptionId === null || license.subscriptionId === 0)
      );

      if (hasTrialLicense) {
        console.log(`User ${user.email} already has an active trial license, returning existing license`);
        // Get the first active trial license
        const existingTrial = existingLicenses.find(l => l.isActive && (l.subscriptionId === null || l.subscriptionId === 0));
        if (existingTrial) {
          // Return existing trial license info from database
          const existingLicense = await storage.getLicense(existingTrial.id);
          if (existingLicense) {
            console.log("Found existing license in database:", existingLicense.licenseKey);
            return existingLicense;
          }
        }
      }

      // Format the user's full name
      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

      // Set trial expiration date
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + trialDays);

      // Generate a unique license key for trial with CC-TRIAL prefix
      const uniqueId = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
      let trialLicenseKey = `CC-TRIAL-${uniqueId}`;

      console.log("Creating trial license for user:", {
        fullName,
        email: user.email,
        licenseKey: trialLicenseKey,
        expiryDate: expiryDate.toISOString(),
      });

      // Check if we have valid API credentials
      if (!API_KEY || !API_URL) {
        console.error("Missing API credentials for LicenseGate");
        throw new Error(
          "LicenseGate API credentials are not configured. Contact administrator.",
        );
      }

      try {
        console.log("Connecting to LicenseGate API...");
        // Format according to CloudCanvas requirements
        const response = await axios.post(
          `${API_URL}/admin/licenses`,
          {
            active: true,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
            notes: `Plan - Trial\nEmail - ${user.email}`,
            ipLimit: 1,
            licenseScope: "",
            expirationDate: expiryDate.toISOString(),
            validationPoints: 0.0,
            validationLimit: 0,
            replenishAmount: 0,
            replenishInterval: "TEN_SECONDS"
          },
          {
            headers: {
              Authorization: API_KEY,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000, // Add timeout to prevent long wait
          },
        );

        console.log("LicenseGate API trial response:", response.data);

        if (response.status === 201 || response.status === 200) {
          // If successful, use the key from the response if available
          if (response.data && response.data.licenseKey) {
            trialLicenseKey = response.data.licenseKey;
          }
          console.log(
            "License successfully created in LicenseGate with key:",
            trialLicenseKey,
          );

          // Only create the license in our database after successful creation in LicenseGate
          try {
            // Create the license in local storage
            const license = await storage.createLicense({
              userId: user.id,
              subscriptionId: null, // Null for trial licenses
              licenseKey: trialLicenseKey,
              isActive: true,
              expiryDate,
              createdAt: startDate.toISOString(),
            });

            console.log(
              "Trial license created successfully in database:",
              license,
            );
            return license;
          } catch (storageError) {
            console.error(
              "Error creating license in local storage:",
              storageError,
            );
            throw new Error(
              "License was created in LicenseGate but failed to save in database. Please contact support.",
            );
          }
        } else {
          throw new Error(
            `Unexpected response from LicenseGate API: ${response.statusText}`,
          );
        }
      } catch (err) {
        const error = err as any;
        console.error("Error connecting to LicenseGate API:", error);

        if (error.response) {
          console.error("LicenseGate API error response:", {
            status: error.response.status,
            data: error.response.data,
          });

          if (error.response.status === 401) {
            throw new Error(
              "Authentication failed with LicenseGate. Invalid API credentials.",
            );
          }
        }

        // Don't create license if LicenseGate call fails
        throw new Error(
          "Failed to generate license in LicenseGate. Please try again later.",
        );
      }
    } catch (err) {
      const error = err as any;
      console.error("Error creating trial license:", error);
      throw new Error(
        "Failed to create trial license. Please try again later.",
      );
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

      // Check if we have valid API credentials
      if (!API_KEY || !API_URL) {
        console.error("Missing API credentials for LicenseGate");
        throw new Error("LicenseGate API credentials are not configured.");
      }

      // Get license directly by key
      const response = await axios.get(
        `${API_URL}/admin/licenses/key/${licenseKey}`,
        {
          headers: {
            Authorization: API_KEY,
            Accept: "application/json",
          },
          timeout: 10000,
        },
      );

      console.log("LicenseGate API validation response:", response.data);

      if (response.status === 200) {
        const licenseDetails = response.data;

        // Check if the license is active in the API
        if (!licenseDetails.active) {
          return { isValid: false, message: "License is inactive" };
        }

        // Check if the license has expired
        const now = new Date();
        const expiryDate = licenseDetails.expirationDate
          ? new Date(licenseDetails.expirationDate)
          : null;

        if (expiryDate && now > expiryDate) {
          return { isValid: false, message: "License has expired" };
        }

        // Find or update license in local storage
        const storedLicense = await storage.createLicense({
          userId: parseInt(licenseDetails.userId.toString()),
          subscriptionId: null,
          licenseKey: licenseDetails.licenseKey,
          isActive: licenseDetails.active,
          expiryDate: new Date(licenseDetails.expirationDate),
          createdAt: new Date(licenseDetails.createdAt).toISOString(),
        });

        // Return valid with license details
        return { isValid: true, license: storedLicense };
      } else {
        throw new Error("API validation failed");
      }
    } catch (err) {
      const error = err as any;
      console.error("Error validating license with LicenseGate API:", error);

      if (error.response && error.response.status === 401) {
        throw new Error(
          "Authentication failed with LicenseGate. Invalid API credentials.",
        );
      }

      // Fallback to local validation if API fails
      const licenses = Array.from(
        (
          await Promise.all(
            Array.from(Array(1000).keys()).map((i) => storage.getLicense(i)),
          )
        ).filter(Boolean) as License[],
      );

      const license = licenses.find((l) => l.licenseKey === licenseKey);

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
  static async updateLicenseStatus(
    license: License,
    isActive: boolean,
  ): Promise<License | undefined> {
    try {
      console.log("Updating license status with LicenseGate API:", {
        licenseKey: license.licenseKey,
        isActive,
      });

      // Check if we have valid API credentials
      if (!API_KEY || !API_URL) {
        console.error("Missing API credentials for LicenseGate");
        throw new Error("LicenseGate API credentials are not configured.");
      }

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
          licenseKey: license.licenseKey,
        },
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000, // Add timeout to prevent long wait
        },
      );

      console.log("LicenseGate API status update response:", response.data);

      if (response.status !== 200) {
        throw new Error(
          `Failed to update license status: ${response.statusText}`,
        );
      }
    } catch (err) {
      const error = err as any;
      console.error("Error updating license status on LicenseGate:", error);

      if (error.response && error.response.status === 401) {
        throw new Error(
          "Authentication failed with LicenseGate. Invalid API credentials.",
        );
      }

      throw new Error(
        "Failed to update license in LicenseGate. Please try again later.",
      );
    }

    // Update license in local storage
    return storage.updateLicense(license.id, { isActive });
  }

  // Extend license expiry date on LicenseGate API
  static async extendLicense(
    license: License,
    newExpiryDate: Date,
  ): Promise<License | undefined> {
    try {
      console.log("Extending license with LicenseGate API:", {
        licenseKey: license.licenseKey,
        newExpiryDate: newExpiryDate.toISOString(),
      });

      // Check if we have valid API credentials
      if (!API_KEY || !API_URL) {
        console.error("Missing API credentials for LicenseGate");
        throw new Error("LicenseGate API credentials are not configured.");
      }

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
          licenseKey: license.licenseKey,
        },
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000, // Add timeout to prevent long wait
        },
      );

      console.log("LicenseGate API extension response:", response.data);

      if (response.status !== 200) {
        throw new Error(`Failed to extend license: ${response.statusText}`);
      }
    } catch (err) {
      const error = err as any;
      console.error("Error extending license on LicenseGate:", error);

      if (error.response && error.response.status === 401) {
        throw new Error(
          "Authentication failed with LicenseGate. Invalid API credentials.",
        );
      }

      throw new Error(
        "Failed to extend license in LicenseGate. Please try again later.",
      );
    }

    // Update license in local storage
    return storage.updateLicense(license.id, {
      expiryDate: newExpiryDate,
      isActive: true,
    });
  }

  // Fetch licenses from LicenseGate and filter for a specific user by email in notes
  static async getUserLicensesFromLicenseGate(userEmail: string): Promise<LicenseDetails[]> {
    try {
      const response = await axios.get(
        `${API_URL}/admin/licenses/email/${encodeURIComponent(userEmail)}`,
        { headers: this.headers }
      );

      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format from LicenseGate:', response.data);
        return [];
      }

      return response.data.map((license: any) => ({
        id: license.id,
        licenseKey: license.license_key,
        isActive: license.is_active,
        expiryDate: license.expiry_date,
        subscriptionId: license.subscription_id
      }));
    } catch (error) {
      console.error('Error fetching user licenses from LicenseGate:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw new Error('Failed to fetch user licenses');
    }
  }
}