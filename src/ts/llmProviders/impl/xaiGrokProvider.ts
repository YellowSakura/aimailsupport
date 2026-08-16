import { OpenAiApiCompatibleProvider } from '../openAiApiCompatible'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with the
 * SpaceXAI Grok APIs, which are compatible with the OpenAI ones.
 * Official documentation: https://docs.x.ai/docs/api-reference
 */
export class XaiGrokProvider extends OpenAiApiCompatibleProvider {
    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'SpaceXAI',
            baseUrl: 'https://api.x.ai',
            model: config.xai.model,
            apiKey: config.xai.apiKey
        })
    }
}
