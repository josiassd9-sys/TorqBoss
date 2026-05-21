import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.topcar.meucarro',
  appName: 'Meu Carro Top',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  // Plugin configurations can go here
  plugins: {
    Filesystem: {},
    Share: {}
  }
};

export default config;
