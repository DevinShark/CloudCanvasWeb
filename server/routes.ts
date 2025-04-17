import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import axios from "axios";
import { EmailService } from "./services/email";
import { storage } from "./storage";

// Import controllers
import * as authController from "./controllers/auth";
import * as subscriptionController from "./controllers/subscription";
import * as licenseController from "./controllers/license";
import * as webhookController from "./controllers/webhook";
import * as healthController from "./controllers/health";
import * as downloadController from "./controllers/download";

// Import middleware
import { requireAuth } from "./middleware/auth";

// Import memorystore using dynamic import
let MemoryStore: any = null;
try {
  // This approach works with ES modules
  import('memorystore').then(memorystore => {
    MemoryStore = memorystore.default(session);
  }).catch(err => {
    console.error('Error loading memorystore:', err);
    // Fallback to in-memory store if memorystore fails
    MemoryStore = new session.MemoryStore();
  });
} catch (err) {
  console.error('Error in dynamic import of memorystore:', err);
  // Fallback to in-memory store if import fails
  MemoryStore = new session.MemoryStore();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Wait for memorystore to be loaded
  if (!MemoryStore) {
    // Fallback to in-memory store if memorystore wasn't loaded
    MemoryStore = new session.MemoryStore();
  }
  
  // Configure session with memory store
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: true,
      saveUninitialized: false,
      store: MemoryStore,
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
  app.post("/api/auth/change-password", requireAuth, authController.changePassword);
  app.patch("/api/auth/preferences", requireAuth, authController.updateEmailPreferences);
  
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
  
  // Fetch user licenses from local database
  app.get("/api/licenses/me", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.id) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }
      // Get licenses from database
      const dbLicenses = await storage.getUserLicenses(user.id);
      // Map to API response including plan from subscription
      const licenses = await Promise.all(dbLicenses.map(async lic => {
        let plan = 'trial';
        if (lic.subscriptionId) {
          const sub = await storage.getSubscription(lic.subscriptionId);
          plan = sub?.plan || 'standard';
        }
        return {
          id: lic.id,
          licenseKey: lic.licenseKey,
          isActive: lic.isActive,
          expiryDate: lic.expiryDate.toISOString(),
          subscriptionId: lic.subscriptionId,
          plan,
          notes: undefined,
          name: undefined
        };
      }));
      res.status(200).json({ success: true, licenses });
    } catch (error) {
      console.error("Error fetching licenses from database:", error);
      res.status(500).json({ success: false, message: "Failed to fetch licenses" });
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
      
      // Send confirmation email to the user
      await EmailService.sendDemoRequestConfirmationEmail(
        fullName,
        email,
        company,
        industry
      );

      // Send notification email to the admin
      await EmailService.sendDemoRequestNotificationEmail(
        fullName,
        email,
        company,
        industry,
        message || ""
      );
      
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
  app.post("/api/downloads/installer", requireAuth, downloadController.getInstallerUrl);
  
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

      // Send confirmation email to the user
      await EmailService.sendContactFormConfirmationEmail(
        name,
        email,
        subject
      );

      // Send notification email to the admin
      await EmailService.sendContactFormNotificationEmail(
        name,
        email,
        subject,
        message
      );
      
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
  
  // Add an additional route for the PayPal webhook (for compatibility with existing webhook settings)
  app.post("/api/paypal/webhook", webhookController.handlePayPalWebhook);

  const httpServer = createServer(app);
  return httpServer;
}
