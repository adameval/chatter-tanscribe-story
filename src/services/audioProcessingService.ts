
import { Media } from '@capacitor-community/media';
import { Directory, Filesystem } from '@capacitor/filesystem';

/**
 * Service for audio/video processing operations using Capacitor plugins
 */
export const audioProcessingService = {
  /**
   * Converts a media file to a format compatible with the Whisper API
   * 
   * @param filePath Path to the media file
   * @returns Path to the converted file
   */
  async convertMediaFile(filePath: string): Promise<string> {
    try {
      // Extract the file name and create a new name for the converted file
      const fileName = filePath.split('/').pop();
      const outputFileName = `converted-${fileName?.split('.')[0]}.mp3`;
      const outputPath = `${Directory.Cache}/${outputFileName}`;

      // Use the Media plugin to convert the file to MP3 format
      // This is a simplified example - additional configuration may be needed
      await Media.convertMedia({
        path: filePath,
        to: outputPath,
        format: 'mp3',
        bitRate: 128000, // 128kbps
        sampleRate: 16000, // 16kHz (Whisper-friendly)
        channels: 1 // Mono (Whisper-friendly)
      });

      return outputPath;
    } catch (error) {
      console.error('Error converting media file:', error);
      throw new Error(`Failed to convert media file: ${error}`);
    }
  },

  /**
   * Splits a large audio file into smaller chunks for processing
   * 
   * @param filePath Path to the audio file
   * @param maxChunkSizeBytes Maximum size of each chunk in bytes (default: 24MB)
   * @returns Array of paths to the chunked files
   */
  async chunkMediaFile(filePath: string, maxChunkSizeBytes: number = 24 * 1024 * 1024): Promise<string[]> {
    try {
      // Get file info to check if chunking is needed
      const fileInfo = await Filesystem.stat({
        path: filePath,
        directory: Directory.Cache
      });

      // If file is under the limit, return it as-is
      if (fileInfo.size <= maxChunkSizeBytes) {
        return [filePath];
      }

      // For chunking, we would ideally use Media.splitMedia or similar
      // This is a placeholder for actual chunking implementation using Capacitor Media
      const outputPaths = [];
      const baseName = filePath.split('/').pop()?.split('.')[0] || 'chunk';
      
      // Placeholder - in a real implementation, this would use Media plugin functionality
      // to properly split the file into chunks with the correct overlap
      for (let i = 0; i < Math.ceil(fileInfo.size / maxChunkSizeBytes); i++) {
        const chunkPath = `${Directory.Cache}/chunk-${baseName}-${i}.mp3`;
        
        // This is where actual chunking would happen
        // For now, we'll simulate it by copying the whole file
        await Filesystem.copy({
          from: filePath,
          to: chunkPath,
          directory: Directory.Cache
        });
        
        outputPaths.push(chunkPath);
      }

      return outputPaths;
    } catch (error) {
      console.error('Error chunking media file:', error);
      throw new Error(`Failed to chunk media file: ${error}`);
    }
  }
};
