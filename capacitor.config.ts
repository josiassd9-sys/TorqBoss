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
      serverClientId: '718759502049-crb938h7svtdcl205kfu7a5m04ngllpv.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
