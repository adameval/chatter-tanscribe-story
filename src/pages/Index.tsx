
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { audioProcessingService } from "@/services/audioProcessingService";
import { apiService } from "@/services/apiService";
import { secureStorageService } from "@/services/secureStorageService";

// Components
import { Header } from "@/components/Header";
import { AudioInput } from "@/components/AudioInput";
import { TranscriptionOutput } from "@/components/TranscriptionOutput";
import { Translation } from "@/components/Translation";
import { LiveTranscription } from "@/components/LiveTranscription";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [transcription, setTranscription] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("-");
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  useEffect(() => {
    // Check if API key is available
    const checkApiKey = async () => {
      try {
        const apiKey = await secureStorageService.getApiKey();
        if (!apiKey) {
          setApiKeyDialogOpen(true);
        }
      } catch (error) {
        console.error("Error checking API key:", error);
      }
    };

    checkApiKey();
  }, []);

  const processAudioFile = async (filePath: string) => {
    // Check if API key exists first
    const apiKey = await secureStorageService.getApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key to use this feature",
        variant: "destructive",
      });
      setApiKeyDialogOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      setProgress(10);
      setStatus(`Processing file...`);
      console.log("Processing file:", filePath);
      
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

  const handleApiKeySaved = (apiKey: string) => {
    setApiKeyDialogOpen(false);
    toast({
      title: "Success",
      description: "API key saved successfully. You can now use the app.",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Header />
      
      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-primary/5 px-6 py-4">
          <CardTitle>Audio Input</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
      
      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-primary/5 px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle>Transcription</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <TranscriptionOutput 
            transcription={transcription}
            detectedLanguage={detectedLanguage}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-primary/5 px-6 py-4">
          <CardTitle>Translation</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Translation 
            transcription={transcription}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <ApiKeyDialog 
        open={apiKeyDialogOpen}
        onOpenChange={setApiKeyDialogOpen}
        onApiKeySaved={handleApiKeySaved}
      />
    </div>
  );
};

export default Index;
