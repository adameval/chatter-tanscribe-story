
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

interface TranslationProps {
  transcription: string;
  isLoading: boolean;
}

export function Translation({ transcription, isLoading }: TranslationProps) {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("russian");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    const textToTranslate = sourceText || transcription;
    if (!textToTranslate) {
      toast({
        title: "Error",
        description: "No text to translate",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTranslating(true);
      
      const translatedText = await apiService.translateText({
        text: textToTranslate,
        targetLanguage
      });
      
      setTranslation(translatedText);
    } catch (error) {
      console.error("Error translating:", error);
      toast({
        title: "Error",
        description: `Failed to translate: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter text to translate, or leave empty to use transcription above"
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        className="min-h-[100px]"
        disabled={isLoading || isTranslating}
      />
      
      <div className="flex items-center gap-4">
        <span>Translate to:</span>
        <Select
          value={targetLanguage}
          onValueChange={setTargetLanguage}
          disabled={isLoading || isTranslating}
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
          disabled={isLoading || isTranslating || (!sourceText && !transcription)}
          className="ml-auto"
        >
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
      </div>

      <Textarea
        value={translation}
        readOnly
        className="min-h-[100px]"
        placeholder="Translation will appear here..."
      />
    </div>
  );
}
