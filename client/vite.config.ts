import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteCompression from 'vite-plugin-compression'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(__dirname, "../.env") })

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
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        port: parseInt(process.env.PORT || '5173'),
        proxy: {
            "/api": {
                target: process.env.NODE_ENV === 'production'
                    ? process.env.VITE_SERVER_URL 
                    : `http://127.0.0.1:${process.env.SERVER_PORT || 3000}`,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
                secure: false,
            },
        },
    },
})