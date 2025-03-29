
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, StopCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LiveTranscriptionProps {
  isActive: boolean;
  onStatusChange: (isActive: boolean) => void;
}

interface TranscriptionEntry {
  originalLanguage: 'russian' | 'spanish';
  originalText: string;
  translatedText: string;
  timestamp: Date;
}

export function LiveTranscription({ isActive, onStatusChange }: LiveTranscriptionProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TranscriptionEntry[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Start/stop recording when isActive changes
  useEffect(() => {
    if (isActive) {
      startRecording();
    } else if (mediaRecorder.current) {
      stopRecording();
    }
    
    return () => {
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);
  
  // Scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [entries]);
  
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices) {
        throw new Error("Media devices API not available");
      }
      
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(mediaStream.current);
      
      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && isActive) {
          processAudioChunk(event.data);
        }
      };
      
      // Record in 5-second chunks for near real-time processing
      mediaRecorder.current.start(5000);
      
      toast({
        title: "Live transcription started",
        description: "Listening for Russian and Spanish speech..."
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: `Failed to start recording: ${error}`,
        variant: "destructive"
      });
      onStatusChange(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
      }
      mediaRecorder.current = null;
      mediaStream.current = null;
      
      toast({
        title: "Live transcription stopped"
      });
    }
  };
  
  const processAudioChunk = async (audioBlob: Blob) => {
    try {
      const result = await apiService.liveTranscribe(audioBlob);
      
      if (result.originalText.trim()) {
        setEntries(prev => [...prev, {
          originalLanguage: result.detectedLanguage,
          originalText: result.originalText,
          translatedText: result.translatedText,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  };
  
  const getTranscriptText = () => {
    return entries.map(entry => {
      const langOriginal = entry.originalLanguage === 'russian' ? 'RU' : 'ES';
      const langTranslated = entry.originalLanguage === 'russian' ? 'ES' : 'RU';
      
      return `${langOriginal}: ${entry.originalText}\n${langTranslated}: ${entry.translatedText}`;
    }).join('\n\n');
  };
  
  const handleSaveTranscript = async () => {
    try {
      const text = getTranscriptText();
      
      if (!text) {
        toast({
          title: "Error",
          description: "No content to save",
          variant: "destructive"
        });
        return;
      }
      
      // Create a blob and download it
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `live-transcription-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Live transcription saved"
      });
    } catch (error) {
      console.error("Error saving transcript:", error);
      toast({
        title: "Error",
        description: `Failed to save transcript: ${error}`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="mb-6 overflow-hidden border-0 shadow-lg">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <Button
          onClick={() => onStatusChange(!isActive)}
          variant={isActive ? "destructive" : "default"}
          className="w-full h-11"
        >
          {isActive ? (
            <>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Live Transcription (RU/ES)
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Live Transcription (RU/ES)
            </>
          )}
        </Button>
        
        {entries.length > 0 && (
          <>
            <ScrollArea className="h-[300px] border rounded-md bg-muted/10 p-3" ref={scrollAreaRef}>
              {entries.map((entry, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="p-3 rounded-md bg-primary/5 mb-1">
                    <strong>{entry.originalLanguage === 'russian' ? 'Russian:' : 'Spanish:'}</strong>
                    <p>{entry.originalText}</p>
                  </div>
                  <div className="p-3 rounded-md bg-secondary/20">
                    <strong>{entry.originalLanguage === 'russian' ? 'Spanish:' : 'Russian:'}</strong>
                    <p>{entry.translatedText}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            
            <Button
              onClick={handleSaveTranscript}
              variant="outline"
              className="w-full h-11"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Live Transcript
            </Button>
          </>
        )}
        
        {isActive && entries.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            Listening for Russian and Spanish speech...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
