import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fleetx.app',
  appName: 'FleetX',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Filesystem: {},
    Share: {},
    // 🛠️ Configuração obrigatória adicionada para o plugin do Google:
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '://googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
