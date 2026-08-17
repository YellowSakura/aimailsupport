/**
 * Interface representing the configuration settings.
 */
export interface ConfigType {
    mainUserLanguageCode: string
    translationLanguageCodes: string[] // Array of ISO 639-1 codes (e.g. ['en', 'it', 'fr'])
    llmProvider: string

    // A null value means that the currently selected model does not accept the
    // temperature parameter at all (e.g. Anthropic Opus 5 or OpenAI GPT-5.5),
    // in which case it must not be sent with the request.
    temperature: number | null
    servicesTimeout: number

    // Whether the answers are shown progressively, as the model generates
    // them, instead of appearing all at once when the generation is over.
    streamResponses: boolean
    maskPii: boolean
    debugMode: boolean

    anthropic: {
        apiKey: string
        model: string
    }

    deepseek: {
        apiKey: string
        model: string
    }

    google: {
        apiKey: string
        model: string
        reasoningEffort?: string
    }

    groq: {
        apiKey: string
        model: string
    }

    lms: {
        serviceUrl: string
        model: string
    }

    mistral: {
        apiKey: string
        model: string
    }

    ollama: {
        serviceUrl: string
        model: string
    }

    openai: {
        apiKey: string
        organizationId: string
        model: string

        text2speech: {
            audioQuality: string
            voice: string
            speed: number
        }
    }

    openrouter: {
        apiKey: string
        model: string
    }

    vllm: {
        serviceUrl: string
        model: string
        apiKey: string
    }

    xai: {
        apiKey: string
        model: string
    }
}
