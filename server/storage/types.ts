import {
  type User, type InsertUser,
  type Subscription, type InsertSubscription,
  type License, type InsertLicense,
  type DemoRequest, type InsertDemoRequest,
  type ContactMessage, type InsertContactMessage
} from '../../shared/schema';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  setUserVerified(id: number, verified: boolean): Promise<User | undefined>;
  updateUserVerificationToken(id: number, token: string | null): Promise<User | undefined>;
  updateUserResetToken(id: number, token: string | null): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Subscription methods
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByPaypalId(paypalId: string): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined>;

  // License methods
  getLicense(id: number): Promise<License | undefined>;
  getLicenseByKey(key: string): Promise<License | undefined>;
  getUserLicenses(userId: number): Promise<License[]>;
  createLicense(license: InsertLicense): Promise<License>;
  updateLicense(id: number, data: Partial<InsertLicense>): Promise<License | undefined>;
  findTrialLicenseByUserId(userId: number): Promise<License | undefined>;

  // Demo request methods
  createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest>;
  getDemoRequests(): Promise<DemoRequest[]>;

  // Contact message methods
  createContactMessage(contactMessage: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
} 