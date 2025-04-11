import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { MemoryStore } from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import axios from "axios";

// Import controllers
import * as authController from "./controllers/auth";
import * as subscriptionController from "./controllers/subscription";
import * as licenseController from "./controllers/license";
import * as webhookController from "./controllers/webhook";
import * as healthController from "./controllers/health";
import * as downloadController from "./controllers/download";

// Import middleware
import { requireAuth } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Memory store for session
  const SessionStore = MemoryStore;
  
  // Configure session with memory store
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: true,
      saveUninitialized: false,
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: undefined
      },
      name: "sessionId",
      rolling: true,
      proxy: true
    })
  );

  // Initialize passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport with local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: "No account found with this email" });
          }
          
          if (!user.isVerified) {
            return done(null, false, { message: "Please verify your email first" });
          }
          
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (!isMatch) {
            return done(null, false, { message: "Incorrect password" });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: any, done) => {
    try {
      // Ensure id is a number
      const userId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
      
      if (isNaN(userId)) {
        console.error("Invalid user ID during deserialization:", id);
        return done(new Error("Invalid user ID"));
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.error("User not found during deserialization:", userId);
        return done(new Error("User not found"));
      }
      
      done(null, user);
    } catch (error) {
      console.error("Error in deserializeUser:", error);
      done(error);
    }
  });
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Auth routes
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  // Public routes
  app.get("/api/health", healthController.checkHealth);
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.get("/api/auth/verify-email/:token", authController.verifyEmail);
  app.post("/api/auth/verify-email/:token", authController.verifyEmail);
  app.post("/api/auth/forgot-password", authController.forgotPassword);
  app.post("/api/auth/reset-password", authController.resetPassword);

  // Protected routes that require authentication
  app.use((req, res, next) => {
    // Allow public routes without authentication
    if (!req.path.startsWith('/api/') || 
        req.path.startsWith('/api/auth/register') ||
        req.path.startsWith('/api/auth/login') ||
        req.path.startsWith('/api/auth/verify-email/') ||
        req.path.startsWith('/api/auth/forgot-password') ||
        req.path.startsWith('/api/auth/reset-password')) {
      return next();
    }
    return requireAuth(req, res, next);
  });
  app.post("/api/auth/forgot-password", authController.forgotPassword);
  app.post("/api/auth/reset-password", authController.resetPassword);
  app.get("/api/auth/me", requireAuth, authController.getCurrentUser);
  app.patch("/api/auth/profile", requireAuth, authController.updateProfile);
  
  // Subscription routes
  app.post("/api/subscriptions/create", requireAuth, subscriptionController.createSubscription);
  app.post("/api/subscriptions/execute", requireAuth, subscriptionController.executeSubscription);
  app.post("/api/subscriptions/cancel/:id", requireAuth, subscriptionController.cancelSubscription);
  app.get("/api/subscriptions/user", requireAuth, subscriptionController.getUserSubscriptions);
  app.get("/api/subscriptions/:id", requireAuth, subscriptionController.getSubscription);
  
  // License routes
  app.post("/api/licenses/generate", requireAuth, licenseController.generateLicense);
  app.post("/api/licenses/trial", requireAuth, licenseController.generateTrialLicense);
  app.post("/api/licenses/deactivate/:id", requireAuth, licenseController.deactivateLicense);
  app.post("/api/licenses/reactivate/:id", requireAuth, licenseController.reactivateLicense);
  
  // Add the new endpoint to fetch licenses directly from LicenseGate - SPECIFIC ROUTES FIRST
  app.get("/api/licenses/me", requireAuth, async (req, res, next) => {
    try {
      // Ensure user information is attached by requireAuth middleware
      const user = req.user as any;
      if (!user || !user.email) {
        return res.status(401).json({ success: false, message: "User not authenticated or email missing." });
      }

      // Log the request
      console.log("Fetching licenses for user:", user.email);
            
      // Get API credentials directly from environment
      const API_KEY = process.env.LICENSEGATE_API_KEY;
      const API_URL = (process.env.LICENSEGATE_API_URL || "https://api.licensegate.io").replace(/\/+$/, '');
      
      if (!API_KEY) {
        console.error("LICENSEGATE_API_KEY is not set in environment variables");
        throw new Error("LicenseGate API credentials are not configured");
      }
      
      // Make direct axios request to fetch ALL licenses
      const response = await axios.get(
        `${API_URL}/admin/licenses`, // Fetch all licenses
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": API_KEY,
            "Accept": "application/json"
          },
          timeout: 10000
        }
      );
      
      console.log("LicenseGate API direct call response status:", response.status);
      
      if (response.status === 200 && response.data && Array.isArray(response.data.licenses)) {
        // Filter licenses by email in the notes field and map the data
        const filteredLicenses = response.data.licenses
          .filter((license: any) => license.notes && license.notes.includes(user.email))
          .map((license: any) => ({
            id: license.id,
            licenseKey: license.licenseKey,
            isActive: license.active,
            // Ensure expiryDate is a string, default if null/undefined
            expiryDate: license.expirationDate 
              ? String(license.expirationDate) 
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            subscriptionId: license.subscriptionId || null, // Use subscriptionId if available
            plan: license.plan || 'trial', // Use plan if available, default to 'trial'
            notes: license.notes, // Include notes
            name: license.name // Include name if available
          }));
        
        console.log(`Found ${filteredLicenses.length} licenses for user ${user.email} after filtering`);
        res.status(200).json({ success: true, licenses: filteredLicenses });
      } else {
        console.error("Invalid response from LicenseGate API:", response.data);
        res.status(200).json({ success: true, licenses: [] });
      }
    } catch (error) {
      console.error("Error in /api/licenses/me handler:", error);
      // Send a specific 500 error response
      const message = error instanceof Error ? error.message : "An unexpected error occurred while fetching licenses.";
      res.status(500).json({ success: false, message: message });
      // Do not call next(error) to prevent reaching the generic handler
    }
  });
  
  // Generic routes with path parameters AFTER specific routes
  app.get("/api/licenses/:id", requireAuth, licenseController.getLicense);
  
  // Demo request route
  app.post("/api/demos/request", async (req, res) => {
    try {
      const { fullName, email, company, industry, message } = req.body;
      
      // Store demo request
      const demoRequest = await storage.createDemoRequest({
        fullName, 
        email, 
        company, 
        industry, 
        message: message || ""
      });
      
      res.status(201).json({
        success: true,
        message: "Demo request received",
        demoRequest
      });
    } catch (error) {
      console.error("Demo request error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process demo request" 
      });
    }
  });
  
  // Download routes
  app.get("/api/downloads/installer", requireAuth, downloadController.getInstallerUrl);
  
  // Contact form route
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Store contact message
      const contactMessage = await storage.createContactMessage({
        name,
        email,
        subject,
        message
      });
      
      res.status(201).json({
        success: true,
        message: "Message received",
        contactMessage
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process contact message" 
      });
    }
  });
  
  // PayPal webhook endpoint - doesn't require authentication
  app.post("/api/webhooks/paypal", webhookController.handlePayPalWebhook);

  const httpServer = createServer(app);
  return httpServer;
}
