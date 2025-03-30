import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import passport from "passport";
import { storage } from "../storage";
import { insertUserSchema, loginSchema, passwordResetRequestSchema, passwordResetSchema } from "@shared/schema";
import { EmailService } from "../services/email";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors
      });
    }

    const { email, password, firstName, lastName, company } = validationResult.data;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      company
    });

    // Add verification token
    await storage.updateUserVerificationToken(user.id, verificationToken);

    // Send verification email
    await EmailService.sendVerificationEmail(user, verificationToken);

    // Return success response (don't include password)
    const { password: _, ...userResponse } = user;
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: userResponse
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration"
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

      // Return success response (don't include password)
      const { password, ...userResponse } = user;
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: userResponse
      });
    });
  })(req, res);
};

// Logout user
export const logout = (req: Request, res: Response) => {
  req.logout(() => {
    res.status(200).json({
      success: true,
      message: "Logout successful"
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
    // User is already attached to req by passport
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Return user (without password)
    const { password, ...userResponse } = req.user as any;
    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
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
