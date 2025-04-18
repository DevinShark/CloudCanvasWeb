import nodemailer from "nodemailer";
import { User, Subscription, License } from "@shared/schema";
import { formatPlanName, formatDate } from "../lib/utils";

// Set up email transport
// Ensure required environment variables are set for email functionality
if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("CRITICAL ERROR: Missing required email environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD). Email functionality will likely fail.");
}

console.log("Email configuration:", {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  secure: process.env.EMAIL_SECURE,
  from: process.env.EMAIL_FROM
});

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true // Enable debug logging
});

// Test the email configuration
console.log("Testing email configuration...");
transporter.verify((error) => {
  if (error) {
    console.error("Email configuration error:", error);
    console.error("Error details:", {
      code: (error as any).code,
      command: (error as any).command,
      response: (error as any).response,
      responseCode: (error as any).responseCode,
      stack: error.stack
    });
  } else {
    console.log("Email server is ready to send messages");
    
    // Test sending a simple email
    console.log("Testing email sending...");
    transporter.sendMail({
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: process.env.EMAIL_USER,
      subject: "Cloud Canvas Email Test",
      text: "This is a test email to verify the email configuration."
    }, (error, info) => {
      if (error) {
        console.error("Test email failed:", error);
        console.error("Error details:", {
          code: (error as any).code,
          command: (error as any).command,
          response: (error as any).response,
          responseCode: (error as any).responseCode,
          stack: error.stack
        });
      } else {
        console.log("Test email sent successfully:", info);
      }
    });
  }
});

// Helper function to generate application URLs that work in both development and production
function getAppUrl(path: string = ''): string {
  // For API routes, use the backend URL
  if (path.startsWith('api/') || path.startsWith('/api/')) {
    const baseUrl = process.env.API_URL || "https://cloudcanvas-backend.onrender.com";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBaseUrl}${cleanPath}`;
  }
  
  // For client-side routes, use the frontend URL
  const baseUrl = process.env.APP_URL || "https://cloudcanvas.wuaze.com";
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  console.log(`Generated URL: ${cleanBaseUrl}${cleanPath}`);
  return `${cleanBaseUrl}${cleanPath}`;
}

// Email service class for sending various emails
export class EmailService {
  // Send email verification
  static async sendVerificationEmail(user: User, verificationToken: string): Promise<void> {
    try {
      console.log("Preparing verification email for:", user.email);
      
      // Use helper to generate verification URL for the API route
      const verificationUrl = getAppUrl(`api/auth/verify-email/${verificationToken}`);
      console.log("Verification URL generated:", verificationUrl);
      
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
      
      console.log("Sending verification email...");
      console.log("Mail options:", {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", {
        messageId: info.messageId,
        response: info.response,
        previewUrl: nodemailer.getTestMessageUrl(info)
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
          command: (error as any).command,
          response: (error as any).response,
          responseCode: (error as any).responseCode
        });
      }
      throw error; // Re-throw to handle in the registration process
    }
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
  
  // Send demo request notification email to admin
  static async sendDemoRequestNotificationEmail(
    fullName: string,
    email: string,
    company: string,
    industry: string,
    message: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: "dms@live.co.za", // Forward to this email
      subject: `[Cloud Canvas] New Demo Request: ${fullName} from ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">New Demo Request Submission</h2>
          <p>A new demo request has been submitted with the following details:</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Industry:</strong> ${industry}</p>
            ${message ? `<p><strong>Additional Message:</strong></p><p style="white-space: pre-wrap;">${message}</p>` : ''}
          </div>
          
          <p>You can respond directly to this person by replying to their email: ${email}</p>
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
  
  // Send contact form notification email to admin
  static async sendContactFormNotificationEmail(
    name: string,
    email: string,
    subject: string,
    message: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Cloud Canvas <no-reply@cloudcanvas.com>",
      to: "dms@live.co.za", // Forward to this email
      subject: `[Cloud Canvas] New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3F6C; margin-bottom: 20px;">New Contact Form Submission</h2>
          <p>A new contact form has been submitted with the following details:</p>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>You can respond directly to this person by replying to their email: ${email}</p>
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
