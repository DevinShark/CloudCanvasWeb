import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import passport from "passport";
import { storage } from "../storage";
import { insertUserSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema, updateEmailPrefsSchema } from "@shared/schema";
import { EmailService } from "../services/email";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    console.log("Registration request received:", { body: req.body });
    
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors
      });
    }

    const { email, password, firstName, lastName, company } = validationResult.data;
    console.log("Validated registration data:", { email, firstName, lastName, company });

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully");

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    console.log("Verification token generated");

    // Create user
    console.log("Creating user in storage...");
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      company
    });
    console.log("User created successfully:", { id: user.id, email: user.email });

    // Add verification token
    console.log("Adding verification token...");
    await storage.updateUserVerificationToken(user.id, verificationToken);
    console.log("Verification token added");

    // Send verification email
    console.log("Sending verification email...");
    try {
      await EmailService.sendVerificationEmail(user, verificationToken);
      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    // Return success response (don't include password)
    const { password: _, ...userResponse } = user;
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: userResponse
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    });
  }
};

// Login user
export const login = (req: Request, res: Response) => {
  // Validate request body
  const validationResult = loginSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: validationResult.error.errors
    });
  }

  // Authenticate user with passport
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Server error during login"
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || "Invalid credentials"
      });
    }

    // Log in the user
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Server error during login"
        });
      }

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({
            success: false,
            message: "Server error during login"
          });
        }

        // Return success response (don't include password)
        const { password, ...userResponse } = user;
        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: userResponse
        });
      });
    });
  })(req, res);
};

// Logout user
export const logout = (req: Request, res: Response) => {
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      
      res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    });
  });
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      });
    }

    // This approach is inefficient but works for our in-memory storage with small user numbers
    // In a real database, we would query by token directly
    const users = await getAllUsers();
    const user = users.find(u => u.verificationToken === token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    // Mark user as verified and clear token
    await storage.setUserVerified(user.id, true);
    await storage.updateUserVerificationToken(user.id, null);

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification"
    });
  }
};

// Helper function to get all users - for in-memory storage
async function getAllUsers() {
  // Fetch users from ID 1 to 1000
  // For a real database, we would use a more efficient query
  const usersPromises = [];
  for (let i = 1; i <= 1000; i++) {
    usersPromises.push(storage.getUser(i));
  }
  
  const users = await Promise.all(usersPromises);
  return users.filter(Boolean) as any[];
}

// Request password reset
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = passwordResetRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors
      });
    }

    const { email } = validationResult.data;

    // Find user by email
    const user = await storage.getUserByEmail(email);

    // Always return success even if user not found (security best practice)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with that email, a password reset link has been sent."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Update user with reset token
    await storage.updateUserResetToken(user.id, resetToken);

    // Send password reset email
    await EmailService.sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: "If an account exists with that email, a password reset link has been sent."
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset request"
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = passwordResetSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors
      });
    }

    const { token, password } = validationResult.data;

    // Find user with the reset token using our helper function
    const users = await getAllUsers();
    const user = users.find(u => u.resetPasswordToken === token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token
    await storage.updateUser(user.id, { password: hashedPassword });
    await storage.updateUserResetToken(user.id, null);

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset"
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in."
      });
    }

    // Return user data without sensitive information
    const user = req.user as any;
    const { password, ...userResponse } = user;
    return res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user data"
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = (req.user as any).id;
    const { firstName, lastName, company } = req.body;

    // Update user
    const updatedUser = await storage.updateUser(userId, {
      firstName,
      lastName,
      company
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return updated user (without password)
    const { password, ...userResponse } = updatedUser;
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update"
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'You must be logged in to change your password' 
      });
    }
    
    const userId = (req.user as any).id;
    
    // Get user from storage
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password in storage
    const updatedUser = await storage.updateUser(userId, { 
      password: hashedPassword 
    });
    
    if (!updatedUser) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update password' 
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while changing your password' 
    });
  }
};

// New controller function for updating email preferences
export const updateEmailPreferences = async (req: Request, res: Response) => {
  try {
    // Validate authentication
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = (req.user as any).id;

    // Validate request body
    const validationResult = updateEmailPrefsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid preference data",
        errors: validationResult.error.errors,
      });
    }

    const preferencesToUpdate = validationResult.data;

    // Update user preferences in storage
    const updatedUser = await storage.updateUser(userId, preferencesToUpdate);

    if (!updatedUser) {
      // This could mean user not found or update failed
      return res.status(404).json({ success: false, message: "User not found or update failed" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Email preferences updated successfully" 
    });

  } catch (error) {
    console.error("Error updating email preferences:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error updating email preferences" 
    });
  }
};
