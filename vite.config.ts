import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/',
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom', 'framer-motion'],
                    'client-films': [
                        'resources/js/pages/Client/Films/Index.tsx',
                        'resources/js/pages/Client/Films/Show.tsx'
                    ],
                    'admin-films': [
                        'resources/js/pages/Admin/Films/Index.tsx',
                        'resources/js/pages/Admin/Films/Show.tsx',
                        'resources/js/pages/Admin/Films/Create.tsx',
                        'resources/js/pages/Admin/Films/Edit.tsx'
                    ]
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
});
