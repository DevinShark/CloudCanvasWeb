import nodemailer from "nodemailer";
import { User, Subscription, License } from "@shared/schema";
import { formatPlanName, formatDate } from "../lib/utils";

// Set up email transport
// Ensure required environment variables are set for email functionality
if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("CRITICAL ERROR: Missing required email environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD). Email functionality will likely fail.");
  // Optionally, you could throw an error here to prevent the app from starting without proper email config
  // throw new Error("Missing required email environment variables");
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Rely solely on environment variable
  port: parseInt(process.env.EMAIL_PORT || '587'), // Keep a default ONLY if parsing fails, but primary is env var
  secure: process.env.EMAIL_SECURE === "true", // Rely solely on environment variable (true if string is "true")
  auth: {
    user: process.env.EMAIL_USER, // Rely solely on environment variable
    pass: process.env.EMAIL_PASSWORD, // Rely solely on environment variable (ensure name matches Render)
  },
});

// Helper function to generate application URLs that work in both development and production
function getAppUrl(path: string = ''): string {
  // Get the application URL from environment variable set in server/index.ts
  // This is more reliable as it uses the actual request host when available
  const baseUrl = process.env.APP_URL || "http://localhost:5000";
  
  // Clean up the baseUrl and path for proper joining
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  console.log(`Generated URL: ${cleanBaseUrl}${cleanPath}`);
  return `${cleanBaseUrl}${cleanPath}`;
}

