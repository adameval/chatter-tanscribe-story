
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { audioProcessingService } from "@/services/audioProcessingService";
import { apiService } from "@/services/apiService";

// Components
import { Header } from "@/components/Header";
import { AudioInput } from "@/components/AudioInput";
import { TranscriptionOutput } from "@/components/TranscriptionOutput";
import { Translation } from "@/components/Translation";
import { LiveTranscription } from "@/components/LiveTranscription";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [transcription, setTranscription] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("-");
  const [isLiveActive, setIsLiveActive] = useState(false);

  const processAudioFile = async (filePath: string) => {
    try {
      setIsLoading(true);
      setProgress(10);
      setStatus(`Processing file...`);
      
      // Convert file if needed
      setProgress(20);
      const convertedFilePath = await audioProcessingService.convertMediaFile(filePath);
      setStatus("File converted. Preparing to transcribe...");
      setProgress(30);
      
      // Check if chunking is needed (large file)
      const chunks = await audioProcessingService.chunkMediaFile(convertedFilePath);
      
      if (chunks.length > 1) {
        setStatus(`File will be processed in ${chunks.length} chunks`);
      } else {
        setStatus("Transcribing audio...");
      }
      
      // Process each chunk
      let fullTranscription = '';
      for (let i = 0; i < chunks.length; i++) {
        setStatus(`Transcribing chunk ${i + 1}/${chunks.length}...`);
        setProgress(30 + (i / chunks.length) * 40);
        
        const chunkText = await apiService.transcribeFile(chunks[i]);
        fullTranscription += chunkText + ' ';
      }
      
      setStatus("Adding speaker diarization...");
      setProgress(80);
      
      // Add speaker diarization
      const diarizedText = await audioProcessingService.performDiarization(fullTranscription);
      
      setTranscription(diarizedText);
      setDetectedLanguage("English"); // Placeholder, would come from API
      setProgress(100);
      setStatus("Transcription complete");
      
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error",
        description: `Failed to process audio: ${error}`,
        variant: "destructive",
      });
      setStatus("Error processing audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Header />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Audio Input</CardTitle>
        </CardHeader>
        <CardContent>
          <AudioInput 
            onFileSelected={processAudioFile}
            isLoading={isLoading}
            progress={progress}
            status={status}
          />
        </CardContent>
      </Card>
      
      <LiveTranscription 
        isActive={isLiveActive} 
        onStatusChange={setIsLiveActive} 
      />
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <TranscriptionOutput 
            transcription={transcription}
            detectedLanguage={detectedLanguage}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Translation</CardTitle>
        </CardHeader>
        <CardContent>
          <Translation 
            transcription={transcription}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
