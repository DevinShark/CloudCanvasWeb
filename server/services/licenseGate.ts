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
    console.log("Trial license generation - Starting process");

    // Basic checks
    console.log("API URL check:", API_URL);
    console.log("API KEY check:", API_KEY ? "Present (not shown for security)" : "Missing!");
    if (!user || !user.id) {
       console.error("USER ID check: Missing!");
       throw new Error("User information is missing or invalid.");
    } else {
       console.log("USER ID check:", user.id);
    }


    // Check if required API details are present
    if (!API_KEY || !API_URL) {
      console.error("Missing API credentials for LicenseGate");
      throw new Error(
        "LicenseGate API credentials are not configured. Contact administrator.",
      );
    }

    try {
      // Check if user already has an active trial license in LicenseGate
      console.log(`Fetching licenses for user: ${user.email}`);
      const existingLicenses = await this.getUserLicensesFromLicenseGate(user.email);
      console.log(`User existing licenses: ${existingLicenses.length}`, existingLicenses);

      // Check specifically for an ACTIVE trial (no subscriptionId or null/0)
      const activeTrialLicense = existingLicenses.find(license =>
          license.isActive &&
          (license.subscriptionId === null || license.subscriptionId === 0) // Check for null or 0 subscriptionId for trials
      );


      if (activeTrialLicense) {
        console.log(`User ${user.email} already has an active trial license, checking local DB...`);
        // Try to find the corresponding license in the local DB using the LicenseGate ID
        // Note: getUserLicensesFromLicenseGate returns 'id' from LicenseGate, which might not be our local DB license ID.
        // We should rely on licenseKey or fetch by userId and lack of subscriptionId
         const localTrial = await storage.findTrialLicenseByUserId(user.id);

        if (localTrial) {
          console.log("Found existing trial license in database:", localTrial.licenseKey, "Returning it.");
          return localTrial;
        } else {
          console.warn(`Active trial found in LicenseGate (ID: ${activeTrialLicense.id}, Key: ${activeTrialLicense.licenseKey}) but not in local DB for user ${user.id}. Proceeding to create/save locally.`);
           // Potentially log this discrepancy for investigation
        }
      } else {
         console.log("User eligible for trial - proceeding with license creation");
      }


      // Generate trial license details
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + trialDays);

      // Format notes for trial license
      const notes = `CloudCanvas Trial License\\nEmail: ${user.email}\\nPlan: Trial\\nSubscription Type: Trial`;

      const licenseDataForApi = {
        active: true,
        name: fullName,
        notes: notes,
        ipLimit: 1, // Example: Limit trial licenses to 1 IP
        licenseScope: "trial", // Specific scope for trial
        expirationDate: expiryDate.toISOString(), // Use ISO string for API
        // Other fields as required by LicenseGate for trial, ensure they match Python test
        validationPoints: 0,
        validationLimit: 0,
        replenishAmount: 0,
        replenishInterval: "TEN_SECONDS", // Or appropriate interval
      };

      console.log("Creating trial license with details:", licenseDataForApi);


      // Create license via LicenseGate API
      console.log("Connecting to LicenseGate API...");
      const response = await axios.post(
        `${API_URL}/admin/licenses`,
        licenseDataForApi,
        {
          headers: {
            Authorization: API_KEY, // Directly use the API Key
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000, // Increased timeout
        },
      );

      console.log("LicenseGate API response:", { status: response.status, data: response.data, headers: response.headers });

      // Check for successful creation (typically 201 Created)
      if (response.status !== 201 && response.status !== 200) {
         // Log the unexpected response
         console.error(`Unexpected success status from LicenseGate API: ${response.status}`);
         // Still attempt to proceed if data looks valid, but log warning
         if (!response.data || !response.data.licenseKey) {
           throw new Error(
             `Unexpected response from LicenseGate API: Status ${response.status}, Body: ${JSON.stringify(response.data)}`
           );
         }
         console.warn("Proceeding despite unexpected success status code.");
      }

      const licenseDataFromApi = response.data;
      const licenseKey = licenseDataFromApi.licenseKey;
      console.log("License successfully created in LicenseGate with key:", licenseKey);

      // ---- FIX: Convert date strings to Date objects before saving ----
      const expirationDateFromApi = licenseDataFromApi.expirationDate ? new Date(licenseDataFromApi.expirationDate) : new Date(); // Use current date as fallback
      const createdAtFromApi = licenseDataFromApi.createdAt ? new Date(licenseDataFromApi.createdAt) : new Date(); // Use current date as fallback

      if (isNaN(expirationDateFromApi.getTime())) {
          console.warn("Invalid expirationDate received from LicenseGate API:", licenseDataFromApi.expirationDate);
          // Decide on fallback logic, e.g., use the originally calculated expiryDate
          // expirationDateFromApi = expiryDate;
      }
      if (isNaN(createdAtFromApi.getTime())) {
          console.warn("Invalid createdAt date received from LicenseGate API:", licenseDataFromApi.createdAt);
          // createdAtFromApi = new Date(); // Fallback to now
      }
      // -----------------------------------------------------------------


      // Save the license to the local database
      console.log("Saving license to local database...");
      const license = await storage.createLicense({
        userId: user.id,
        subscriptionId: null, // Explicitly null for trial licenses
        licenseKey: licenseKey, // Use the key from the API response
        isActive: licenseDataFromApi.active ?? true, // Use value from API or default to true
        // ---- FIX: Use the converted Date objects ----
        expiryDate: expirationDateFromApi,
        createdAt: createdAtFromApi, // Pass createdAt if your schema/storage expects it
        // ---------------------------------------------
        plan: 'trial', // Add plan type if relevant in local DB
        billingType: 'trial', // Add billing type if relevant
        // Map other relevant fields if needed
        ipLimit: licenseDataFromApi.ipLimit,
        licenseScope: licenseDataFromApi.licenseScope
      });

      console.log("Trial license created successfully in database:", license);
      return license;

    } catch (error: any) {
      console.error("Error during trial license creation:", error);

      // Check if the error happened *after* LicenseGate success but during DB save
      if (error.message.includes("failed to save in database")) {
         // This specific error is thrown by our own code after a successful API call failed DB op
         console.error("License was created in LicenseGate but failed during database save.");
         // Potentially attempt cleanup on LicenseGate or notify admin
         throw new Error("Trial license created externally but database update failed. Please contact support.");
      }
      // Handle specific Axios/API errors
      else if (axios.isAxiosError(error)) {
        console.error("LicenseGate API communication error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: { url: error.config?.url, method: error.config?.method, headers: error.config?.headers } // Log request details carefully
        });
        if (error.response?.status === 401) {
          throw new Error(
            "Authentication failed with LicenseGate. Invalid API credentials.",
          );
        } else {
           throw new Error(
             `Failed to communicate with LicenseGate API: ${error.message}`
           );
        }
      }
      // Handle other errors
      else {
         console.error("An unexpected error occurred:", error);
         // Ensure a generic but informative error is thrown
         throw new Error(
           `Failed to create trial license: ${error.message || "An unknown error occurred."}`
         );
      }
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
      console.log("Fetching licenses for user:", userEmail);
      
      // Check if we have valid API credentials
      if (!API_KEY || !API_URL) {
        console.error("Missing API credentials for LicenseGate");
        throw new Error("LicenseGate API credentials are not configured");
      }

      // Use the correct endpoint for fetching licenses by email
      const response = await axios.get(
        `${API_URL}/admin/licenses?email=${encodeURIComponent(userEmail)}`,
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("LicenseGate API response:", response.data);

      if (response.status === 200 && response.data && Array.isArray(response.data.licenses)) {
        return response.data.licenses.map((license: any) => ({
          id: license.id,
          licenseKey: license.licenseKey,
          isActive: license.active,
          expiryDate: license.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now if not set
          subscriptionId: null // Trial licenses don't have subscription IDs
        }));
      }

      throw new Error("Invalid response from LicenseGate API");
    } catch (error) {
      console.error("Error fetching user licenses from LicenseGate:", error);
      if ((error as any).response) {
        console.error("LicenseGate API error response:", {
          status: (error as any).response.status,
          data: (error as any).response.data,
        });
      }
      throw new Error("Failed to fetch user licenses");
    }
  }
}