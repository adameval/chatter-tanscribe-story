
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, Moon, Sun, Computer } from "lucide-react";
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
  
  useState(() => {
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
  });
  
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
      <header className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={theme === 'light' ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex-1"
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1"
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex-1"
            >
              <Computer className="mr-2 h-4 w-4" />
              System
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OpenAI API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {maskedApiKey && (
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Current API Key: {showApiKey ? maskedApiKey : "••••••••••••••••"}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowApiKey(!showApiKey)}
                className="h-8 w-8"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter new API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              className="flex-1"
            />
            <Button 
              onClick={handleUpdateApiKey} 
              disabled={isLoading || !apiKey.trim()}
            >
              Update Key
            </Button>
          </div>
          
          {maskedApiKey && (
            <Button 
              variant="destructive" 
              onClick={handleRemoveApiKey} 
              disabled={isLoading}
              className="w-full"
            >
              Remove API Key
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            Your API key is stored securely on your device and is never sent to any server other than OpenAI's API.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
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
