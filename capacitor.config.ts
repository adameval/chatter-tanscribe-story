
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.26e7487129b644dd9d557c3242e66523',
  appName: 'AI Transcriber',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For development only - remove for production build
    url: 'https://26e7487129b644dd9d557c3242e66523.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    }
  },
  android: {
    useLegacyBridge: false
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
