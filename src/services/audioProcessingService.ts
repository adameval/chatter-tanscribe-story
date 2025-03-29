
import { Directory, Filesystem } from '@capacitor/filesystem';

/**
 * Service for audio/video processing operations using Capacitor plugins
 */
export const audioProcessingService = {
  /**
   * Converts a media file to a format compatible with the Whisper API
   * Note: In a real implementation, this would use a native FFmpeg integration
   * through a Capacitor plugin or native code. For now, it's a placeholder.
   * 
   * @param filePath Path to the media file
   * @returns Path to the converted file
   */
  async convertMediaFile(filePath: string): Promise<string> {
    try {
      // Check if filePath is valid
      if (!filePath) {
        throw new Error('Invalid file path: Path is empty or undefined');
      }
      
      // Extract the file name from the path
      const filePathParts = filePath.split('/');
      const fileName = filePathParts[filePathParts.length - 1];
      
      if (!fileName) {
        throw new Error('Invalid file path structure: Could not extract filename');
      }
      
      // Create a new name for the converted file
      const fileNameParts = fileName.split('.');
      const extension = fileNameParts.length > 1 ? fileNameParts.pop() : 'mp3';
      const baseName = fileNameParts.join('.');
      const outputFileName = `converted-${baseName}.mp3`;
      const outputPath = `transcriber/${outputFileName}`;
      
      console.log(`Converting ${fileName} to ${outputFileName}`);
      
      try {
        // Check if the source file exists and is accessible
        await Filesystem.stat({
          path: filePath
        });
      } catch (error) {
        console.error('Error accessing source file:', error);
        throw new Error(`Source file not accessible: ${error}`);
      }
      
      // Ensure the transcriber directory exists
      try {
        await Filesystem.mkdir({
          path: 'transcriber',
          directory: Directory.Cache,
          recursive: true
        });
      } catch (error) {
        // Directory might already exist, that's fine
        console.log('Directory might already exist:', error);
      }
      
      // Copy the file to our app's directory
      await Filesystem.copy({
        from: filePath,
        to: outputPath,
        directory: Directory.Cache
      });
      
      const fullOutputPath = `${Directory.Cache}/transcriber/${outputFileName}`;
      console.log('Converted file path:', fullOutputPath);
      return fullOutputPath;
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
      if (!filePath) {
        throw new Error('Invalid file path: Path is empty or undefined');
      }
      
      // Get file info to check if chunking is needed
      const fileInfo = await Filesystem.stat({
        path: filePath
      });

      // If file is under the limit, return it as-is
      if (fileInfo.size <= maxChunkSizeBytes) {
        return [filePath];
      }

      // Prepare for chunking
      const outputPaths = [];
      
      // Extract base name for chunking
      const filePathParts = filePath.split('/');
      const fileName = filePathParts[filePathParts.length - 1];
      const fileNameParts = fileName.split('.');
      const baseName = fileNameParts.length > 1 ? fileNameParts.slice(0, -1).join('.') : fileName;
      
      // In a real implementation, this would use FFmpeg or another tool to split the audio
      // For now, we'll simulate chunking by copying the file
      const chunkCount = Math.ceil(fileInfo.size / maxChunkSizeBytes);
      
      for (let i = 0; i < chunkCount; i++) {
        const chunkFileName = `chunk-${baseName}-${i}.mp3`;
        const chunkPath = `transcriber/${chunkFileName}`;
        
        await Filesystem.copy({
          from: filePath,
          to: chunkPath,
          directory: Directory.Cache
        });
        
        outputPaths.push(`${Directory.Cache}/transcriber/${chunkFileName}`);
      }

      return outputPaths;
    } catch (error) {
      console.error('Error chunking media file:', error);
      throw new Error(`Failed to chunk media file: ${error}`);
    }
  },
  
  /**
   * Performs speaker diarization on an audio file
   * Note: This is a placeholder. In a real implementation, this would use
   * a local diarization library integrated with the app.
   * 
   * @param transcription Transcribed text to add speaker labels to
   * @returns Diarized text with speaker labels
   */
  async performDiarization(transcription: string): Promise<string> {
    try {
      // In a real implementation, this would process the audio and detect speakers
      // For now, we'll simulate diarization by adding speaker labels to each paragraph
      
      if (!transcription) {
        return transcription;
      }
      
      const paragraphs = transcription.split('\n').filter(p => p.trim().length > 0);
      
      let currentSpeaker = 1;
      let diarizedText = '';
      
      for (const paragraph of paragraphs) {
        // Simple alternation between speakers for this placeholder
        diarizedText += `Speaker ${currentSpeaker}: ${paragraph}\n\n`;
        currentSpeaker = currentSpeaker === 1 ? 2 : 1;
      }
      
      return diarizedText;
    } catch (error) {
      console.error('Error performing diarization:', error);
      throw new Error(`Failed to perform diarization: ${error}`);
    }
  }
};
