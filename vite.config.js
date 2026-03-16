import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import laravel from 'laravel-vite-plugin'
import vitePluginPreload from 'vite-plugin-preload'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/src/main.jsx'],
            refresh: true,
        }),
        react(),
        vitePluginPreload()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js/src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': 'http://localhost:8000',
            '/uploads': 'http://localhost:8000',
        },
    },
    build: {
        outDir: 'public/build',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    const parts = id.split('node_modules/')[1].split('/');
                    const pkgName = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
                    if (pkgName === 'xlsx') return 'xlsx';
                    if (pkgName === 'recharts') return 'charts';
                    if (pkgName === 'lucide-react') return 'icons';
                    if (pkgName === 'react' || pkgName === 'react-dom' || pkgName === 'react-router-dom') {
                        return 'react-vendor';
                    }
                    return 'vendor';
                },
            },
        },
    },
})
