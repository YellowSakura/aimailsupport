import globals from "globals";                          // Required for standard browser/DOM globals
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    {
        files: ["**/*.ts", "**/*.tsx"],                 // Applies only to TypeScript files
        plugins: {
            "@typescript-eslint": typescriptEslint      // TypeScript support
        },
        languageOptions: {
            globals: {
                /* Browser Environment */
                ...globals.browser,                     // Adds standard browser APIs (Blob, FileReader, document, etc.)
                ...globals.dom,                         // Adds DOM interfaces (HTMLDivElement, etc.)

                /* Thunderbird-specific APIs */
                messenger: "readonly",                  // Thunderbird's messaging API
                browser: "readonly",                    // WebExtensions API
                chrome: "readonly"                      // Chrome compatibility namespace
            },
            parser: tsParser,                           // Use TypeScript parser
            parserOptions: {
                ecmaVersion: "latest",                  // Modern ECMAScript features
                sourceType: "module"                    // ES Modules syntax
            }
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off" // Custom rule override
        }
    }
];