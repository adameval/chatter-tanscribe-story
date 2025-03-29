
import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';
import { toast } from '@/hooks/use-toast';

// Note: In a production app, we would use more secure storage options
// like capacitor-secure-storage-plugin, but for simplicity we're using Preferences

const API_KEY_STORAGE_KEY = 'openai_api_key';

export const secureStorageService = {
  /**
   * Stores the OpenAI API key securely
   * 
   * @param apiKey The API key to store
   * @returns Promise<void>
   */
  async storeApiKey(apiKey: string): Promise<void> {
    try {
      // In a real production app, we would encrypt this value
      await Preferences.set({
        key: API_KEY_STORAGE_KEY,
        value: apiKey
      });
    } catch (error) {
      console.error('Error storing API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to store API key securely',
        variant: 'destructive'
      });
      throw error;
    }
  },

  /**
   * Retrieves the stored OpenAI API key
   * 
   * @returns Promise<string | null> The stored API key or null if not found
   */
  async getApiKey(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: API_KEY_STORAGE_KEY });
      return value;
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  },

  /**
   * Removes the stored OpenAI API key
   * 
   * @returns Promise<void>
   */
  async removeApiKey(): Promise<void> {
    try {
      await Preferences.remove({ key: API_KEY_STORAGE_KEY });
    } catch (error) {
      console.error('Error removing API key:', error);
      throw error;
    }
  },

  /**
   * Checks if the app is running on a real device (not a browser)
   * 
   * @returns Promise<boolean>
   */
  async isNativeDevice(): Promise<boolean> {
    const info = await Device.getInfo();
    return info.platform !== 'web';
  }
};
