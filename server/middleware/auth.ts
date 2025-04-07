import { Request, Response, NextFunction } from "express";

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check if session exists
  if (!req.session) {
    return res.status(401).json({
      success: false,
      message: "No session found. Please log in."
    });
  }

  // Check if user is authenticated
  if (req.isAuthenticated()) {
    // Ensure user object exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User session invalid. Please log in."
      });
    }
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: "Unauthorized access. Please log in."
  });
};

// Middleware to check if user is an admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user as any).isAdmin) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: "Access denied. Admin privileges required."
  });
};

// Middleware to check if a user is verified
export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user as any).isVerified) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: "Email verification required. Please verify your email address."
  });
};
