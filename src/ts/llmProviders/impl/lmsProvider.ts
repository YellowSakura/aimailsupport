import { OpenAiApiCompatibleProvider } from '../openAiApiCompatible'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with the
 * LM Studio local server, through its OpenAI-compatible API.
 * Official documentation: https://lmstudio.ai/docs/app/api/endpoints/openai
 */
export class LmsProvider extends OpenAiApiCompatibleProvider {
    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'LM Studio',
            baseUrl: config.lms.serviceUrl,
            model: config.lms.model
        })
    }

    /**
     * Returns an array of model IDs for all available LM Studio models in
     * the local installation.
     */
    public static async getModels(serviceUrl: string): Promise<string[]> {
        return OpenAiApiCompatibleProvider.fetchModels(serviceUrl, 'LM Studio')
    }
}
