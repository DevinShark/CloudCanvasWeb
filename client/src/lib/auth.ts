import { apiRequest } from "@/lib/queryClient";
import { InsertUser, LoginData, User } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';
import { LicenseDetails } from "@/types";
import { getApiUrl } from "@/config";

// Re-export the LicenseDetails type
export type { LicenseDetails };

/**
 * Register a new user
 */
export async function registerUser(userData: InsertUser): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/register", userData);
    toast({
      title: "Registration successful",
      description: "Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Log in a user
 */
export async function loginUser(credentials: LoginData): Promise<User> {
  try {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }
    
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
    
    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Log out the current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/logout");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Verify a user's email with token
 */
export async function verifyEmail(token: string): Promise<void> {
  try {
    await apiRequest("POST", `/api/auth/verify-email/${token}`);
    toast({
      title: "Email verified",
      description: "Your email has been successfully verified.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
}

/**
 * Request a password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/forgot-password", { email });
    toast({
      title: "Reset email sent",
      description: "If an account exists with that email, you'll receive instructions to reset your password.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/reset-password", { token, password: newPassword });
    toast({
      title: "Password reset successful",
      description: "Your password has been reset. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await fetch(getApiUrl("/api/auth/me"), {
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userData: Partial<InsertUser>): Promise<void> {
  try {
    await apiRequest("PATCH", "/api/auth/profile", userData);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}

// --- NEW FUNCTION --- 
export const fetchUserLicenses = async (): Promise<LicenseDetails[]> => {
  try {
    const response = await axios.get<{ success: boolean; licenses: LicenseDetails[] }>(
      getApiUrl("/api/licenses/me")
    );
    
    if (response.data.success) {
      return response.data.licenses;
    } else {
      console.error("Backend indicated failure fetching licenses", response.data);
      return [];
    }
  } catch (error: any) {
    console.error("Error fetching user licenses:", error);
    throw error;
  }
};
// --- END NEW FUNCTION --- 
