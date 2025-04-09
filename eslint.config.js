const eslint = require("@eslint/js");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const globals = require("globals");

module.exports = [
  eslint.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 9,
        sourceType: "module",
        createDefaultProgram: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-constant-condition": "off",
    },
  },
  {
    ignores: ["dist/*", "lib/*"],
  },
];
