import axios from 'axios';

const LICENSE_KEY = '8f1d2b60-066a-46c8-b183-3d39a1d9e649';
const API_KEY = 'b2a275d2-c4d5-4261-9d95-0df4b3926d30';

async function getLicenseDetails() {
  try {
    console.log('Getting license details...');
    const options = {
      method: 'GET',
      url: `https://api.licensegate.io/admin/licenses/key/${LICENSE_KEY}`,
      headers: {
        'Authorization': API_KEY
      }
    };
    
    const { data } = await axios.request(options);
    console.log('License details:', JSON.stringify(data, null, 2));
    return data;
  } catch (error: unknown) {
    // Use standard Axios error checking for ESM
    if (axios.isAxiosError(error)) {
      console.error('Error getting license details:', error.response?.data);
    } else if (error instanceof Error) {
      console.error('Error getting license details:', error.message);
    } else {
      console.error('Error getting license details:', String(error));
    }
    throw error;
  }
}

async function main() {
  try {
    await getLicenseDetails();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Script failed:', error.message);
    } else {
      console.error('Script failed:', String(error));
    }
    process.exit(1);
  }
}

main(); 