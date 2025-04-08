import { Request, Response } from "express";
import { storage } from "../storage";

export const checkHealth = async (req: Request, res: Response) => {
  try {
    // Try to query the database
    await storage.getUser(1);
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      status: "healthy"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      status: "unhealthy",
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    });
  }
}; 