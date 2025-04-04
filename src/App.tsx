
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { useEffect, useState } from "react";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { ApiKeyDialog } from "./components/ApiKeyDialog";
import { secureStorageService } from "./services/secureStorageService";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => {
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize Capacitor plugins
  useEffect(() => {
    // Ensure directories exist for file operations
    const initializeApp = async () => {
      try {
        // Create directory only if it doesn't exist
        try {
          await Filesystem.mkdir({
            path: 'transcriber',
            directory: Directory.Cache,
            recursive: true
          });
        } catch (error) {
          console.log('Directory may already exist, continuing:', error);
        }
        
        // Check if API key exists, if not open the dialog
        const apiKey = await secureStorageService.getApiKey();
        if (!apiKey) {
          console.log('No API key found, opening dialog');
          setApiKeyDialogOpen(true);
        }
        
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  const handleApiKeySaved = (apiKey: string) => {
    console.log('API key saved successfully');
    setApiKeyDialogOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <ApiKeyDialog 
            open={apiKeyDialogOpen} 
            onOpenChange={setApiKeyDialogOpen} 
            onApiKeySaved={handleApiKeySaved} 
          />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
