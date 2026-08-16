import { OpenAiApiCompatibleProvider } from '../openAiApiCompatible'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with the
 * DeepSeek APIs, which are compatible with the OpenAI ones.
 * Official documentation: https://api-docs.deepseek.com
 */
export class DeepseekProvider extends OpenAiApiCompatibleProvider {
    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'DeepSeek',
            baseUrl: 'https://api.deepseek.com',
            model: config.deepseek.model,
            apiKey: config.deepseek.apiKey
        })
    }
}
