import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default tseslint.config({
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        globals: {
            ...globals.browser,
            ...globals.es2020,
            ...globals.node // If you need Node.js globals
        },
        parserOptions: {
            project: ["./tsconfig.node.json", "./tsconfig.app.json"],
            tsconfigRootDir: import.meta.dirname,
            ecmaFeatures: {
                jsx: true
            }
        },
    },
    // Improved ignore patterns
    ignores: [
        "dist",
        "node_modules",
        "build",
        "coverage",
        "*.config.js",
        "*.config.ts"
    ],
    extends: [
        js.configs.recommended,
        tseslint.configs.recommendedTypeChecked,
        tseslint.configs.stylisticTypeChecked
    ],
    // Expanded file patterns
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
        "react-hooks": reactHooks,
        "react-refresh": reactRefresh,
        react
    },
    settings: { 
        react: { 
            version: "19.0", // Updated for React 19
            // Additional React settings
            linkComponents: [
                { name: "Link", linkAttribute: "to" },
                { name: "NavLink", linkAttribute: "to" }
            ]
        } 
    },
    rules: {
        ...reactHooks.configs.recommended.rules,
        ...react.configs.recommended.rules,
        ...react.configs["jsx-runtime"].rules,
        // React Refresh rules
        "react-refresh/only-export-components": [
            "warn",
            { 
                allowConstantExport: true,
                allowExportNames: ["metadata", "config"] // Common non-component exports
            },
        ],
        // Additional React rules
        "react/jsx-uses-react": "off", // Not needed with React 19
        "react/react-in-jsx-scope": "off", // Not needed with React 19
        "react/prop-types": "off", // Not needed with TypeScript
        "react/jsx-no-leaked-render": [
            "error",
            { validStrategies: ["ternary", "coerce"] }
        ],
        // React Hooks rules
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        // TypeScript specific rules
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true
        }],
        // General rules
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "prefer-const": "warn",
        "no-unused-expressions": "error",
        "no-duplicate-imports": "error"
    },
    // Optional: Add overrides for specific file patterns
    overrides: [
        {
            files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
            rules: {
                "react-hooks/rules-of-hooks": "off",
                "react/display-name": "off"
            }
        },
        {
            files: ["vite.config.ts", "*.config.ts"],
            rules: {
                "import/no-default-export": "off"
            }
        }
    ]
});