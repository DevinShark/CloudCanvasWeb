import { PostgresStorage } from './pg';
import type { IStorage } from './types';

// Export the storage interface
export type { IStorage };

// Create and export the storage instance
export const storage: IStorage = new PostgresStorage(); 