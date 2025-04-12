// Simple script to upload CloudCanvas installer to CloudFlare R2
// Using CloudFlare API with Bearer token - CommonJS version
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get the file path from command line args
const filePath = process.argv[2];
if (!filePath) {
  console.error('Error: Please provide a file path as an argument');
  console.error('Example: node upload-simple.js ./path/to/CloudCanvas-Installer.zip');
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

// Get file details
const fileName = path.basename(filePath);
const fileSize = fs.statSync(filePath).size;
const fileSizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

console.log(`Uploading ${fileName} (${fileSizeInMB} MB) to CloudFlare R2 bucket: ${bucketName}`);
console.log('This may take several minutes for large files...');

// First, get a direct upload URL
fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/direct_upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: fileName
  })
})
.then(response => {
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(`Failed to get upload URL: ${response.status} ${text}`);
    });
  }
  return response.json();
})
.then(data => {
  if (!data.success || !data.result || !data.result.uploadURL) {
    throw new Error('Invalid response from CloudFlare API');
  }
  
  // Now upload the file using the provided URL
  const uploadUrl = data.result.uploadURL;
  const fileContent = fs.readFileSync(filePath);
  
  return fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: fileContent
  });
})
.then(response => {
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(`Failed to upload file: ${response.status} ${text}`);
    });
  }
  
  console.log('Upload successful!');
  console.log(`File available at: ${bucketName}/${fileName}`);
  console.log('\nIMPORTANT: Make sure your .env file contains:');
  console.log(`INSTALLER_FILENAME=${fileName}`);
})
.catch(error => {
  console.error('Upload failed:', error);
  process.exit(1);
}); 