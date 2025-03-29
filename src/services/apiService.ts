
import { secureStorageService } from './secureStorageService';
import { Filesystem } from '@capacitor/filesystem';

const OPENAI_API_URL = 'https://api.openai.com/v1';

interface TranscriptionOptions {
  file: File | Blob;
  model?: string;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

interface TranslationOptions {
  text: string;
  targetLanguage: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface SummarizationOptions {
  text: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export const apiService = {
  /**
   * Get the headers for OpenAI API requests
   */
  async getHeaders(): Promise<HeadersInit> {
    const apiKey = await secureStorageService.getApiKey();
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key in settings.');
    }
    
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  },
  
  /**
   * Transcribe audio using OpenAI Whisper API
   */
  async transcribeAudio(options: TranscriptionOptions): Promise<string> {
    const apiKey = await secureStorageService.getApiKey();
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key in settings.');
    }
    
    const formData = new FormData();
    formData.append('file', options.file);
    formData.append('model', options.model || 'whisper-1');
    
    if (options.language) {
      formData.append('language', options.language);
    }
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }
    
    formData.append('response_format', options.response_format || 'json');
    formData.append('temperature', String(options.temperature || 0));
    
    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.text;
  },
  
  /**
   * Transcribe audio from a file path
   */
  async transcribeFile(filePath: string, language?: string): Promise<string> {
    try {
      // Read the file
      const fileContent = await Filesystem.readFile({
        path: filePath
      });
      
      // Convert base64 to Blob
      // Make sure we're working with a string before using atob
      if (typeof fileContent.data !== 'string') {
        throw new Error('File content is not a valid base64 string');
      }
      
      const byteCharacters = atob(fileContent.data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'audio/mp3' });
      const file = new File([blob], 'audio.mp3', { type: 'audio/mp3' });
      
      // Transcribe the file
      return await this.transcribeAudio({
        file,
        language
      });
    } catch (error) {
      console.error('Error transcribing file:', error);
      throw new Error(`Failed to transcribe file: ${error}`);
    }
  },
  
  /**
   * Translate text using OpenAI GPT API
   */
  async translateText(options: TranslationOptions): Promise<string> {
    const headers = await this.getHeaders();
    
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${options.targetLanguage}. Maintain all formatting, paragraph breaks, and sentence structure. Only return the translated text, no explanations.`
          },
          {
            role: 'user',
            content: options.text
          }
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.max_tokens || 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Translation failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
  },
  
  /**
   * Summarize text using OpenAI GPT API
   */
  async summarizeText(options: SummarizationOptions): Promise<string> {
    const headers = await this.getHeaders();
    
    const prompt = `
**Role:** You are an AI Assistant specializing in creating concise and accurate summaries of business negotiations from transcripts.

**Task:** Analyze the following meeting transcript, where participants are labeled as Speaker 1, Speaker 2, ..., Speaker N (up to 10 participants). Generate a structured summary, paying close attention to the aspects below. **Crucially, the summary must be generated in the exact same language as the input transcript.**

1.  **Main Context:** Briefly describe the primary topic or purpose of the negotiation.
2.  **Key Discussion Points:** List the main points raised by the participants. Where possible, indicate which speaker raised which point.
3.  **Figures and Quantitative Data:** **Mandatory:** Extract and accurately state all mentioned numbers: monetary amounts, percentages, dates, deadlines, unit counts, metrics, etc.
4.  **Agreements Reached & Decisions Made:** **Clearly and verbatim capture** all explicit agreements, decisions made, or commitments undertaken. Specify *who* (which speaker) agreed on *what* or committed to *do what*.
5.  **Unresolved Issues or Disagreements:** Briefly mention any specific points where agreement was not reached or that require further discussion, if explicitly stated in the text.
6.  **Action Items:** If speakers defined specific tasks for themselves or others, list them in the format "Who (Speaker) -> Will do What -> [By Deadline, if specified]".

**Output Format:** Present the summary in a clear and easy-to-read format. Use headings or bullet points (especially for agreements and action items).

**Quality Requirements:**
*   **Language:** The output summary **must** be in the same language as the input transcript.
*   **Accuracy:** Maximum precision, especially regarding figures, names (if any), and the wording of agreements.
*   **Objectivity:** Do not add your own interpretation or assessment. Stick strictly to the facts presented in the transcript.
*   **Conciseness:** Avoid unnecessary details not pertinent to the core discussion or agreements.
*   **Meaning Preservation:** Do not distort the original meaning of the statements.
---
${options.text}
---`;
    
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.max_tokens || 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Summarization failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
  },
  
  /**
   * Perform live transcription and translation between Russian and Spanish
   */
  async liveTranscribe(audioBlob: Blob): Promise<{
    originalText: string;
    translatedText: string;
    detectedLanguage: 'russian' | 'spanish';
  }> {
    try {
      // 1. Transcribe the audio
      const transcription = await this.transcribeAudio({
        file: audioBlob
      });
      
      // 2. Determine language
      const detectedLanguage = this.detectLanguage(transcription);
      
      // 3. Translate to the other language
      const targetLanguage = detectedLanguage === 'russian' ? 'spanish' : 'russian';
      const translation = await this.translateText({
        text: transcription,
        targetLanguage
      });
      
      return {
        originalText: transcription,
        translatedText: translation,
        detectedLanguage
      };
    } catch (error) {
      console.error('Error in live transcription:', error);
      throw new Error(`Live transcription failed: ${error}`);
    }
  },
  
  /**
   * Simple language detection (simplified for demo)
   */
  detectLanguage(text: string): 'russian' | 'spanish' {
    // A very simplistic language detection approach
    // In a real app, we'd use a proper language detection library
    
    // Cyrillic characters are used in Russian
    const cyrillicPattern = /[\u0400-\u04FF]/;
    if (cyrillicPattern.test(text)) {
      return 'russian';
    }
    
    // Spanish characters and patterns
    const spanishPattern = /[áéíóúüñ¿¡]/i;
    if (spanishPattern.test(text)) {
      return 'spanish';
    }
    
    // Default to Spanish if we can't determine
    return 'spanish';
  }
};
