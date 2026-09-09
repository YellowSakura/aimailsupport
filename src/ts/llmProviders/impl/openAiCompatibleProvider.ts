import { OpenAiApiCompatibleProvider } from '../abstractOpenAiApiCompatibleProvider'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with any
 * service exposing an OpenAI-compatible API, i.e. answering on
 * `{baseUrl}/v1/chat/completions` with the OpenAI protocol: llama.cpp, vLLM,
 * LocalAI, Text Generation WebUI, a gateway of a private infrastructure, ...
 *
 * Unlike all the other providers, no specific service is assumed here: the
 * user configures the base URL, the model and the optional API key, so that a
 * single entry covers every system speaking the OpenAI protocol that has no
 * dedicated provider of its own.
 */
export class OpenAiCompatibleProvider extends OpenAiApiCompatibleProvider {
    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'OpenAI API compatible',
            baseUrl: config.openaicompatible.serviceUrl,
            model: config.openaicompatible.model,
            apiKey: config.openaicompatible.apiKey
        })
    }

    /**
     * Returns an array of model IDs available on the configured service.
     *
     * @param serviceUrl - Base URL of the OpenAI-compatible service.
     * @param apiKey - Optional API key, when the service requires it.
     */
    public static async getModels(serviceUrl: string, apiKey: string = ''): Promise<string[]> {
        return OpenAiApiCompatibleProvider.fetchModels(serviceUrl, 'OpenAI API compatible', apiKey)
    }
}
