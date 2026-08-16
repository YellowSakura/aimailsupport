import { OpenAiApiCompatibleProvider } from '../openAiApiCompatible'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with the
 * OpenRouter APIs, an aggregator exposing the models of many different vendors
 * behind a single OpenAI-compatible endpoint.
 * Official documentation: https://openrouter.ai/docs/api-reference/overview
 */
export class OpenrouterProvider extends OpenAiApiCompatibleProvider {
    private static readonly BASE_URL = 'https://openrouter.ai/api'

    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'OpenRouter',
            baseUrl: OpenrouterProvider.BASE_URL,
            model: config.openrouter.model,
            apiKey: config.openrouter.apiKey
        })
    }

    /**
     * Returns an array of model IDs available on OpenRouter.
     */
    public static async getModels(apiKey: string): Promise<string[]> {
        return OpenAiApiCompatibleProvider.fetchModels(OpenrouterProvider.BASE_URL, 'OpenRouter', apiKey)
    }

    /**
     * Function to generate headers for API requests.
     *
     * On top of the standard ones, OpenRouter accepts two optional attribution
     * headers used to identify the calling application on their public
     * rankings: they only carry the add-on identity, never any user data.
     *
     * @returns The headers object with necessary headers appended.
     */
    protected getHeaders(): Headers {
        const headers: Headers = super.getHeaders()
        headers.append('HTTP-Referer', 'https://www.yellowsakura.com')
        headers.append('X-Title', 'AI Mail Support')

        return headers
    }
}
