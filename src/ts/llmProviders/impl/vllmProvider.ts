import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with a
 * vLLM local inference server via its OpenAI-compatible API.
 * Official documentation: https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html
 */
export class VllmProvider extends GenericProvider {
    private readonly serviceUrl: string
    private readonly model: string
    private readonly apiKey: string

    public constructor(config: ConfigType) {
        super(config)

        this.serviceUrl = config.vllm.serviceUrl
        this.model = config.vllm.model
        this.apiKey = config.vllm.apiKey
    }

    public async analyzeTextIntent(input: string): Promise<string> {
        logMessage(`Request to analyze text intent of ${input} in ${getLanguageNameFromCode(this.mainUserLanguageCode)}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.ANALYZE_INTENT.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    public async applyCustomPrompt(userPrompt: string, input: string): Promise<string> {
        logMessage(`Applying custom user prompt "${userPrompt}" to input text: "${input}"`, 'debug')

        return this.manageMessageContent(userPrompt, input)
    }

    public async checkTextForErrors(input: string): Promise<string> {
        logMessage(`Request to check for errors in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.CHECK_ERRORS.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    public async explainText(input: string): Promise<string> {
        logMessage(`Request to explain in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.EXPLAIN.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    /**
     * Returns an array of model IDs available on the vLLM server.
     */
    public static async getModels(serviceUrl: string, apiKey: string = ''): Promise<string[]> {
        const headers: Headers = new Headers()
        if (apiKey) {
            headers.append('Authorization', `Bearer ${apiKey}`)
        }

        const requestOptions: RequestInit = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        }

        const response = await fetch(`${serviceUrl}/v1/models`, requestOptions)

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`vLLM error: ${errorResponse.error?.message ?? response.statusText}`)
        }

        const responseData = await response.json()

        return responseData.data.map((model: { id: string }) => model.id)
    }

    public async rephraseText(input: string, toneOfVoice: string): Promise<string> {
        logMessage(`Request to use the tone of voice "${toneOfVoice}" to rephrase in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.REPHRASE.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode))
            .replace('%toneOfVoice%', toneOfVoice), input)
    }

    public async suggestImprovementsForText(input: string): Promise<string> {
        logMessage(`Request suggest improvements in ${getLanguageNameFromCode(this.mainUserLanguageCode)} for the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUGGEST_IMPROVEMENTS.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    public async suggestReplyFromText(input: string, toneOfVoice: string): Promise<string> {
        logMessage(`Request to use the tone of voice "${toneOfVoice}" to suggest a reply in ${getLanguageNameFromCode(this.mainUserLanguageCode)} to the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUGGEST_REPLY.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode))
            .replace('%toneOfVoice%', toneOfVoice), input)
    }

    public async summarizeText(input: string): Promise<string> {
        logMessage(`Request to summarize in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUMMARIZE.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    public async testIntegration(): Promise<void> {
        await this.translateText('Hi!')
    }

    public async translateText(input: string, languageCode: string | null = null): Promise<string> {
        languageCode = languageCode ?? this.mainUserLanguageCode
        logMessage(`Request to translate in ${getLanguageNameFromCode(languageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.TRANSLATE.replace('%language%', getLanguageNameFromCode(languageCode)), input)
    }

    private async manageMessageContent(systemInput: string, userInput: string): Promise<string> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const headers: Headers = new Headers()
        headers.append('Content-Type', 'application/json')

        if (this.apiKey) {
            headers.append('Authorization', `Bearer ${this.apiKey}`)
        }

        const requestData = JSON.stringify({
            'model': this.model,
            'messages': [
                { 'role': 'system', 'content': systemInput },
                { 'role': 'user', 'content': userInput }
            ],
            'temperature': this.temperature
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: headers,
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch(`${this.serviceUrl}/v1/chat/completions`, requestOptions)
        clearAbortSignalWithTimeout()

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`vLLM error: ${errorResponse.error?.message ?? response.statusText}`)
        }

        const responseData = await response.json()
        return responseData.choices[0].message.content
    }
}
