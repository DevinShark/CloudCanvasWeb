import { getApiUrl } from '@/config';

/**
 * Get a download URL for the Cloud Canvas installer
 * Requires an active license
 */
export async function getInstallerDownloadUrl(): Promise<string> {
  try {
    const response = await fetch(`${getApiUrl()}/api/downloads/installer`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get download URL');
    }

    const data = await response.json();
    
    // Validate the download URL before returning it
    if (!data.downloadUrl || typeof data.downloadUrl !== 'string') {
      throw new Error('Invalid download URL received from server');
    }
    
    return data.downloadUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
} 