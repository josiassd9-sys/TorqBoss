import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.torqboss.app',
  appName: 'torqboss',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Filesystem: {},
    Share: {},
    GoogleAuth: {
      scopes: ['profile', 'email'],
      androidClientId: '456343787433-vjh8tp1rn9q18fbaonhmk4tjgkc9pdjt.apps.googleusercontent.com',
      serverClientId: '456343787433-f6n6aa5i85o89rjbvvck9hurgtqi5o8f.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;