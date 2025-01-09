import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      // Dependencies
      "**/node_modules/**",
      
      // Build outputs
      "**/.next/**",
      "**/build/**",
      "**/dist/**",
      "**/out/**",
      "**/storybook-static/**",
      
      // Coverage reports
      "**/coverage/**",
      
      // Cache
      "**/.cache/**",
      "**/.eslintcache",
      
      // Misc
      "**/.git/**",
      "**/*.log",
      "**/.DS_Store",
      
      // Environment variables
      "**/.env*",
      "!**/.env.example",
      
      // Package manager files
      "**/package-lock.json",
      "**/yarn.lock",
      "**/pnpm-lock.yaml",
      
      // Assets
      "**/public/static/**",
      "**/public/images/**"
    ],
    settings: {
      "import/parsers": {
        "@babel/eslint-parser": [".js", ".jsx"]
      },
      "import/resolver": {
        node: {
          paths: ["src"],
          extensions: [".js", ".jsx"]
        },
        alias: {
          map: [
            ["@", "./src"]
          ],
          extensions: [".js", ".jsx"]
        }
      }
    },
    rules: {
      "jsx-a11y/heading-has-content": "error",
      "react/no-unknown-property": ["error", { ignore: ["cmdk-input-wrapper"] }],
      "no-unused-vars": "error",
      "import/no-anonymous-default-export": "error"
    }
  }
];

export default eslintConfig;
