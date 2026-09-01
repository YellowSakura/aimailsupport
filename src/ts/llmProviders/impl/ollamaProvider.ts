import { OpenAiApiCompatibleProvider } from '../openAiApiCompatible'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Ollama local server, through its OpenAI-compatible API.
 * Official documentation:
 * https://github.com/ollama/ollama/blob/main/docs/openai.md
 */
export class OllamaProvider extends OpenAiApiCompatibleProvider {
    private readonly reasoningEffort: ConfigType['ollama']['reasoningEffort']

    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'Ollama',
            baseUrl: config.ollama.serviceUrl,
            model: config.ollama.model
        })

        this.reasoningEffort = config.ollama.reasoningEffort || 'default'
    }

    /**
     * Ollama maps the OpenAI-compatible reasoning_effort field to its native
     * thinking control. Omitting it preserves the model's default behavior.
     */
    protected getAdditionalRequestData(): Record<string, unknown> {
        if(this.reasoningEffort === 'default') {
            return {}
        }

        return { reasoning_effort: this.reasoningEffort }
    }

    /**
     * Returns an array of model IDs for all available Ollama models in
     * the local installation.
     */
    public static async getModels(serviceUrl: string): Promise<string[]> {
        return OpenAiApiCompatibleProvider.fetchModels(serviceUrl, 'Ollama')
    }
}
