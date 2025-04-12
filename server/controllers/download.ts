import { Request, Response } from "express";
import { r2Service } from "../services/r2Service";
import { LicenseGateService } from "../services/licenseGate";

/**
 * Generate a download URL for the Cloud Canvas installer
 * Only users with active licenses can download the installer
 */
export const getInstallerUrl = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in."
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
      
      try {
        const url = await r2Service.getDownloadUrl(fileName);
        
        if (!url) {
          throw new Error('Invalid download URL generated');
        }
        
        console.log(`Generated download URL for user ${userEmail} - file: ${fileName}`);
        
        return res.status(200).json({
          success: true,
          downloadUrl: url
        });
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