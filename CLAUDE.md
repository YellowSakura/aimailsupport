# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

AI Mail Support is a Thunderbird WebExtension add-on (manifest v2) that integrates LLM capabilities into email workflows. It supports multiple LLM providers (Anthropic Claude, Google Gemini, OpenAI GPT, SpaceXAI Grok, Mistral, DeepSeek, Groq, OpenRouter, Ollama, LM Studio and vLLM) through a provider abstraction layer.

## Build & development commands

```bash
npm install                          # Install dependencies
npm run build                        # Full build (manifest + locales + addon)
npm run build:package                # Create ai-mail-support.xpi for distribution
npm run lint                         # ESLint on all TypeScript files
npm run test                         # Run all provider tests (requires .env with API keys)
npm run test:single "ProviderName"   # Run tests for a single provider (e.g., "AnthropicClaudeProvider")
```

To test in Thunderbird: load the `ai-mail-support/` output folder via Tools → Developer Tools → Debug Add-ons → Load Temporary Add-on.

## Before completing a task

Always run the following checks before considering a task complete:

```bash
npm run lint                         # Must pass with no errors — enforced automatically
npm run build                        # Must compile successfully
```

`npm run lint` is enforced by a `Stop` hook in `.claude/settings.json`: Claude cannot end a turn while ESLint reports errors — the hook blocks completion and feeds the errors back for fixing. Inspect or disable it with `/hooks`. `npm run build` remains a manual check.

## Architecture

### Provider pattern (core abstraction)
- **`src/ts/llmProviders/genericProvider.ts`** — Base class declaring all LLM operations (analyzeTextIntent, explainText, summarizeText, rephraseText, suggestReplyFromText, translateText, moderateText, etc.) with the standardized prompt templates and `createAbortSignalWithTimeout()`. Every operation throws by default: a provider "supports" a feature simply by overriding it.
- **`src/ts/llmProviders/openAiApiCompatible.ts`** — Abstract class extending GenericProvider for every service speaking the OpenAI protocol (`{baseUrl}/v1/chat/completions`). It implements the prompt wrappers, `getHeaders()`, `manageMessageContent()`, plus the `fetchModels()` and `extractErrorMessage()` static helpers. Subclasses usually consist of the constructor alone.
- **`src/ts/llmProviders/impl/`** — Concrete providers. Groq, DeepSeek, SpaceXAI, Mistral, OpenRouter, LM Studio, Ollama, vLLM and OpenAI extend OpenAiApiCompatibleProvider; Anthropic and Google extend GenericProvider directly, since they use their own protocol. OpenAI is a special case: it inherits everything but overrides `manageMessageContent()` for the Responses API (`/v1/responses`); OpenRouter only overrides `getHeaders()` to add its optional attribution headers.
- **`src/ts/llmProviders/providerFactory.ts`** — Factory that maps provider name strings to implementation classes.

### Capability detection (careful when refactoring)
`background.ts` enables the context-menu entries through the `can*()` methods of GenericProvider, which compare method identity against `GenericProvider.prototype`:

```ts
return this.summarizeText !== GenericProvider.prototype.summarizeText
```

Never move a shared implementation of those operations onto GenericProvider: every `can*()` would return false and the menu entries would silently disappear. Shared code must live in an intermediate class, as OpenAiApiCompatibleProvider does.

### Adding an OpenAI-compatible provider
1. `src/ts/llmProviders/impl/{name}Provider.ts` — extend OpenAiApiCompatibleProvider, passing `serviceLabel`, `baseUrl`, `model` and the optional `apiKey` to `super()`; add a `static getModels()` delegating to `fetchModels()` only if the service exposes `/v1/models`.
2. Register it in `providerFactory.ts`.
3. Add its block to `ConfigType`, the `<option>` in `options.html` and the partial in `src/html/partials/` (the fieldset `id` must equal the factory key).
4. Add the read/restore of its fields in `options.ts`.
5. Add the host permission in `src/manifest.json`.
6. Add a `describe` block in `test/llmprovider.test.ts`.

### Entry points (defined in `src/manifest.json`)
- **`src/ts/background.ts`** — Background script (MV2 background page, loaded as an ES module): creates context menus, handles message routing, delegates to LLM providers. This is the main orchestration hub.
- **`src/ts/outputDisplay.ts`** — Popup that displays AI-generated responses and handles text-to-speech.
- **`src/ts/promptDisplay.ts`** — Popup for custom prompt input.
- **`src/html/options.html`** — Settings page, uses `posthtml-include` to compose provider-specific partials from `src/html/partials/`.
- **`src/ts/options/`** — Settings page logic: `options.ts` is the main module, alongside per-provider modules (`optionsGroq.ts`, `optionsLms.ts`, `optionsOllama.ts`, `optionsOpenai.ts`, `optionsOpenrouter.ts`, `optionsVllm.ts`). All are loaded as `<script type="module">` from `options.html`.

### Helpers
- **`src/ts/helpers/configType.ts`** — TypeScript interface for all configuration (provider keys, models, general settings).
- **`src/ts/helpers/utils.ts`** — Storage access (`getConfig`/`getConfigs`), message content retrieval, localization, PII masking, debug logging.
- **`src/ts/helpers/chartUtils.ts`** — `ChartUtils.createBarChart()`, used to render the score bars for intent analysis and moderation results.

### UI components
- **`src/ts/components/`** — Custom web components (LanguageSelector, MultipleLanguageSelector, PasswordToggle).

## Build system

Uses **Parcel** as bundler. Build output goes to `ai-mail-support/` directory. Individual component builds are available (`build:background`, `build:outputDisplay`, `build:options`, etc.). Stylesheets in `src/sass/` have their own Parcel targets (`build:outputDisplay:sass`, `build:promptDisplay:sass`). Locales are built by minifying JSON from `src/locales/`.

## Testing

Tests live in `test/llmprovider.test.ts`, configured by `jest.config.mjs`. Requires a `.env` file with API keys (`anthropic_api_key`, `openai_api_key`, `google_api_key`, etc.). Local LLM tests require running Ollama or LM Studio instances at their default ports. The Jest timeout comes from the `servicesTimeout` value of the dummy config declared inside the test file (30s), not from the add-on settings.

## Localization

Two locales: English (`src/locales/en-messages.json`) and Italian (`src/locales/it-messages.json`). Uses Thunderbird's i18n API (`messenger.i18n.getMessage()`). To add a language: create a new `{code}-messages.json`, add a `build:locales-{code}` script in `package.json`, and chain it from `build:locales`. No manifest change is needed — it only declares `default_locale`, and Thunderbird picks up the `_locales/` subfolders automatically.

## Key globals

The codebase uses `messenger` and `browser` as global objects (Thunderbird WebExtension APIs). ESLint is configured to recognize these.  
TypeScript types come from `@types/thunderbird-webext-browser`.

## Dependencies of note

- **`@yellowsakura/js-pii-mask`** — PII masking before sending text to LLM services.
- **`marked`** — Renders the markdown of LLM responses to HTML in the output popup (`src/ts/outputDisplay.ts`).
- **`posthtml-include`** — HTML partial includes for the options page.
