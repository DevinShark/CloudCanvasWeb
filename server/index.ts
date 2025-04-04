import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// We'll determine the environment for our email URLs but won't change NODE_ENV
// This helps us avoid issues with the Vite development server
const isReplitEnvironment = !!process.env.REPLIT_SLUG;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Store the application URL in process.env for use in emails
const appProtocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const appHost = process.env.REPLIT_SLUG 
  ? `${process.env.REPLIT_SLUG}.replit.app`
  : 'localhost:5000';
process.env.APP_URL = `${appProtocol}://${appHost}`;

// Log incoming requests and responses
app.use((req, res, next) => {
  // Store the first detected host if not already set
  if (!process.env.APP_HOST && req.headers.host) {
    process.env.APP_HOST = req.headers.host;
    process.env.APP_PROTOCOL = req.protocol;
    process.env.APP_URL = `${req.protocol}://${req.headers.host}`;
    log(`Detected application URL: ${process.env.APP_URL}`);
  }
  
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Use the PORT environment variable provided by Render, fallback to 5000 for local dev
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
