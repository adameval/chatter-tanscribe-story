
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

      // If no files were selected (user canceled), return without showing error
      if (!result.files || result.files.length === 0) {
        console.log("File selection canceled by user");
        return;
      }

      const file = result.files[0];
      
      // Check that we have a valid path
      if (!file.path) {
        toast({
          title: "Error",
          description: "The selected file doesn't have a valid path",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Selected file:", file);
      onFileSelected(file.path);
    } catch (error) {
      console.error("Error selecting file:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Only show error toast if it's not a cancellation
      if (!errorMessage.includes("canceled") && !errorMessage.includes("cancelled")) {
        toast({
          title: "Error",
          description: `Failed to process file: ${errorMessage}`,
          variant: "destructive",
        });
      }
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
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleFileSelect} 
          disabled={isLoading || isRecording}
          className="h-12 flex-1 bg-[#0f172a] dark:bg-[#0f172a] text-white hover:bg-[#1e293b] after:absolute after:inset-0 after:z-[-1] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-200%] hover:after:transition-transform hover:after:duration-500 hover:after:translate-x-[200%]"
          variant="default"
        >
          <Folder className="mr-2 h-4 w-4" />
          Select File
        </Button>
        <Button 
          onClick={toggleRecording} 
          disabled={isLoading}
          variant={isRecording ? "destructive" : "default"}
          className="h-12 flex-1 bg-[#0f172a] dark:bg-[#0f172a] text-white hover:bg-[#1e293b] after:absolute after:inset-0 after:z-[-1] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-200%] hover:after:transition-transform hover:after:duration-500 hover:after:translate-x-[200%]"
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

      <div className="flex gap-3">
        <Input 
          placeholder="Enter Media URL" 
          value={mediaURL}
          onChange={(e) => setMediaURL(e.target.value)}
          disabled={isLoading || isRecording}
          className="h-12"
        />
        <Button 
          onClick={handleURLSubmit} 
          disabled={isLoading || isRecording || !mediaURL}
          className="h-12 bg-[#0f172a] dark:bg-[#0f172a] text-white hover:bg-[#1e293b] after:absolute after:inset-0 after:z-[-1] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-200%] hover:after:transition-transform hover:after:duration-500 hover:after:translate-x-[200%]"
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
