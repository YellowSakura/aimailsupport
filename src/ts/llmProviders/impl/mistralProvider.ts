import { OpenAiApiCompatibleProvider } from '../openAiApiCompatible'
import { ConfigType } from '../../helpers/configType'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Mistral AI APIs, which are compatible with the OpenAI ones, plus their
 * own moderation endpoint.
 * Official documentation: https://docs.mistral.ai
 */
export class MistralProvider extends OpenAiApiCompatibleProvider {
    public constructor(config: ConfigType) {
        super(config, {
            serviceLabel: 'Mistral AI',
            baseUrl: 'https://api.mistral.ai',
            model: config.mistral.model,
            apiKey: config.mistral.apiKey
        })
    }

    // Classifies if text input is potentially harmful.
    // https://docs.mistral.ai/capabilities/guardrailing
    public async moderateText(input: string): Promise<{ [key: string]: number }> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData = JSON.stringify({
            'model': 'mistral-moderation-latest',
            'input': input
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeaders(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch(`${this.baseUrl}/v1/moderations`, requestOptions)
        clearAbortSignalWithTimeout()

        if (!response.ok) {
            throw new Error(`${this.serviceLabel} error: ${await MistralProvider.extractErrorMessage(response)}`)
        }

        const jsonData = await response.json()
        return this.normalizeModerationResponse(jsonData)
    }

    /**
     * This method normalizes the moderation response by rounding the category
     * scores to the nearest integer.
     *
     * It takes the first result from the provided JSON data and processes its
     * category scores, the result is an object where the keys are the category
     * names and the values are the rounded scores.
     */
    private normalizeModerationResponse(data: any): { [key: string]: number } {
        const categoryScores = data.results[0].category_scores
        const normalizedScores: { [key: string]: number } = {}

        // Iterate over the category scores and round the values
        for (const category in categoryScores) {
            if (categoryScores.hasOwnProperty(category)) {
                // Manage a translated string for a specific Mistral AI moderation
                // category.
                const translatedCategory = browser.i18n.getMessage(`mailModerate.mistralClassification.${category}`)

                // Round the value and store it in the normalizedScores object
                normalizedScores[translatedCategory] = Math.round(categoryScores[category] * 100)
            }
        }

        return normalizedScores
    }
}
