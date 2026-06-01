import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.torqboss.app',
  appName: 'torqboss',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  // O plugin @capacitor-firebase/authentication não precisa mais
  // das configurações GoogleAuth. Ele lê tudo do google-services.json
  // e do Firebase Console.
  plugins: {
    Filesystem: {},
    Share: {}
  }
};

export default config;