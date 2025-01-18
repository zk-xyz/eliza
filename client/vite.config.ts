import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteCompression from 'vite-plugin-compression'
import { config } from 'dotenv'
import path from 'path'

// Load local .env file for development environment
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    config({ path: path.resolve(__dirname, "../.env") })
}

export default defineConfig({
    plugins: [
        react(),
        viteCompression({
            algorithm: "brotliCompress",
            ext: ".br",
            threshold: 1024,
        }),
    ],
    clearScreen: false,
    build: {
        outDir: "dist",
        minify: true,
        cssMinify: true,
        sourcemap: false,
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        port: process.env.NODE_ENV === 'production' ? 10000 : 5173,
        proxy: {
            "/api": {
                target: process.env.NODE_ENV === 'production'
                    ? process.env.VITE_SERVER_URL
                    : `http://localhost:${process.env.SERVER_PORT || 3000}`,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
                secure: false,
            },
        },
    },
    preview: {
        host: '0.0.0.0',
        port: 10000,
        strictPort: true
    }
})