
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, Moon, Sun, LaptopIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { secureStorageService } from "@/services/secureStorageService";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [maskedApiKey, setMaskedApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const key = await secureStorageService.getApiKey();
        if (key) {
          // Mask the API key
          const masked = key.substring(0, 3) + "..." + key.substring(key.length - 4);
          setMaskedApiKey(masked);
        }
      } catch (error) {
        console.error("Error loading API key:", error);
      }
    };
    
    loadApiKey();
  }, []);
  
  const handleUpdateApiKey = async () => {
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
      const masked = apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length - 4);
      setMaskedApiKey(masked);
      setApiKey("");
      
      toast({
        title: "Success",
        description: "API key updated successfully",
      });
    } catch (error) {
      console.error("Error updating API key:", error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveApiKey = async () => {
    setIsLoading(true);
    try {
      await secureStorageService.removeApiKey();
      setMaskedApiKey("");
      
      toast({
        title: "Success",
        description: "API key removed successfully",
      });
    } catch (error) {
      console.error("Error removing API key:", error);
      toast({
        title: "Error",
        description: "Failed to remove API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="flex items-center mb-6 py-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-4 h-10 w-10 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </header>
      
      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-primary/5 px-6 py-4">
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Button
              variant={theme === 'light' ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex-1 h-11"
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1 h-11"
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex-1 h-11"
            >
              <LaptopIcon className="mr-2 h-4 w-4" />
              System
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-primary/5 px-6 py-4">
          <CardTitle>OpenAI API Key</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {maskedApiKey && (
            <div className="flex items-center gap-2 bg-muted/20 p-3 rounded-md">
              <div className="text-sm font-medium flex-1">Current API Key: {showApiKey ? maskedApiKey : "••••••••••••••••"}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowApiKey(!showApiKey)}
                className="h-9 w-9 rounded-full"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter new API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              className="h-11 flex-grow"
            />
            <Button 
              onClick={handleUpdateApiKey} 
              disabled={isLoading || !apiKey.trim()}
              className="h-11 whitespace-nowrap"
            >
              Update Key
            </Button>
          </div>
          
          {maskedApiKey && (
            <Button 
              variant="destructive" 
              onClick={handleRemoveApiKey} 
              disabled={isLoading}
              className="w-full h-11"
            >
              Remove API Key
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            Your API key is stored securely on your device and is never sent to any server other than OpenAI's API.
            <br />
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Get an API key from OpenAI
            </a>
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-primary/5 px-6 py-4">
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold">AI Transcriber</h2>
            <p>
              Optimized for Samsung Galaxy S24
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Valeriy Adamenko. All rights reserved.
              <br />All IP belongs to Valeriy Adamenko.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
