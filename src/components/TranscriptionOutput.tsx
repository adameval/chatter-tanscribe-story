
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save } from "lucide-react";
import { useState } from "react";
import { SummaryDialog } from "./SummaryDialog";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface TranscriptionOutputProps {
  transcription: string;
  detectedLanguage: string;
  isLoading: boolean;
}

export function TranscriptionOutput({ transcription, detectedLanguage, isLoading }: TranscriptionOutputProps) {
  const { toast } = useToast();
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!transcription) {
      toast({
        title: "Error",
        description: "No transcription to summarize",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSummarizing(true);
      const summaryText = await apiService.summarizeText({
        text: transcription
      });
      
      setSummary(summaryText);
      setSummaryDialogOpen(true);
    } catch (error) {
      console.error("Error summarizing:", error);
      toast({
        title: "Error",
        description: `Failed to summarize: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
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

      // Create a blob and download it
      const blob = new Blob([transcription], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Transcription saved"
      });
    } catch (error) {
      console.error("Error saving transcription:", error);
      toast({
        title: "Error",
        description: `Failed to save transcription: ${error}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        {detectedLanguage !== "-" && (
          <Badge variant="outline" className="text-xs">
            {detectedLanguage}
          </Badge>
        )}
      </div>
      
      <Textarea 
        value={transcription} 
        readOnly 
        className="min-h-[200px] font-mono focus:ring-2 focus:ring-primary/20"
        placeholder="Transcription will appear here..."
      />
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSummarize}
          disabled={isLoading || !transcription || isSummarizing}
          variant="outline"
          size="lg"
          className="flex-1 h-12"
        >
          <FileText className="mr-2 h-5 w-5" />
          {isSummarizing ? "Summarizing..." : "Summarize"}
        </Button>
        <Button
          onClick={handleSaveTranscription}
          disabled={isLoading || !transcription}
          variant="outline"
          size="lg"
          className="flex-1 h-12"
        >
          <Save className="mr-2 h-5 w-5" />
          Save
        </Button>
      </div>
      
      <SummaryDialog 
        open={summaryDialogOpen}
        onOpenChange={setSummaryDialogOpen}
        summary={summary}
      />
    </div>
  );
}
