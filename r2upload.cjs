// Simple script to upload CloudCanvas installer to CloudFlare R2
// Using CloudFlare API with Bearer token - Using axios
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get the file path from command line args
const filePath = process.argv[2];
if (!filePath) {
  console.error('Error: Please provide a file path as an argument');
  console.error('Example: node r2upload.cjs ./path/to/CloudCanvas-Installer.zip');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found at ${filePath}`);
  process.exit(1);
}

// Get CloudFlare credentials from .env file
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET || 'cloud-canvas-installers';

// Check if credentials are set
if (!accountId || !apiToken) {
  console.error('Error: CloudFlare R2 credentials not found in .env file');
  console.error('Make sure to set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

// Print information for debugging
console.log(`Using Account ID: ${accountId}`);
console.log(`Using Bucket: ${bucketName}`);
console.log(`API Token (first 5 chars): ${apiToken.substring(0, 5)}...`);

// Get file details
const fileName = path.basename(filePath);
const fileSize = fs.statSync(filePath).size;
const fileSizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

console.log(`Uploading ${fileName} (${fileSizeInMB} MB) to CloudFlare R2 bucket: ${bucketName}`);
console.log('This may take several minutes for large files...');

async function uploadFile() {
  try {
    // First, check if the bucket exists using a simpler API call
    console.log('Verifying API token with CloudFlare...');
    try {
      const verifyResponse = await axios({
        method: 'GET',
        url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets`,
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      });
      
      console.log('Token verification successful!');
      console.log(`Found ${verifyResponse.data.result.buckets.length} buckets`);
      
      // Check if our target bucket exists
      const bucketExists = verifyResponse.data.result.buckets.some(bucket => bucket.name === bucketName);
      if (!bucketExists) {
        console.log(`Warning: Bucket '${bucketName}' not found in your account. It might be created automatically.`);
      } else {
        console.log(`Found bucket '${bucketName}'`);
      }
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error('Failed to verify API token');
    }
    
    // Get a direct upload URL
    console.log('Getting direct upload URL from CloudFlare...');
    const directUploadResponse = await axios({
      method: 'POST',
      url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/direct_upload`,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        name: fileName
      }
    });

    if (!directUploadResponse.data.success || !directUploadResponse.data.result || !directUploadResponse.data.result.uploadURL) {
      throw new Error('Invalid response from CloudFlare API');
    }

    // Get the upload URL
    const uploadUrl = directUploadResponse.data.result.uploadURL;
    console.log(`Got upload URL, now uploading ${fileSizeInMB} MB file...`);

    // Read the file
    const fileContent = fs.readFileSync(filePath);

    // Upload the file
    const uploadResponse = await axios({
      method: 'PUT',
      url: uploadUrl,
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      data: fileContent,
      maxBodyLength: Infinity, // Allow large file uploads
      maxContentLength: Infinity
    });

    console.log('Upload successful!');
    console.log(`File available at: ${bucketName}/${fileName}`);
    console.log('\nIMPORTANT: Make sure your .env file contains:');
    console.log(`INSTALLER_FILENAME=${fileName}`);
  } catch (error) {
    console.error('Upload failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

uploadFile(); 