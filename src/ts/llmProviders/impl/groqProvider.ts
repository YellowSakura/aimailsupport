import { OpenAiApiCompatibleProvider } from '../openAiApiCompatible'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Groq Cloud APIs, through their OpenAI-compatible endpoints.
 * Official documentation: https://console.groq.com/docs/api-reference
 */
export class GroqProvider extends OpenAiApiCompatibleProvider {
    private static readonly BASE_URL = 'https://api.groq.com/openai'

    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'Groq',
            baseUrl: GroqProvider.BASE_URL,
            model: config.groq.model,
            apiKey: config.groq.apiKey
        })
    }

    /**
     * Returns an array of model IDs available on Groq Cloud.
     */
    public static async getModels(apiKey: string): Promise<string[]> {
        return OpenAiApiCompatibleProvider.fetchModels(GroqProvider.BASE_URL, 'Groq', apiKey)
    }
}
