// Upload large file to CloudFlare R2
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get credentials from .env file
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET || 'cloud-canvas-installers';

// File to upload (pass as command line argument)
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file path as an argument');
  console.error('Example: node upload-to-r2.js ./CloudCanvas-Installer.zip');
  process.exit(1);
}

const fileName = path.basename(filePath);
const fileStream = fs.createReadStream(filePath);
const fileSize = fs.statSync(filePath).size;

// Create S3 client
const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function uploadFile() {
  console.log(`Uploading ${fileName} (${(fileSize / (1024 * 1024)).toFixed(2)} MB) to R2 bucket ${bucketName}...`);
  
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileStream,
      ContentType: 'application/octet-stream'
    });
    
    const result = await client.send(command);
    console.log('Upload successful!');
    console.log(`File available at ${bucketName}/${fileName}`);
    
    // Update the file name in the download controller
    console.log('\nIMPORTANT: Make sure to update your download.ts controller to use this filename:');
    console.log(`const fileName = "${fileName}"; // Name of the file in your R2 bucket`);
    
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

uploadFile(); 