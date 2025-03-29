import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Mic, Save, Folder, Link as LinkIcon, Play, StopCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { FilePicker } from "@capawesome/capacitor-file-picker";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { audioProcessingService } from "@/services/audioProcessingService";

const Index = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [transcription, setTranscription] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("-");
  const [sourceText, setSourceText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("russian");
  const [translation, setTranslation] = useState("");
  const [mediaURL, setMediaURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useState(() => {
    // TODO: Check for stored API key in secure storage
    // If not found, prompt user to enter it
  });

  const handleFileSelect = async () => {
    try {
      setStatus("Selecting file...");
      setIsLoading(true);
      setProgress(10);

      const result = await FilePicker.pickFiles({
        types: ["audio/mpeg", "audio/wav", "video/mp4", "audio/x-m4a"],
      });

      if (result.files.length > 0) {
        const file = result.files[0];
        setStatus(`Processing ${file.name}...`);
        setProgress(20);
        
        // Convert file if needed
        const convertedFilePath = await audioProcessingService.convertMediaFile(file.path);
        setStatus("File converted. Preparing to transcribe...");
        setProgress(30);
        
        // Check if chunking is needed (large file)
        const chunks = await audioProcessingService.chunkMediaFile(convertedFilePath);
        
        if (chunks.length > 1) {
          setStatus(`File will be processed in ${chunks.length} chunks`);
        } else {
          setStatus("Ready to transcribe");
        }
        
        // TODO: Send to OpenAI Whisper API
        // For now just set a placeholder
        setTranscription("This is a placeholder transcription. Actual transcription will be implemented with OpenAI Whisper API.");
        setDetectedLanguage("English");
        setProgress(100);
        setStatus("Transcription complete");
        
      } else {
        setStatus("No file selected");
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      toast({
        title: "Error",
        description: `Failed to process file: ${error}`,
        variant: "destructive",
      });
      setStatus("Error selecting file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleURLSubmit = async () => {
    try {
      if (!mediaURL) {
        toast({
          title: "Error",
          description: "Please enter a valid URL",
          variant: "destructive",
        });
        return;
      }

      setStatus("Downloading from URL...");
      setIsLoading(true);
      setProgress(10);

      // TODO: Implement URL download logic
      // For now just set a placeholder
      setTranscription("This is a placeholder transcription from URL. Actual functionality will be implemented.");
      setDetectedLanguage("English");
      setProgress(100);
      setStatus("Transcription complete");
    } catch (error) {
      console.error("Error processing URL:", error);
      toast({
        title: "Error",
        description: `Failed to process URL: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: "Recording functionality will be implemented",
    });
  };

  const handleTranslate = async () => {
    try {
      const textToTranslate = sourceText || transcription;
      if (!textToTranslate) {
        toast({
          title: "Error",
          description: "No text to translate",
          variant: "destructive",
        });
        return;
      }

      setStatus("Translating...");
      setIsLoading(true);
      setProgress(50);

      // TODO: Implement translation with OpenAI GPT API
      // For now just set a placeholder
      setTranslation(`This is a placeholder translation to ${targetLanguage}. Actual translation will be implemented with OpenAI GPT API.`);
      setProgress(100);
      setStatus("Translation complete");
    } catch (error) {
      console.error("Error translating:", error);
      toast({
        title: "Error",
        description: `Failed to translate: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    try {
      if (!transcription) {
        toast({
          title: "Error",
          description: "No transcription to summarize",
          variant: "destructive",
        });
        return;
      }

      setStatus("Summarizing...");
      setIsLoading(true);
      setProgress(50);

      // TODO: Implement summarization with OpenAI GPT API
      // For now just set a placeholder
      toast({
        title: "Summary",
        description: "This is a placeholder summary. Actual summarization will be implemented with OpenAI GPT API.",
      });
      setProgress(100);
      setStatus("Summarization complete");
    } catch (error) {
      console.error("Error summarizing:", error);
      toast({
        title: "Error",
        description: `Failed to summarize: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTranscription = async () => {
    try {
      if (!transcription) {
        toast({
          title: "Error",
          description: "No transcription to save",
          variant: "destructive",
        });
        return;
      }

      setStatus("Saving transcription...");
      setIsLoading(true);

      // TODO: Implement save functionality
      // For now just show a notification
      toast({
        title: "Success",
        description: "Transcription saved successfully (placeholder)",
      });
      setStatus("Transcription saved");
    } catch (error) {
      console.error("Error saving transcription:", error);
      toast({
        title: "Error",
        description: `Failed to save transcription: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Transcriber & Translator</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Audio Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleFileSelect} 
              disabled={isLoading}
              className="flex-1"
            >
              <Folder className="mr-2 h-4 w-4" />
              Select File
            </Button>
            <Button 
              onClick={toggleRecording} 
              disabled={isLoading}
              variant={isRecording ? "destructive" : "default"}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Record Audio
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input 
              placeholder="Enter Media URL" 
              value={mediaURL}
              onChange={(e) => setMediaURL(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleURLSubmit} 
              disabled={isLoading || !mediaURL}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Load URL
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">{status}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transcription</CardTitle>
          <div className="text-sm text-muted-foreground">
            Detected Language: {detectedLanguage}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={transcription} 
            readOnly 
            className="min-h-[200px] font-mono"
            placeholder="Transcription will appear here..."
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleSummarize}
              disabled={isLoading || !transcription}
              variant="outline"
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              Summarize
            </Button>
            <Button
              onClick={handleSaveTranscription}
              disabled={isLoading || !transcription}
              variant="outline"
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Translation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter text to translate, or leave empty to use transcription above"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="min-h-[100px]"
            disabled={isLoading}
          />
          
          <div className="flex items-center gap-4">
            <span>Translate to:</span>
            <Select
              value={targetLanguage}
              onValueChange={setTargetLanguage}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="russian">Russian</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="catalan">Catalan</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="portuguese">Portuguese</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
                <SelectItem value="korean">Korean</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleTranslate}
              disabled={isLoading || (!sourceText && !transcription)}
              className="ml-auto"
            >
              Translate
            </Button>
          </div>

          <Textarea
            value={translation}
            readOnly
            className="min-h-[100px]"
            placeholder="Translation will appear here..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
