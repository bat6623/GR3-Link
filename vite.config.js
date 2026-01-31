import { defineConfig } from 'vite';

export default defineConfig({
    base: '/GR3-Link/',
    server: {
        host: '0.0.0.0', // Allow external access for testing on phone
        proxy: {
            '/v1': {
                target: 'http://192.168.0.1',
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/v1/, '/v1') // GR3 API starts with /v1, so no rewrite needed if we use /v1 in fetch
            }
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true
    }
});
