import {
  users, type User, type InsertUser,
  subscriptions, type Subscription, type InsertSubscription,
  licenses, type License, type InsertLicense,
  demoRequests, type DemoRequest, type InsertDemoRequest,
  contactMessages, type ContactMessage, type InsertContactMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  setUserVerified(id: number, verified: boolean): Promise<User | undefined>;
  updateUserVerificationToken(id: number, token: string | null): Promise<User | undefined>;
  updateUserResetToken(id: number, token: string | null): Promise<User | undefined>;
  
  // Subscription methods
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByPaypalId(paypalId: string): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  
  // License methods
  getLicense(id: number): Promise<License | undefined>;
  getUserLicenses(userId: number): Promise<License[]>;
  createLicense(license: InsertLicense): Promise<License>;
  updateLicense(id: number, data: Partial<InsertLicense>): Promise<License | undefined>;
  
  // Demo request methods
  createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest>;
  getDemoRequests(): Promise<DemoRequest[]>;
  
  // Contact message methods
  createContactMessage(contactMessage: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subscriptions: Map<number, Subscription>;
  private licenses: Map<number, License>;
  private demoRequests: Map<number, DemoRequest>;
  private contactMessages: Map<number, ContactMessage>;
  
  private userIdCounter: number = 1;
  private subscriptionIdCounter: number = 1;
  private licenseIdCounter: number = 1;
  private demoRequestIdCounter: number = 1;
  private contactMessageIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.subscriptions = new Map();
    this.licenses = new Map();
    this.demoRequests = new Map();
    this.contactMessages = new Map();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const user: User = {
      id,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      company: userData.company || null,
      isVerified: false,
      verificationToken: null,
      resetPasswordToken: null,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async setUserVerified(id: number, verified: boolean): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      isVerified: verified,
      verificationToken: null // Clear verification token after verification
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserVerificationToken(id: number, token: string | null): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      verificationToken: token
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserResetToken(id: number, token: string | null): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      resetPasswordToken: token
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Subscription methods
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async getSubscriptionByPaypalId(paypalId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.paypalSubscriptionId === paypalId
    );
  }
  
  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (subscription) => subscription.userId === userId
    );
  }
  
  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    
    const subscription: Subscription = {
      id,
      ...subscriptionData
    };
    
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const subscription = await this.getSubscription(id);
    if (!subscription) return undefined;
    
    const updatedSubscription: Subscription = {
      ...subscription,
      ...data
    };
    
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  // License methods
  async getLicense(id: number): Promise<License | undefined> {
    return this.licenses.get(id);
  }
  
  async getUserLicenses(userId: number): Promise<License[]> {
    return Array.from(this.licenses.values()).filter(
      (license) => license.userId === userId
    );
  }
  
  async createLicense(licenseData: InsertLicense): Promise<License> {
    const id = this.licenseIdCounter++;
    
    const license: License = {
      id,
      ...licenseData
    };
    
    this.licenses.set(id, license);
    return license;
  }
  
  async updateLicense(id: number, data: Partial<InsertLicense>): Promise<License | undefined> {
    const license = await this.getLicense(id);
    if (!license) return undefined;
    
    const updatedLicense: License = {
      ...license,
      ...data
    };
    
    this.licenses.set(id, updatedLicense);
    return updatedLicense;
  }
  
  // Demo request methods
  async createDemoRequest(demoRequestData: InsertDemoRequest): Promise<DemoRequest> {
    const id = this.demoRequestIdCounter++;
    const now = new Date();
    
    const demoRequest: DemoRequest = {
      id,
      ...demoRequestData,
      status: "pending",
      createdAt: now
    };
    
    this.demoRequests.set(id, demoRequest);
    return demoRequest;
  }
  
  async getDemoRequests(): Promise<DemoRequest[]> {
    return Array.from(this.demoRequests.values());
  }
  
  // Contact message methods
  async createContactMessage(contactMessageData: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageIdCounter++;
    const now = new Date();
    
    const contactMessage: ContactMessage = {
      id,
      ...contactMessageData,
      status: "unread",
      createdAt: now
    };
    
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
}

// Create and export a singleton instance of storage
export const storage = new MemStorage();