// Email service class for sending various emails
export class EmailService {
  // Send email verification
  static async sendVerificationEmail(user: User, verificationToken: string): Promise<void> {
    // Use helper to generate verification URL for the client-side route
    const verificationUrl = getAppUrl(`verify-email/${verificationToken}`);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: user.email,
      subject: "Verify your email for Cloud Canvas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">Welcome to Cloud Canvas!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #2B3F6C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can also use this link:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
  
  // Send password reset email
  static async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    // Use helper to generate reset password URL
    const resetUrl = getAppUrl(`reset-password/${resetToken}`);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: user.email,
      subject: "Reset your Cloud Canvas password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2B3F6C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also use this link:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
  
  // Send subscription confirmation email
  static async sendSubscriptionConfirmationEmail(
    user: User, 
    subscription: Subscription
  ): Promise<void> {
    // Use helper to generate dashboard URL
    const dashboardUrl = getAppUrl('dashboard');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: user.email,
      subject: "Your Cloud Canvas Subscription is Active",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">Thank You for Your Subscription!</h2>
          <p>Your ${formatPlanName(subscription.plan)} plan is now active. Here are your subscription details:</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Plan:</strong> ${formatPlanName(subscription.plan)}</p>
            <p><strong>Billing:</strong> ${subscription.billingType === "annual" ? "Annual" : "Monthly"}</p>
            <p><strong>Status:</strong> ${formatPlanName(subscription.status)}</p>
            <p><strong>Next Billing Date:</strong> ${formatDate(new Date(subscription.endDate || ""))}</p>
          </div>
          
          <p>Visit your dashboard to view your subscription details and download Cloud Canvas:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #2B3F6C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Dashboard</a>
          </div>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team at support@cloudcanvas.com.</p>
          <p style="font-size: 12px; color: #666;">Thank you for choosing Cloud Canvas!</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
  
  // Send license key email
  static async sendLicenseKeyEmail(
    user: User, 
    license: License, 
    subscription: Subscription
  ): Promise<void> {
    // Use helper to generate dashboard URL
    const downloadUrl = getAppUrl('dashboard');
    
    // Determine if this is a trial license
    const isTrial = !license.subscriptionId || subscription.plan === 'trial';
    
    // Set the appropriate subject and messaging based on license type
    const subject = isTrial 
      ? "Your Cloud Canvas Trial License Key" 
      : "Your Cloud Canvas License Key";
    
    const introMessage = isTrial
      ? "Thank you for trying Cloud Canvas. Your trial license key is ready for use:"
      : "Thank you for subscribing to Cloud Canvas. Your license key is ready for use:";
    
    // Trial-specific message
    const trialMessage = isTrial 
      ? `<p style="color: #e63946; font-weight: bold;">This is a 30-day trial license. After the trial period ends, you'll need to purchase a subscription to continue using Cloud Canvas.</p>` 
      : '';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: user.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">Your Cloud Canvas License Key</h2>
          <p>${introMessage}</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0; font-family: monospace; word-break: break-all; font-size: 14px;">
            ${license.licenseKey}
          </div>
          
          <p><strong>Plan:</strong> ${formatPlanName(subscription.plan)}</p>
          <p><strong>Expiration Date:</strong> ${formatDate(new Date(license.expiryDate))}</p>
          
          ${trialMessage}
          
          <p>Please download Cloud Canvas and enter your license key to activate the software:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="background-color: #2B3F6C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Download Cloud Canvas</a>
          </div>
          
          <p>Installation Instructions:</p>
          <ol>
            <li>Download and install Cloud Canvas</li>
            <li>Launch the application</li>
            <li>When prompted, enter your license key</li>
            <li>Click Activate</li>
          </ol>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team at support@cloudcanvas.com.</p>
          <p style="font-size: 12px; color: #666;">Thank you for choosing Cloud Canvas!</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
  
  // Send demo request confirmation email
  static async sendDemoRequestConfirmationEmail(
    fullName: string,
    email: string,
    company: string,
    industry: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: email,
      subject: "Cloud Canvas Demo Request Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">Demo Request Received</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for your interest in Cloud Canvas. We have received your demo request with the following details:</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Industry:</strong> ${industry}</p>
          </div>
          
          <p>A member of our team will be in touch with you shortly to schedule your personalized demo. In the meantime, feel free to explore our website for more information about Cloud Canvas.</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p>If you have any questions, please don't hesitate to contact us at sales@cloudcanvas.com.</p>
          <p style="font-size: 12px; color: #666;">Thank you for your interest in Cloud Canvas!</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
  
  // Send contact form confirmation email
  static async sendContactFormConfirmationEmail(
    name: string,
    email: string,
    subject: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: email,
      subject: "We've Received Your Message - Cloud Canvas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">Message Received</h2>
          <p>Dear ${name},</p>
          <p>Thank you for contacting Cloud Canvas. We have received your message regarding "${subject}".</p>
          <p>Our team will review your inquiry and get back to you as soon as possible. We typically respond within 24-48 business hours.</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p>If you have any urgent concerns, please contact our support team directly at support@cloudcanvas.com.</p>
          <p style="font-size: 12px; color: #666;">Thank you for your interest in Cloud Canvas!</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }

  // Send license renewal email when subscription payment is processed
  static async sendLicenseRenewalEmail(
    user: User,
    license: License,
    subscription: Subscription
  ): Promise<void> {
    // Use helper to generate dashboard URL
    const dashboardUrl = getAppUrl('dashboard');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: user.email,
      subject: "Your Cloud Canvas License Has Been Renewed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">License Renewal Confirmation</h2>
          <p>Dear ${user.firstName || user.email.split('@')[0]},</p>
          <p>We're pleased to confirm that your Cloud Canvas subscription payment has been processed successfully, and your license has been renewed.</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Plan:</strong> ${formatPlanName(subscription.plan)}</p>
            <p><strong>License Key:</strong> <span style="font-family: monospace;">${license.licenseKey}</span></p>
            <p><strong>New Expiration Date:</strong> ${formatDate(new Date(license.expiryDate))}</p>
            <p><strong>Next Billing Date:</strong> ${formatDate(new Date(subscription.endDate || ""))}</p>
          </div>
          
          <p>You don't need to do anything with your existing Cloud Canvas installation. Your license has been automatically extended, and your software will continue to work without interruption.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #2B3F6C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Dashboard</a>
          </div>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team at support@cloudcanvas.com.</p>
          <p style="font-size: 12px; color: #666;">Thank you for your continued support of Cloud Canvas!</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
  
  // Send payment failure email
  static async sendPaymentFailureEmail(
    user: User,
    subscription: Subscription
  ): Promise<void> {
    // Use helper to generate dashboard URL
    const dashboardUrl = getAppUrl('dashboard/billing');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: user.email,
      subject: "Action Required: Cloud Canvas Payment Failed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e63946; margin-bottom: 20px;">Payment Failed</h2>
          <p>Dear ${user.firstName || user.email.split('@')[0]},</p>
          <p>We were unable to process your recent payment for your Cloud Canvas subscription.</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Plan:</strong> ${formatPlanName(subscription.plan)}</p>
            <p><strong>Billing Type:</strong> ${subscription.billingType === "annual" ? "Annual" : "Monthly"}</p>
          </div>
          
          <p>To ensure uninterrupted access to Cloud Canvas, please update your payment information as soon as possible. PayPal will automatically retry the payment, but you can also update your payment details through your PayPal account or through our dashboard.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #2B3F6C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Update Payment Information</a>
          </div>
          
          <p><strong>Note:</strong> If your payment method is not updated successfully, your subscription and license may be suspended.</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team at support@cloudcanvas.com.</p>
          <p style="font-size: 12px; color: #666;">Thank you for your attention to this matter.</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
  
  // Send subscription cancellation email
  static async sendSubscriptionCancellationEmail(
    user: User,
    subscription: Subscription
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: user.email,
      subject: "Your Cloud Canvas Subscription Has Been Cancelled",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">Subscription Cancellation Confirmation</h2>
          <p>Dear ${user.firstName || user.email.split('@')[0]},</p>
          <p>We're sorry to see you go. This email confirms that your Cloud Canvas subscription has been cancelled as requested.</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Plan:</strong> ${formatPlanName(subscription.plan)}</p>
            <p><strong>Access Until:</strong> ${formatDate(new Date(subscription.endDate || ""))}</p>
          </div>
          
          <p>You'll continue to have access to Cloud Canvas until the end of your current billing period as shown above. After this date, your license will no longer be active, and you won't be charged again.</p>
          
          <p>We'd love to know what we could have done better. If you have a moment, please reply to this email with your feedback.</p>
          
          <p>If you change your mind, you can resubscribe at any time through our website.</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team at support@cloudcanvas.com.</p>
          <p style="font-size: 12px; color: #666;">Thank you for trying Cloud Canvas. We hope to welcome you back in the future!</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
  
  // Send subscription expired email
  static async sendSubscriptionExpiredEmail(
    user: User,
    subscription: Subscription
  ): Promise<void> {
    // Use helper to generate pricing URL
    const pricingUrl = getAppUrl('#pricing');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: user.email,
      subject: "Your Cloud Canvas Subscription Has Expired",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e63946; margin-bottom: 20px;">Subscription Expired</h2>
          <p>Dear ${user.firstName || user.email.split('@')[0]},</p>
          <p>Your Cloud Canvas subscription has expired, and your license is no longer active.</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Plan:</strong> ${formatPlanName(subscription.plan)}</p>
            <p><strong>Expired On:</strong> ${formatDate(new Date(subscription.endDate || ""))}</p>
          </div>
          
          <p>To regain access to Cloud Canvas, please renew your subscription:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pricingUrl}" style="background-color: #2B3F6C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Renew Subscription</a>
          </div>
          
          <p>If you have any saved projects, they will remain intact but will not be accessible until you renew your subscription.</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team at support@cloudcanvas.com.</p>
          <p style="font-size: 12px; color: #666;">We hope to see you back soon!</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
}
