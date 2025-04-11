import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class R2Service {
  private client: S3Client;
  private bucket: string;

  constructor() {
    // Get credentials from environment variables
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    this.bucket = process.env.CLOUDFLARE_R2_BUCKET || 'cloud-canvas-installers';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error('Missing CloudFlare R2 credentials');
    }

    // Create S3 client for CloudFlare R2
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Generate a presigned URL for downloading a file
   * @param fileName The name of the file in the bucket
   * @param expirySeconds How long the URL should be valid for (in seconds)
   * @returns A presigned URL for the file
   */
  async getDownloadUrl(fileName: string, expirySeconds: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: expirySeconds,
      });

      return url;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }
}

// Export as a singleton
export const r2Service = new R2Service(); 