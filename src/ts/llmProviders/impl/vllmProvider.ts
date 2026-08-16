import { OpenAiApiCompatibleProvider } from '../openAiApiCompatible'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with a
 * vLLM local inference server via its OpenAI-compatible API.
 * Official documentation: https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html
 */
export class VllmProvider extends OpenAiApiCompatibleProvider {
    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'vLLM',
            baseUrl: config.vllm.serviceUrl,
            model: config.vllm.model,
            apiKey: config.vllm.apiKey
        })
    }

    /**
     * Returns an array of model IDs available on the vLLM server.
     */
    public static async getModels(serviceUrl: string, apiKey: string = ''): Promise<string[]> {
        return OpenAiApiCompatibleProvider.fetchModels(serviceUrl, 'vLLM', apiKey)
    }
}
