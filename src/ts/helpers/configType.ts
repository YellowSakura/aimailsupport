/**
 * Interface representing the configuration settings.
 */
export interface ConfigType {
    mainUserLanguageCode: string
    translationLanguageCodes: string[] // Array of ISO 639-1 codes (e.g. ['en', 'it', 'fr'])
    llmProvider: string
    temperature: number
    servicesTimeout: number
    maskPii: boolean
    debugMode: boolean

    anthropic: {
        apiKey: string
        model: string
    }

    deepseek: {
        apiKey: string
    }

    google: {
        apiKey: string
        model: string
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

    xai: {
        apiKey: string
        model: string
    }
}
