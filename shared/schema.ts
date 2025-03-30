import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  company: true
});

// Subscription model
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  paypalSubscriptionId: text("paypal_subscription_id").notNull(),
  plan: text("plan").notNull(), // standard, professional, enterprise
  status: text("status").notNull(), // active, cancelled, expired
  billingType: text("billing_type").notNull(), // monthly, annual
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  paypalSubscriptionId: true,
  plan: true,
  status: true,
  billingType: true,
  startDate: true,
  endDate: true
});

// License model
export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id), // Made nullable for trial licenses
  licenseKey: text("license_key").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Modified schema to make subscriptionId optional for trial licenses
export const insertLicenseSchema = createInsertSchema(licenses)
  .pick({
    userId: true,
    licenseKey: true,
    isActive: true,
    expiryDate: true
  })
  .extend({
    subscriptionId: z.number().nullable().optional(), // Allow null for trial licenses
    createdAt: z.string().optional() // Allow string ISO dates
  });

// Demo request model
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  message: text("message"),
  status: text("status").default("pending").notNull(), // pending, scheduled, completed
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).pick({
  fullName: true,
  email: true,
  company: true,
  industry: true,
  message: true
});

// Contact message model
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread").notNull(), // unread, read, responded
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" })
});

export type LoginData = z.infer<typeof loginSchema>;

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
});

export type PasswordResetData = z.infer<typeof passwordResetSchema>;
