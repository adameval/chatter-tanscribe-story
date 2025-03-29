import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureStorageService } from "@/services/secureStorageService";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySaved: (apiKey: string) => void;
}

export function ApiKeyDialog({ open, onOpenChange, onApiKeySaved }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkApiKey = async () => {
      const storedKey = await secureStorageService.getApiKey();
      
      if (!open && !storedKey) {
        console.log('Preventing dialog closure - no API key available');
        onOpenChange(true);
      }
    };
    
    checkApiKey();
  }, [open, onOpenChange]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await secureStorageService.storeApiKey(apiKey);
      onApiKeySaved(apiKey);
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      secureStorageService.getApiKey().then(key => {
        if (key) {
          onOpenChange(false);
        } else {
          toast({
            title: "Required",
            description: "An OpenAI API key is required to use this app",
            variant: "destructive",
          });
          onOpenChange(true);
        }
      });
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to use the transcription, translation, and summarization features.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Label htmlFor="apiKey">
            API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored securely on your device and is never sent to any server other than OpenAI's API.
            <br />
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Get an API key from OpenAI
            </a>
          </p>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)} 
            disabled={isLoading}
            className="h-12"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={isLoading || !apiKey.trim()}
            className="h-12 px-6"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
