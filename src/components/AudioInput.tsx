
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Folder, Mic, StopCircle, Link as LinkIcon } from "lucide-react";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { recordingService } from "@/services/recordingService";
import { useToast } from "@/hooks/use-toast";

interface AudioInputProps {
  onFileSelected: (filePath: string) => void;
  isLoading: boolean;
  progress: number;
  status: string;
}

export function AudioInput({ onFileSelected, isLoading, progress, status }: AudioInputProps) {
  const { toast } = useToast();
  const [mediaURL, setMediaURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleFileSelect = async () => {
    try {
      const result = await FilePicker.pickFiles({
        types: ["audio/mpeg", "audio/wav", "video/mp4", "audio/x-m4a"],
      });

      if (result.files.length > 0) {
        const file = result.files[0];
        onFileSelected(file.path);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      toast({
        title: "Error",
        description: `Failed to process file: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleURLSubmit = async () => {
    if (!mediaURL) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual URL download
    toast({
      title: "Info",
      description: "URL processing not yet implemented",
    });
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        const filePath = await recordingService.stopRecording();
        setIsRecording(false);
        onFileSelected(filePath);
      } else {
        await recordingService.startRecording();
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Error with recording:", error);
      toast({
        title: "Error",
        description: `Recording error: ${error}`,
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button 
          onClick={handleFileSelect} 
          disabled={isLoading || isRecording}
          className="flex-1"
          size="lg"
        >
          <Folder className="mr-2 h-5 w-5" />
          Select File
        </Button>
        <Button 
          onClick={toggleRecording} 
          disabled={isLoading}
          variant={isRecording ? "destructive" : "default"}
          className="flex-1"
          size="lg"
        >
          {isRecording ? (
            <>
              <StopCircle className="mr-2 h-5 w-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" />
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
          disabled={isLoading || isRecording}
          className="flex-1"
        />
        <Button 
          onClick={handleURLSubmit} 
          disabled={isLoading || isRecording || !mediaURL}
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
    </div>
  );
}
