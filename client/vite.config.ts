import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import path from "path";

// https://vite.dev/config/
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
    envDir: path.resolve(__dirname, ".."),
    build: {
        outDir: "dist",
        minify: true,
        cssMinify: true,
        sourcemap: false,
        cssCodeSplit: true,
    },
    resolve: {
        alias: {
            "@": "/src",
        },
    },
    server: {
        host: true,
        port: process.env.NODE_ENV === 'production' ? 10000 : 5173,
    },
    preview: {
        host: '0.0.0.0',
        port: 10000,
        strictPort: true
    }
});