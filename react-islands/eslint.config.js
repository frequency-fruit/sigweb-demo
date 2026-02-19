import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * TSLint is deprecated and replaced by typescript-eslint.
 * This configuration uses typescript-eslint for all TypeScript linting rules.
 */

export default tseslint.config(
  { ignores: ["dist", "target"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tailwind.configs["flat/recommended"],
      prettierConfig,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "tailwindcss/no-custom-classname": "off", // Useful if using specific legacy classes
    },
    settings: {
      tailwindcss: {
        callees: ["classnames", "clsx", "ctl"],
        config: path.resolve(__dirname, "tailwind.config.js"), // Full path workaround for v4
      },
    },
  },
);
