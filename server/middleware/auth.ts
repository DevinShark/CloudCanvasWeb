import { Request, Response, NextFunction } from "express";

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
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
