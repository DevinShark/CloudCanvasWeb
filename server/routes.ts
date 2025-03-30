import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

// Import controllers
import * as authController from "./controllers/auth";
import * as subscriptionController from "./controllers/subscription";
import * as licenseController from "./controllers/license";

// Import middleware
import { requireAuth } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Memory store for session
  const SessionStore = MemoryStore(session);
  
  // Configure session with memory store
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "cloud-canvas-secret",
    })
  );
  
  // Configure passport with local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          
          if (!user.isVerified) {
            return done(null, false, { message: "Please verify your email first" });
          }
          
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
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
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
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
  app.post("/api/auth/verify-email/:token", authController.verifyEmail);
  app.post("/api/auth/forgot-password", authController.forgotPassword);
  app.post("/api/auth/reset-password", authController.resetPassword);
  app.get("/api/auth/me", requireAuth, authController.getCurrentUser);
  app.patch("/api/auth/profile", requireAuth, authController.updateProfile);
  
  // Subscription routes
  app.post("/api/subscriptions/create", requireAuth, subscriptionController.createSubscription);
  app.post("/api/subscriptions/execute", requireAuth, subscriptionController.executeSubscription);
  app.post("/api/subscriptions/cancel/:id", requireAuth, subscriptionController.cancelSubscription);
  app.get("/api/subscriptions/:id", requireAuth, subscriptionController.getSubscription);
  app.get("/api/subscriptions/user", requireAuth, subscriptionController.getUserSubscriptions);
  
  // License routes
  app.post("/api/licenses/generate", requireAuth, licenseController.generateLicense);
  app.post("/api/licenses/generate-trial", requireAuth, licenseController.generateTrialLicense);
  app.post("/api/licenses/deactivate/:id", requireAuth, licenseController.deactivateLicense);
  app.post("/api/licenses/reactivate/:id", requireAuth, licenseController.reactivateLicense);
  app.get("/api/licenses/:id", requireAuth, licenseController.getLicense);
  app.get("/api/licenses/user", requireAuth, licenseController.getUserLicenses);
  
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

  const httpServer = createServer(app);
  return httpServer;
}
