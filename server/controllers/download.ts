import { Request, Response } from "express";
import { r2Service } from "../services/r2Service";
import { LicenseGateService } from "../services/licenseGate";
import fetch from "node-fetch";

/**
 * Verify Cloudflare Turnstile token
 */
async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  try {
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const formData = new URLSearchParams();
    formData.append('secret', process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '');
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await result.json() as { success: boolean, 'error-codes': string[] };
    
    if (!data.success) {
      console.error('Turnstile verification failed:', data['error-codes']);
      return false;
    }
    
    return data.success;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}

/**
 * Generate a download URL for the Cloud Canvas installer
 * Only users with active licenses can download the installer
 * Requires CAPTCHA verification
 */
export const getInstallerUrl = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in."
      });
    }

    // Get and verify CAPTCHA token
    const { captchaToken } = req.body;
    
    if (!captchaToken) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA verification required"
      });
    }
    
    // Verify CAPTCHA token
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const isValidToken = await verifyTurnstileToken(captchaToken, ip as string);
    
    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA verification failed"
      });
    }

    const user = req.user as any;
    const userEmail = user.email;

    // Check if user has a valid license
    console.log(`Checking license for user ${userEmail} before download`);
    
    try {
      // Get all licenses associated with this user
      const licenses = await LicenseGateService.getUserLicensesFromLicenseGate(userEmail);
      
      // Check if any license is active
      const hasActiveLicense = licenses.some(license => {
        const expiryDate = new Date(license.expiryDate);
        const today = new Date();
        return license.isActive && today <= expiryDate;
      });

      if (!hasActiveLicense) {
        console.log(`User ${userEmail} attempted to download installer but has no active license`);
        return res.status(403).json({
          success: false,
          message: "Active license required to download"
        });
      }
      
      // Generate a pre-signed URL for the installer
      // The file name in the bucket could be either .exe or .zip format
      const fileName = process.env.INSTALLER_FILENAME || "CloudCanvas-Installer.zip";
      console.log(`Using installer filename: ${fileName}`);
      
      try {
        // Print R2 configuration (without sensitive data)
        console.log(`R2 Configuration:
          - Account ID: ${process.env.CLOUDFLARE_ACCOUNT_ID ? 'Set' : 'Missing'}
          - R2 Access Key: ${process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing'}
          - R2 Secret Key: ${process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing'}
          - Bucket: ${process.env.CLOUDFLARE_R2_BUCKET || 'cloud-canvas-installers'}
        `);
        
        // Get the download URL
        const url = await r2Service.getDownloadUrl(fileName);
        
        // Debug the returned URL
        console.log(`Generated URL: ${url ? 'Success (URL not shown for security)' : 'Failed (null or undefined)'}`);
        console.log(`URL type: ${typeof url}`);
        console.log(`URL length: ${url ? url.length : 'N/A'}`);
        
        if (!url) {
          throw new Error('Invalid download URL generated');
        }
        
        // Check URL format
        if (typeof url !== 'string' || !url.startsWith('http')) {
          console.error(`Invalid URL format received: ${typeof url}`);
          throw new Error('Invalid URL format received from storage service');
        }
        
        console.log(`Generated download URL for user ${userEmail} - file: ${fileName}`);
        
        // Debug the response being sent
        const response = {
          success: true,
          downloadUrl: url
        };
        console.log('Sending response:', JSON.stringify({ success: true, downloadUrl: 'present' }));
        
        return res.status(200).json(response);
      } catch (storageError) {
        console.error("Error generating download URL from storage:", storageError);
        return res.status(500).json({
          success: false,
          message: "Failed to generate download URL. Please contact support."
        });
      }
    } catch (error) {
      console.error("Error checking license:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking license status. Please try again later."
      });
    }
  } catch (error) {
    console.error("Error in download controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
}; 