import { Request, Response } from "express";
import { storage } from "../storage";
import { db } from "../db";

export const checkHealth = async (req: Request, res: Response) => {
  try {
    // Try to query the database
    const user = await storage.getUser(1);
    
    // Get database connection info
    const pool = db.$client;
    const totalCount = pool.totalCount;
    const idleCount = pool.idleCount;
    
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      status: "healthy",
      database: {
        connected: true,
        poolSize: totalCount,
        idleConnections: idleCount,
        activeConnections: totalCount - idleCount
      },
      user: user ? "Database contains user data" : "Database is empty"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      status: "unhealthy",
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined,
      database: {
        connected: false,
        url: process.env.DATABASE_URL ? "Database URL is configured" : "Database URL is missing"
      }
    });
  }
}; 