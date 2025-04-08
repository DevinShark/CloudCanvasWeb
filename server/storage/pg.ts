import { eq } from 'drizzle-orm';
import { db } from '../db';
import { IStorage } from '../storage';
import {
  users, type User, type InsertUser,
  subscriptions, type Subscription, type InsertSubscription,
  licenses, type License, type InsertLicense,
  demoRequests, type DemoRequest, type InsertDemoRequest,
  contactMessages, type ContactMessage, type InsertContactMessage
} from '@shared/schema';

export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return results[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const results = await db.insert(users).values({
      ...userData,
      email: userData.email.toLowerCase()
    }).returning();
    return results[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const results = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  async setUserVerified(id: number, verified: boolean): Promise<User | undefined> {
    const results = await db.update(users)
      .set({ isVerified: verified, verificationToken: null })
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  async updateUserVerificationToken(id: number, token: string | null): Promise<User | undefined> {
    const results = await db.update(users)
      .set({ verificationToken: token })
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  async updateUserResetToken(id: number, token: string | null): Promise<User | undefined> {
    const results = await db.update(users)
      .set({ resetPasswordToken: token })
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  // Subscription methods
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const results = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return results[0];
  }

  async getSubscriptionByPaypalId(paypalId: string): Promise<Subscription | undefined> {
    const results = await db.select().from(subscriptions)
      .where(eq(subscriptions.paypalSubscriptionId, paypalId));
    return results[0];
  }

  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const results = await db.insert(subscriptions)
      .values(subscriptionData)
      .returning();
    return results[0];
  }

  async updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const results = await db.update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning();
    return results[0];
  }

  // License methods
  async getLicense(id: number): Promise<License | undefined> {
    const results = await db.select().from(licenses).where(eq(licenses.id, id));
    return results[0];
  }

  async getUserLicenses(userId: number): Promise<License[]> {
    return db.select().from(licenses).where(eq(licenses.userId, userId));
  }

  async createLicense(licenseData: InsertLicense): Promise<License> {
    const results = await db.insert(licenses)
      .values(licenseData)
      .returning();
    return results[0];
  }

  async updateLicense(id: number, data: Partial<InsertLicense>): Promise<License | undefined> {
    const results = await db.update(licenses)
      .set(data)
      .where(eq(licenses.id, id))
      .returning();
    return results[0];
  }

  // Demo request methods
  async createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest> {
    const results = await db.insert(demoRequests)
      .values(demoRequest)
      .returning();
    return results[0];
  }

  async getDemoRequests(): Promise<DemoRequest[]> {
    return db.select().from(demoRequests);
  }

  // Contact message methods
  async createContactMessage(contactMessage: InsertContactMessage): Promise<ContactMessage> {
    const results = await db.insert(contactMessages)
      .values(contactMessage)
      .returning();
    return results[0];
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }
} 