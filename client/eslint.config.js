import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "**/*.cy.ts",
      "**/*.cy.tsx",
      "cypress/**",
      "cypress.config.ts",
      "src/cypress-env.d.ts",
    ],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      "cypress/**/*.ts",
      "cypress.config.ts",
      "src/cypress-env.d.ts",
      "**/*.cy.ts",
      "**/*.cy.tsx",
    ],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.mocha,
        cy: "readonly",
        Cypress: "readonly",
      },
    },
  },
  {
    files: ["cypress/support/component.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off",
    },
  },
]);
