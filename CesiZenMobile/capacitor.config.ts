import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.LGI.CeziZen',
  appName: 'CesiZenMobile',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
