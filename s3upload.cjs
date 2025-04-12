// CloudFlare R2 upload using the S3-compatible API
// This is the recommended approach for large file uploads
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get the file path from command line args
const filePath = process.argv[2];
if (!filePath) {
  console.error('Error: Please provide a file path as an argument');
  console.error('Example: node s3upload.cjs ./path/to/CloudCanvas-Installer.zip');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found at ${filePath}`);
  process.exit(1);
}

// Get CloudFlare R2 credentials from .env file
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET || 'cloud-canvas-installers';

// Check if credentials are set
if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error('Error: CloudFlare R2 S3 credentials not found in .env file');
  console.error('Make sure to set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY');
  process.exit(1);
}

// Print information for debugging
console.log(`Using Account ID: ${accountId}`);
console.log(`Using Bucket: ${bucketName}`);
console.log(`Using Access Key ID: ${accessKeyId.substring(0, 5)}...`);

// Get file details
const fileName = path.basename(filePath);
const fileSize = fs.statSync(filePath).size;
const fileSizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

// Create S3 client for CloudFlare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

console.log(`Uploading ${fileName} (${fileSizeInMB} MB) to CloudFlare R2 bucket: ${bucketName}`);
console.log('This may take several minutes for large files...');

async function uploadFile() {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath);
    
    // Configure the upload command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: 'application/octet-stream'
    });
    
    // Upload the file
    console.log(`Starting upload of ${fileSizeInMB} MB...`);
    const response = await s3Client.send(command);
    
    console.log('Upload successful!');
    console.log(`File available at: ${bucketName}/${fileName}`);
    console.log('\nIMPORTANT: Make sure your .env file contains:');
    console.log(`INSTALLER_FILENAME=${fileName}`);
    
    return response;
  } catch (error) {
    console.error('Upload failed:', error.message);
    process.exit(1);
  }
}

uploadFile(); 