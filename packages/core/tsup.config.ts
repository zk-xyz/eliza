import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["esm"],
    platform: "node",
    target: "node18",
    bundle: true,
    splitting: true,
    dts: {
        entry: ["src/index.ts"],
        resolve: true
    },
    external: [
        "dotenv",
        "fs",
        "path",
        "http",
        "https",
        "@tavily/core",
        "onnxruntime-node",
        "sharp",
    ],
    noExternal: [], // Ensures all other dependencies are bundled
    treeshake: true,
    skipNodeModulesBundle: true,
});