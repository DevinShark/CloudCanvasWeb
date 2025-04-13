import { getApiUrl } from '@/config';

/**
 * Get a download URL for the Cloud Canvas installer
 * Requires an active license and a valid CAPTCHA token
 */
export async function getInstallerDownloadUrl(captchaToken: string): Promise<string> {
  try {
    console.log('Fetching download URL from server with CAPTCHA token...');
    const apiUrl = getApiUrl('/api/downloads/installer');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ captchaToken }),
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
    
    console.log('[downloads.ts] Before startsWith check - URL:', data.downloadUrl);
    console.log('[downloads.ts] Before startsWith check - Type:', typeof data.downloadUrl);
    
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