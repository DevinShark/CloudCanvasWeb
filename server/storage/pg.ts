import { eq, and, isNull, desc } from 'drizzle-orm';
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

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const results = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return results[0];
  }

  async setUserVerified(id: number, isVerified: boolean): Promise<void> {
    await db.update(users).set({ isVerified }).where(eq(users.id, id));
  }

  async updateUserVerificationToken(id: number, token: string | null): Promise<void> {
    await db.update(users).set({ verificationToken: token }).where(eq(users.id, id));
  }

  async updateUserResetToken(id: number, token: string | null): Promise<void> {
    await db.update(users).set({ resetPasswordToken: token }).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Subscription methods
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const results = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return results[0];
  }

  async getSubscriptionByPaypalId(paypalSubscriptionId: string): Promise<Subscription | undefined> {
    const results = await db.select().from(subscriptions).where(eq(subscriptions.paypalSubscriptionId, paypalSubscriptionId));
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

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const results = await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id)).returning();
    return results[0];
  }

  // License methods
  async getLicense(id: number): Promise<License | undefined> {
    const results = await db.select().from(licenses).where(eq(licenses.id, id));
    return results[0];
  }

  async getLicenseByKey(key: string): Promise<License | undefined> {
    const results = await db.select().from(licenses).where(eq(licenses.licenseKey, key));
    return results[0];
  }

  async getUserLicenses(userId: number): Promise<License[]> {
    console.error("[DEBUG] PostgresStorage.getUserLicenses called with userId:", {
      value: userId,
      type: typeof userId,
      isNaN: isNaN(userId)
    });
    
    try {
      const results = await db.select().from(licenses).where(eq(licenses.userId, userId));
      console.error("[DEBUG] Query results:", {
        count: results.length,
        userIds: results.map(l => l.userId)
      });
      return results;
    } catch (error) {
      console.error("[DEBUG] Error in getUserLicenses:", error);
      throw error;
    }
  }

  async createLicense(licenseData: InsertLicense): Promise<License> {
    // Ensure dates are Date objects before insertion
    const dataToInsert = {
      ...licenseData,
      expiryDate: licenseData.expiryDate instanceof Date ? licenseData.expiryDate : new Date(licenseData.expiryDate || Date.now()),
      createdAt: licenseData.createdAt instanceof Date ? licenseData.createdAt : new Date(licenseData.createdAt || Date.now())
    };
    const results = await db.insert(licenses)
      .values(dataToInsert)
      .returning();
    return results[0];
  }

  async updateLicense(id: number, updates: Partial<License>): Promise<License | undefined> {
    // Ensure dates are Date objects if provided in updates
    const dataToUpdate = { ...updates };
    if (updates.expiryDate) {
      dataToUpdate.expiryDate = updates.expiryDate instanceof Date ? updates.expiryDate : new Date(updates.expiryDate);
    }
     if (updates.createdAt) { // Handle createdAt if it can be updated
       dataToUpdate.createdAt = updates.createdAt instanceof Date ? updates.createdAt : new Date(updates.createdAt);
     }

    const results = await db.update(licenses).set(dataToUpdate).where(eq(licenses.id, id)).returning();
    return results[0];
  }

  async findTrialLicenseByUserId(userId: number): Promise<License | undefined> {
    const results = await db.select()
      .from(licenses)
      .where(and(
        eq(licenses.userId, userId),
        isNull(licenses.subscriptionId) // Trial licenses have NULL subscriptionId
      ))
      .orderBy(desc(licenses.createdAt)) // Get the most recent one if multiple exist
      .limit(1);
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