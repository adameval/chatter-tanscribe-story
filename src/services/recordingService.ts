
import { Directory, Filesystem } from '@capacitor/filesystem';

export const recordingService = {
  mediaRecorder: null as MediaRecorder | null,
  audioChunks: [] as Blob[],
  
  /**
   * Starts recording audio from the microphone
   * @returns Promise that resolves when recording starts
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error(`Failed to start recording: ${error}`);
    }
  },
  
  /**
   * Stops recording and saves the audio file
   * @returns Promise that resolves with the path to the audio file
   */
  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'));
        return;
      }
      
      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
          const fileName = `recording-${Date.now()}.mp3`;
          const filePath = `transcriber/${fileName}`;
          
          // Convert Blob to Base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Data = reader.result?.toString().split(',')[1] || '';
              
              // Save the file
              await Filesystem.writeFile({
                path: filePath,
                data: base64Data,
                directory: Directory.Cache,
                recursive: true
              });
              
              console.log('Recording saved to:', filePath);
              resolve(`${Directory.Cache}/${filePath}`);
            } catch (error) {
              console.error('Error saving recording:', error);
              reject(new Error(`Failed to save recording: ${error}`));
            }
          };
        } catch (error) {
          console.error('Error processing recording:', error);
          reject(new Error(`Failed to process recording: ${error}`));
        }
      };
      
      this.mediaRecorder.stop();
      // Stop all tracks to release the microphone
      const tracks = this.mediaRecorder.stream.getTracks();
      tracks.forEach(track => track.stop());
      this.mediaRecorder = null;
      console.log('Recording stopped');
    });
  }
};
