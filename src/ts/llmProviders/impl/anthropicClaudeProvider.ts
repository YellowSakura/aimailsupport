import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Anthropic APIs.
 * Official documentation: https://docs.anthropic.com/en/api/getting-started
 */
export class AnthropicClaudeProvider extends GenericProvider {
    private readonly apiKey: string
    private readonly model: string

    public constructor(config: ConfigType) {
        super(config)

        // The temperature value is normalized based on the options, with a
        // range of 0 to 1 for Anthropic, while for other LLM models, and
        // consequently in the add-on options, values can be set between 0
        // and 2.
        this.temperature = config.temperature / 2
        this.apiKey = config.anthropic.apiKey
        this.model = config.anthropic.model
    }

    public async analyzeTextIntent(input: string): Promise<string> {
        logMessage(`Request to analyze text intent of ${input} in ${getLanguageNameFromCode(this.mainUserLanguageCode)}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.ANALYZE_INTENT.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    public async applyCustomPrompt(userPrompt: string, input: string): Promise<string> {
        logMessage(`Applying custom user prompt "${userPrompt}" to input text: "${input}"`, 'debug')

        return this.manageMessageContent(userPrompt, input)
    }

    public async explainText(input: string): Promise<string> {
        logMessage(`Request to explain in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.EXPLAIN.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
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
        logMessage(`Request to summarize the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUMMARIZE, input)
    }

    public async testIntegration(): Promise<void> {
        await this.translateText('Hi!')
    }

    public async translateText(input: string, languageCode: string | null = null): Promise<string> {
        languageCode = languageCode ?? this.mainUserLanguageCode
        logMessage(`Request to translate in ${getLanguageNameFromCode(languageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.TRANSLATE.replace('%language%', getLanguageNameFromCode(languageCode)), input)
    }

    /**
     * Function to generate headers for API requests.
     *
     * @returns {Headers} The headers object with necessary headers appended.
     */
    private getHeaders(): Headers {
        const headers: Headers = new Headers()
        headers.append('x-api-key', this.apiKey)
        headers.append('anthropic-version', '2023-06-01')
        headers.append('anthropic-dangerous-direct-browser-access', 'true')
        headers.append('Content-Type', 'application/json')

        return headers
    }

    /**
     * This asynchronous method manages message content by sending a request
     * to the Anthropic API using the provided system and user input.
     * It constructs a POST request with the relevant model and message data,
     * manages the request with a timeout signal, and processes the response.
     *
     * If the request is successful, it returns the content of the response
     * message.
     * In case of failure, it throws an error with the specific message from
     * the Anthropic API.
     *
     * @param systemInput - The input for the 'system' role in the conversation.
     * @param userInput - The input for the 'user' role in the conversation.
     *
     * @returns A promise that resolves to the content of the response message
     *          from the API.
     *
     * @throws An error if the API response is not successful.
     */
    private async manageMessageContent(systemInput: string, userInput: string): Promise<string> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData = JSON.stringify({
            'model': this.model,
            'temperature': this.temperature,
            'max_tokens': 2048,
            'system': systemInput,
            'messages': [
                { 'role': 'user', 'content': userInput }
            ]
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeaders(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', requestOptions)
        clearAbortSignalWithTimeout()

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Anthropic error: ${errorResponse.error.message}`)
        }

        const responseData = await response.json()
        return responseData.content[0].text
    }
}