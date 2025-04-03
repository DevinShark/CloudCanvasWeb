import fetch from 'node-fetch';

// API credentials
const USER_ID = 'a1ee1';  // Your LicenseGate User ID
const LICENSE_KEY = '8f1d2b60-066a-46c8-b183-3d39a1d9e649';  // Your existing license key
const API_KEY = 'fd8aaecd-0ff6-46d2-b54d-8e02a4c5ba19';  // Your LicenseGate API Key
const API_URL = 'https://api.licensegate.io';

async function createLicense() {
  try {
    const endpoint = `${API_URL}/admin/licenses`;
    console.log('Creating new license at:', endpoint);
    
    // Following exactly the LicenseGate documentation
    const licenseData = {
      active: true,
      name: "CloudCanvas Test License",
      notes: "Created via API test",
      ipLimit: null,
      licenseScope: null,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      validationPoints: null,
      validationLimit: null,
      replenishAmount: null,
      replenishInterval: "TEN_SECONDS"
    };

    console.log('Request body:', JSON.stringify(licenseData, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(licenseData)
    });

    // Log everything for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const text = await response.text();
    console.log('Raw response:', text);

    try {
      const data = JSON.parse(text);
      console.log('License creation response:', data);
      return data;
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return text;
    }
  } catch (error) {
    console.error('Error creating license:', error);
    throw error;
  }
}

async function verifyLicense() {
  try {
    // Format: /license/{userId}/{licenseKey}/verify
    const endpoint = `${API_URL}/license/${USER_ID}/${LICENSE_KEY}/verify`;
    console.log('Verifying license at:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Log everything for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const text = await response.text();
    console.log('Raw response:', text);

    try {
      const data = JSON.parse(text);
      console.log('License verification response:', data);
      return data;
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return text;
    }
  } catch (error) {
    console.error('Error verifying license:', error);
    throw error;
  }
}

// Run the test
createLicense().then(async (result) => {
  console.log('\nNow verifying the existing license:');
  await verifyLicense();
}); 