import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../.env") });

export default defineConfig(({ mode }) => ({
    define: {
        'process.env': process.env,
        'global': {},
    },
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
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'favicon.ico') {
                        return 'favicon.ico';
                    }
                    return 'assets/[name]-[hash][extname]';
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
        port: parseInt(process.env.PORT || '5173'),
        proxy: {
            "/api": {
                target: mode === 'production'
                    ? process.env.VITE_SERVER_URL
                    : `http://127.0.0.1:${process.env.SERVER_PORT || 3000}`,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
                secure: false,
            },
        },
    },
}));