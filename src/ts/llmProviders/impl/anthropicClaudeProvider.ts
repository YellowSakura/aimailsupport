import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Anthropic APIs.
 * Official documentation: https://docs.anthropic.com/en/api/getting-started
 */
export class AnthropicClaudeProvider extends GenericProvider {
    private apiKey: string
    private model: string

    public constructor(config: ConfigType) {
        super(config)

        this.apiKey = config.anthropic.apiKey
        this.model = config.anthropic.model
    }

    public async softenText(input: string): Promise<string> {
        logMessage(`Request to softer the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SOFTER, input)
    }

    public async suggestReplyFromText(input: string): Promise<string> {
        logMessage(`Request suggestion reply from text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUGGEST_REPLY, input)
    }

    public async summarizeText(input: string): Promise<string> {
        logMessage(`Request to summarize the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUMMARIZE, input)
    }

    public async testIntegration(): Promise<void> {
        await this.translateText('Hi!')
    }

    public async translateText(input: string): Promise<string> {
        logMessage(`Request to translate in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.TRANSLATE.replace('%s', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    /**
     * Function to generate headers for API requests.
     *
     * @returns {Headers} The headers object with necessary headers appended.
     */
    private getHeader(): Headers {
        const headers: Headers = new Headers()
        headers.append('x-api-key', this.apiKey)
        headers.append('anthropic-version', '2023-06-01')
        headers.append('Content-Type', 'application/json')

        return headers
    }

    private async manageMessageContent(systemInput: string, userInput: string): Promise<string> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData = JSON.stringify({
            'model': this.model,
            'max_tokens': 1024,
            'system': systemInput,
            'messages': [
                { 'role': 'user', 'content': userInput }
            ]
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
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