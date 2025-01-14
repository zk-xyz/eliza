import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../.env") });

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {  // Removed unused 'command' parameter
    return {
        define: {
            'process.env': process.env,
            'global': {},
        },
        plugins: [
            react(), // Removed invalid 'devTools' option
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
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
        },
        server: {
            host: true,
            port: 5173,
            strictPort: true,
            proxy: {
                "/api": {
                    target: mode === 'production'
                        ? 'https://eliza-p4r5.onrender.com'
                        : `http://127.0.0.1:${process.env.SERVER_PORT || 3000}`,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ""),
                    secure: false,
                },
            },
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Private-Network': 'true',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Security-Policy': `
                    default-src 'self';
                    script-src 'self' 'unsafe-inline' 'unsafe-eval';
                    connect-src 'self' ws: wss: http: https:;
                    style-src 'self' 'unsafe-inline';
                    img-src 'self' data: https:;
                    font-src 'self' data:;
                    frame-src 'self';
                `.replace(/\s+/g, ' ').trim(),
            },
            hmr: {
                overlay: true,
                clientPort: 5173,
                host: 'localhost',
            },
        },
        optimizeDeps: {
            include: ['react', 'react-dom'],
        },
        envPrefix: 'VITE_',
    };
});