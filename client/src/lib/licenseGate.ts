import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

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
export async function generateTrialLicense(): Promise<void> {
  try {
    const response = await apiRequest("POST", "/api/licenses/generate-trial");
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "Failed to generate trial license");
    }
    
    toast({
      title: "Trial activated",
      description: "Your 7-day trial license has been generated and sent to your email.",
    });
    
    // Instead of reloading the page, navigate to the dashboard
    window.location.href = "/dashboard";
  } catch (error: any) {
    console.error("Generate trial license error:", error);
    
    // Extract error message from response if available
    const errorMessage = error.response?.data?.message || error.message || "There was an error generating your trial license. Please try again or contact support.";
    
    toast({
      title: "Trial activation failed",
      description: errorMessage,
      variant: "destructive",
    });
    throw error;
  }
}
