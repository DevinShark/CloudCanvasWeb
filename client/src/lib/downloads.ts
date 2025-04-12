import { getApiUrl } from '@/config';

/**
 * Get a download URL for the Cloud Canvas installer
 * Requires an active license
 */
export async function getInstallerDownloadUrl(): Promise<string> {
  try {
    console.log('Fetching download URL from server...');
    const response = await fetch(`${getApiUrl()}/api/downloads/installer`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || 'Failed to get download URL');
    }

    const data = await response.json();
    console.log('Server response received, validating URL...');
    
    // Validate the download URL before returning it
    if (!data.downloadUrl) {
      console.error('Missing downloadUrl in server response:', data);
      throw new Error('Download URL missing from server response');
    }
    
    if (typeof data.downloadUrl !== 'string') {
      console.error('Invalid downloadUrl type in server response:', typeof data.downloadUrl);
      throw new Error('Invalid download URL format received from server');
    }
    
    if (!data.downloadUrl.startsWith('http')) {
      console.error('Download URL does not start with http:', data.downloadUrl.substring(0, 10) + '...');
      throw new Error('Invalid URL format received from server');
    }
    
    console.log('Download URL validated successfully');
    return data.downloadUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
} 