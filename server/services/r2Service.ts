import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class R2Service {
  private client: S3Client | null = null;
  private bucket: string;
  private isConfigured: boolean = false;

  constructor() {
    // Get credentials from environment variables
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    this.bucket = process.env.CLOUDFLARE_R2_BUCKET || 'cloud-canvas-installers';

    // Check if all required credentials are available
    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error('Missing CloudFlare R2 credentials:', {
        accountId: accountId ? 'set' : 'missing',
        accessKeyId: accessKeyId ? 'set' : 'missing',
        secretAccessKey: secretAccessKey ? 'set' : 'missing'
      });
      return;
    }

    try {
      console.log(`Initializing R2 client for bucket: ${this.bucket}`);
      // Create S3 client for CloudFlare R2
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isConfigured = true;
      console.log('CloudFlare R2 client initialized successfully');
    } catch (error) {
      console.error('Error initializing CloudFlare R2 client:', error);
      this.client = null;
    }
  }

  /**
   * Generate a presigned URL for downloading a file
   * @param fileName The name of the file in the bucket
   * @param expirySeconds How long the URL should be valid for (in seconds)
   * @returns A presigned URL for the file
   */
  async getDownloadUrl(fileName: string, expirySeconds: number = 3600): Promise<string> {
    try {
      console.log(`R2Service: Generating download URL for file: ${fileName}`);
      
      // Check if client is properly configured
      if (!this.isConfigured || !this.client) {
        console.error('R2Service: client not properly configured');
        throw new Error('R2 client not properly configured');
      }

      // Check if fileName is provided
      if (!fileName) {
        console.error('R2Service: File name is required');
        throw new Error('File name is required');
      }

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
      });

      console.log(`R2Service: Generating signed URL with expiry: ${expirySeconds} seconds`);
      
      try {
        const url = await getSignedUrl(this.client, command, {
          expiresIn: expirySeconds,
        });
  
        if (!url) {
          console.error('R2Service: Failed to generate signed URL - returned null/undefined');
          throw new Error('Failed to generate signed URL');
        }
  
        if (typeof url !== 'string') {
          console.error(`R2Service: URL is not a string, type: ${typeof url}`);
          throw new Error('Invalid URL type returned from R2 service');
        }
  
        if (!url.startsWith('http')) {
          console.error(`R2Service: Invalid URL format, doesn't start with http`);
          throw new Error('Invalid URL format generated');
        }
  
        console.log(`R2Service: URL generated successfully, length: ${url.length}`);
        return url;
      } catch (signError: any) {
        console.error('R2Service: Error during URL signing:', signError);
        throw new Error(`Failed to sign URL: ${signError.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('R2Service: Error generating download URL:', error);
      throw new Error(`Failed to generate download URL: ${error.message || 'Unknown error'}`);
    }
  }
}

// Export as a singleton
export const r2Service = new R2Service(); 