
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget =
    env.VITE_DEV_API_PROXY_TARGET || 'https://api.audienceverdict.in';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: [
        'audienceverdict.in',
        'www.audienceverdict.in',
      ],
      proxy: {
        '/api/v1': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
