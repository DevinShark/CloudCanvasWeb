import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We'll determine the environment for our email URLs but won't change NODE_ENV
// This helps us avoid issues with the Vite development server
const isReplitEnvironment = !!process.env.REPLIT_SLUG;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
const allowedOrigins = [
  'https://cloudcanvas.wuaze.com', // Your frontend production URL
  /^http:\/\/localhost:\d+$/ // Regex for any localhost port
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowedOrigin => 
      typeof allowedOrigin === 'string' ? origin === allowedOrigin : allowedOrigin.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  maxAge: 86400, // Cache preflight requests for 24 hours
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply CORS middleware before any routes
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Store the application URL in process.env for use in emails
const appProtocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const port = process.env.PORT || 3000;
const appHost = process.env.REPLIT_SLUG 
  ? `${process.env.REPLIT_SLUG}.replit.app`
  : `localhost:${port}`;
process.env.APP_URL = `${appProtocol}://${appHost}`;

// Log incoming requests and responses
app.use((req, res, next) => {
  // Store the first detected host if not already set
  if (!process.env.APP_HOST && req.headers.host) {
    process.env.APP_HOST = req.headers.host;
    process.env.APP_PROTOCOL = req.protocol;
    process.env.APP_URL = `${req.protocol}://${req.headers.host}`;
    console.log(`[Server] Detected application URL: ${process.env.APP_URL}`);
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

      console.log(`[Server] ${logLine}`);
    }
  });

  next();
});

// Register API routes
registerRoutes(app);

// Create the server
const server = app.listen(port, () => {
  console.log(`[Server] Server running at ${appProtocol}://${appHost}`);
});

// Serve static files in production
if (isProduction) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.log(`[Server] Static directory not found: ${distPath}. Make sure to build the client first.`);
    app.get('/', (req: Request, res: Response) => {
      res.json({ message: 'CloudCanvas API Server. Frontend build not found.' });
    });
  } else {
    console.log(`[Server] Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.use("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
} else {
  // Dynamically import setupVite only in development
  import("./vite").then(({ setupVite }) => {
    setupVite(app, server);
  }).catch(err => {
    console.error(`[Server] Failed to setup Vite: ${err}`);
    process.exit(1);
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
