import { Router } from "express";
import { generateLicense, generateTrialLicense, resendLicenseKeyEmail } from "../controllers/license";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Generate a license key for a subscription
router.post("/generate", requireAuth, generateLicense);

// Generate a trial license
router.post("/trial", requireAuth, generateTrialLicense);

// Resend license key email
router.post("/resend-email", requireAuth, resendLicenseKeyEmail);

export default router; 