# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Mail Support is a Thunderbird WebExtension add-on (manifest v2) that integrates LLM capabilities into email workflows. It supports 9 LLM providers (Anthropic Claude, Google Gemini, OpenAI GPT, xAI Grok, Mistral, DeepSeek, Groq, Ollama, LM Studio) through a provider abstraction layer.

## Build & Development Commands

```bash
npm install                          # Install dependencies
npm run build                        # Full build (manifest + locales + addon)
npm run build:package                # Create ai-mail-support.xpi for distribution
npm run lint                         # ESLint on all TypeScript files
npm run test                         # Run all provider tests (requires .env with API keys)
npm run test:single "ProviderName"   # Run tests for a single provider (e.g., "AnthropicClaudeProvider")
```

To test in Thunderbird: load the `ai-mail-support/` output folder via Tools → Developer Tools → Debug Add-ons → Load Temporary Add-on.

## Architecture

### Provider Pattern (core abstraction)
- **`src/ts/llmProviders/genericProvider.ts`** — Base class defining all LLM operations (analyzeTextIntent, explainText, summarizeText, rephraseText, suggestReplyFromText, translateText, moderateText, etc.) with standardized prompt templates.
- **`src/ts/llmProviders/impl/`** — 9 provider implementations extending GenericProvider. Each overrides the API call mechanism.
- **`src/ts/llmProviders/providerFactory.ts`** — Factory that maps provider name strings to implementation classes.

### Entry Points (defined in `src/manifest.json`)
- **`src/ts/background.ts`** — Background service worker: creates context menus, handles message routing, delegates to LLM providers. This is the main orchestration hub.
- **`src/ts/outputDisplay.ts`** — Popup that displays AI-generated responses and handles text-to-speech.
- **`src/ts/promptDisplay.ts`** — Popup for custom prompt input.
- **`src/html/options.html`** — Settings page, uses `posthtml-include` to compose provider-specific partials from `src/html/partials/`.

### Helpers
- **`src/ts/helpers/configType.ts`** — TypeScript interface for all configuration (provider keys, models, general settings).
- **`src/ts/helpers/utils.ts`** — Storage access (`getConfig`/`getConfigs`), message content retrieval, localization, PII masking, debug logging.

### UI Components
- **`src/ts/components/`** — Custom web components (LanguageSelector, MultipleLanguageSelector, PasswordToggle).

## Build System

Uses **Parcel** as bundler. Build output goes to `ai-mail-support/` directory. Individual component builds are available (`build:background`, `build:outputDisplay`, `build:options`, etc.). Locales are built by minifying JSON from `src/locales/`.

## Testing

Tests live in `test/llmprovider.test.ts`. Requires a `.env` file with API keys (`anthropic_api_key`, `openai_api_key`, `google_api_key`, etc.). Local LLM tests require running Ollama or LM Studio instances. Jest timeout is set to `servicesTimeout` from config (default 30s).

## Localization

Two locales: English (`src/locales/en-messages.json`) and Italian (`src/locales/it-messages.json`). Uses Thunderbird's i18n API (`messenger.i18n.getMessage()`). To add a language: create a new `{code}-messages.json`, add a build script, update `build:locales`, and register in `manifest.json`.

## Key Globals

The codebase uses `messenger` and `browser` as global objects (Thunderbird WebExtension APIs). ESLint is configured to recognize these. TypeScript types come from `@types/thunderbird-webext-browser`.

## Dependencies of Note

- **`@yellowsakura/js-pii-mask`** — PII masking before sending text to LLM services.
- **`remove-markdown`** — Strips markdown from LLM responses for plain text display.
- **`posthtml-include`** — HTML partial includes for the options page.
