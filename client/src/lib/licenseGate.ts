import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

/**
 * Generate a license key
 */
export async function generateLicense(subscriptionId: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/licenses/generate", { subscriptionId });
    const data = await response.json();
    
    toast({
      title: "License generated",
      description: "Your license key has been generated and sent to your email.",
    });
    
    return data.licenseKey;
  } catch (error) {
    console.error("Generate license error:", error);
    toast({
      title: "License generation failed",
      description: "There was an error generating your license. Please contact support.",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Get all licenses for current user
 */
export async function getUserLicenses(): Promise<any[]> {
  try {
    const response = await apiRequest("GET", "/api/licenses/user");
    return response.json();
  } catch (error) {
    console.error("Get user licenses error:", error);
    return [];
  }
}

/**
 * Get license details
 */
export async function getLicenseDetails(licenseId: string): Promise<any> {
  try {
    const response = await apiRequest("GET", `/api/licenses/${licenseId}`);
    return response.json();
  } catch (error) {
    console.error("Get license details error:", error);
    throw error;
  }
}

/**
 * Deactivate a license
 */
export async function deactivateLicense(licenseId: string): Promise<void> {
  try {
    await apiRequest("POST", `/api/licenses/deactivate/${licenseId}`);
    
    toast({
      title: "License deactivated",
      description: "Your license has been deactivated successfully.",
    });
  } catch (error) {
    console.error("Deactivate license error:", error);
    toast({
      title: "Deactivation failed",
      description: "There was an error deactivating your license. Please try again or contact support.",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Reactivate a license
 */
export async function reactivateLicense(licenseId: string): Promise<void> {
  try {
    await apiRequest("POST", `/api/licenses/reactivate/${licenseId}`);
    
    toast({
      title: "License reactivated",
      description: "Your license has been reactivated successfully.",
    });
  } catch (error) {
    console.error("Reactivate license error:", error);
    toast({
      title: "Reactivation failed",
      description: "There was an error reactivating your license. Please try again or contact support.",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Generate a trial license
 */
export async function generateTrialLicense() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user has any existing licenses
    const existingLicenses = await queryClient.fetchQuery({
      queryKey: ["userLicenses"],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/licenses/me");
        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || `API error: ${response.status}`);
          } catch (parseError) {
            throw new Error(`API error: ${response.status}`);
          }
        }
        return response.json();
      },
    });

    // Allow unlimited trials for admin email
    const isAdmin = user.email === "dms@live.co.za";
    
    // Only check for existing licenses if not admin
    if (!isAdmin && existingLicenses && existingLicenses.length > 0) {
      throw new Error("You already have a license. Trial licenses are only available for new users.");
    }

    // Generate trial license
    const response = await apiRequest("POST", "/api/licenses/trial");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate trial license");
    }

    // Invalidate the licenses query to refresh the data
    await queryClient.invalidateQueries({ queryKey: ["userLicenses"] });

    return true;
  } catch (error: any) {
    console.error("Error generating trial license:", error);
    
    let errorMessage = "Failed to generate trial license";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    throw error;
  }
}
