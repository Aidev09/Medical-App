
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3f2de1f6207f48f0bcb1717d466768b6',
  appName: 'Remindly Health',
  webDir: 'dist',
  server: {
    url: 'https://3f2de1f6-207f-48f0-bcb1-717d466768b6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f8fafb",
      showSpinner: true,
      spinnerColor: "#4dd8c7",
      androidSpinnerStyle: "large"
    }
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#f8fafb',
    preferredContentMode: 'mobile',
    scheme: 'remindly-health',
    webviewHandleBackButton: true,
  },
  android: {
    backgroundColor: '#f8fafb',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
