import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/GR3-Link/',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true
            },
            manifest: {
                name: 'GR3 Link',
                short_name: 'GR3 Link',
                description: 'Ricoh GR3 Photo Manager',
                theme_color: '#1a1a1a',
                background_color: '#1a1a1a',
                display: 'standalone',
                scope: '/GR3-Link/',
                start_url: '/GR3-Link/',
                icons: [
                    {
                        src: 'pwa-192x192.png', // We need to ensure these exist or use placeholders
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    server: {
        host: '0.0.0.0', // Allow external access for testing on phone
        proxy: {
            '/v1': {
                target: 'http://192.168.0.1',
                changeOrigin: true,
            }
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true
    }
});
