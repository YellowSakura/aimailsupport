/**
 * Definition of an abstract class for all the LLM services exposing an
 * OpenAI-compatible API, i.e. those answering to a POST request on
 * `{baseUrl}/v1/chat/completions` with a `choices[0].message.content`
 * payload.
 *
 * Concrete providers only have to declare, through the constructor options,
 * the label used in error messages, the base URL of the service, the model
 * and — when required — the API key: every operation is inherited from here.
 *
 * Note: the operations must live in this class and not in GenericProvider,
 * because the capability detection of GenericProvider works by comparing the
 * methods with the ones defined on GenericProvider.prototype.
 */
import { GenericProvider, StreamCallback } from './genericProvider'
import { ConfigType } from '../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../helpers/utils'

/**
 * Options describing the specific OpenAI-compatible service.
 */
export interface OpenAiApiCompatibleOptions {
    // Name of the service, used as a prefix of the error messages
    serviceLabel: string

    // Base URL of the service, without the `/v1/...` suffix
    baseUrl: string

    model: string

    // Optional: local services like LM Studio or Ollama don't require it
    apiKey?: string
}

export abstract class OpenAiApiCompatibleProvider extends GenericProvider {
    protected readonly serviceLabel: string
    protected readonly baseUrl: string
    protected readonly model: string
    protected readonly apiKey: string

    protected constructor(config: ConfigType, options: OpenAiApiCompatibleOptions) {
        super(config)

        this.serviceLabel = options.serviceLabel
        this.baseUrl = options.baseUrl
        this.model = options.model
        this.apiKey = options.apiKey ?? ''
    }

    public async analyzeTextIntent(input: string, onChunk?: StreamCallback): Promise<string> {
        logMessage(`Request to analyze text intent of ${input} in ${getLanguageNameFromCode(this.mainUserLanguageCode)}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.ANALYZE_INTENT.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input, onChunk)
    }

    public async applyCustomPrompt(userPrompt: string, input: string, onChunk?: StreamCallback): Promise<string> {
        logMessage(`Applying custom user prompt "${userPrompt}" to input text: "${input}"`, 'debug')

        return this.manageMessageContent(userPrompt, input, onChunk)
    }

    public async checkTextForErrors(input: string, onChunk?: StreamCallback): Promise<string> {
        logMessage(`Request to check for errors in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.CHECK_ERRORS.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input, onChunk)
    }

    public async explainText(input: string, onChunk?: StreamCallback): Promise<string> {
        logMessage(`Request to explain in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.EXPLAIN.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input, onChunk)
    }

    public async rephraseText(input: string, toneOfVoice: string, onChunk?: StreamCallback): Promise<string> {
        logMessage(`Request to use the tone of voice "${toneOfVoice}" to rephrase in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.REPHRASE.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode))
            .replace('%toneOfVoice%', toneOfVoice), input, onChunk)
    }

    public async suggestImprovementsForText(input: string, onChunk?: StreamCallback): Promise<string> {
        logMessage(`Request suggest improvements in ${getLanguageNameFromCode(this.mainUserLanguageCode)} for the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUGGEST_IMPROVEMENTS.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input, onChunk)
    }

    public async suggestReplyFromText(input: string, toneOfVoice: string, onChunk?: StreamCallback): Promise<string> {
        logMessage(`Request to use the tone of voice "${toneOfVoice}" to suggest a reply in ${getLanguageNameFromCode(this.mainUserLanguageCode)} to the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUGGEST_REPLY.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode))
            .replace('%toneOfVoice%', toneOfVoice), input, onChunk)
    }

    public async summarizeText(input: string, onChunk?: StreamCallback): Promise<string> {
        logMessage(`Request to summarize in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUMMARIZE.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input, onChunk)
    }

    public async testIntegration(): Promise<void> {
        await this.translateText('Hi!')
    }

    public async translateText(input: string, languageCode: string | null = null, onChunk?: StreamCallback): Promise<string> {
        languageCode = languageCode ?? this.mainUserLanguageCode
        logMessage(`Request to translate in ${getLanguageNameFromCode(languageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.TRANSLATE.replace('%language%', getLanguageNameFromCode(languageCode)), input, onChunk)
    }

    /**
     * Function to generate headers for API requests.
     *
     * The authorization header is added only when an API key is available:
     * local services like LM Studio or Ollama usually don't require it.
     *
     * @param isStreaming - Whether the request expects a Server-Sent Events
     *        response instead of a plain JSON one.
     *
     * @returns The headers object with necessary headers appended.
     */
    protected getHeaders(isStreaming: boolean = false): Headers {
        const headers: Headers = new Headers()
        headers.append('Accept', isStreaming ? 'text/event-stream' : 'application/json')
        headers.append('Content-Type', 'application/json')

        if (this.apiKey) {
            headers.append('Authorization', `Bearer ${this.apiKey}`)
        }

        return headers
    }

    /**
     * This asynchronous method manages message content by sending a request
     * to the OpenAI-compatible API using the provided system and user input.
     * It constructs a POST request with the relevant model and message data,
     * manages the request with a timeout signal, and processes the response.
     *
     * If the request is successful, it returns the content of the response
     * message.
     * In case of failure, it throws an error with the specific message from
     * the API.
     *
     * When a callback is provided and streaming is enabled in the settings,
     * the answer is requested as a Server-Sent Events stream and every piece
     * of text is handed over as soon as it arrives. The whole text is returned
     * at the end either way.
     *
     * @param systemInput - The input for the 'system' role in the conversation.
     * @param userInput - The input for the 'user' role in the conversation.
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A promise that resolves to the content of the response message
     *          from the API.
     *
     * @throws An error if the API response is not successful.
     */
    protected async manageMessageContent(systemInput: string, userInput: string,
            onChunk?: StreamCallback): Promise<string> {
        const useStream = onChunk !== undefined && this.streamResponses
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData = JSON.stringify({
            'model': this.model,
            'messages': [
                { 'role': 'system', 'content': systemInput },
                { 'role': 'user', 'content': userInput }
            ],
            // The temperature is omitted when the selected model does not
            // accept it, since those models reject the parameter.
            ...(this.temperature !== null && { 'temperature': this.temperature }),
            ...(useStream && { 'stream': true })
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeaders(useStream),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch(`${this.baseUrl}/v1/chat/completions`, requestOptions)

        // While streaming the timeout has to survive the headers, since the
        // body is consumed afterwards: it is disarmed on the first chunk, as
        // soon as the service actually starts answering.
        if (!useStream || !response.ok) {
            clearAbortSignalWithTimeout()
        }

        if (!response.ok) {
            throw new Error(`${this.serviceLabel} error: ${await OpenAiApiCompatibleProvider.extractErrorMessage(response)}`)
        }

        if (!useStream) {
            const responseData = await response.json()
            return responseData.choices[0].message.content
        }

        let fullText = ''

        await this.readSseStream(response, data => {
            let event: any

            try {
                event = JSON.parse(data)
            } catch {
                // A malformed event is skipped rather than failing the whole
                // generation: the text received so far stays usable.
                logMessage(`${this.serviceLabel}: skipped a malformed stream event`, 'warn')
                return
            }

            if (event.error) {
                throw new Error(`${this.serviceLabel} error: ${event.error?.message ?? event.error}`)
            }

            // Only `content` is taken: the reasoning models expose their
            // thinking through `reasoning_content`, which must not end up in
            // the answer shown to the user.
            const delta: string = event.choices?.[0]?.delta?.content ?? ''

            if (delta) {
                fullText += delta
                onChunk(delta)
            }
        }, clearAbortSignalWithTimeout)

        return fullText
    }

    /**
     * Returns an array of model IDs available on an OpenAI-compatible service.
     *
     * It's used by the `getModels` method of the concrete providers, which
     * exposes it with the arguments actually needed by the specific service.
     *
     * @param baseUrl - Base URL of the service, without the `/v1/...` suffix.
     * @param serviceLabel - Name of the service, used in the error message.
     * @param apiKey - Optional API key of the service.
     *
     * @returns A promise that resolves to the list of available model IDs.
     *
     * @throws An error if the API response is not successful.
     */
    protected static async fetchModels(baseUrl: string, serviceLabel: string, apiKey: string = ''): Promise<string[]> {
        const headers: Headers = new Headers()
        if (apiKey) {
            headers.append('Authorization', `Bearer ${apiKey}`)
        }

        const requestOptions: RequestInit = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        }

        const response = await fetch(`${baseUrl}/v1/models`, requestOptions)

        if (!response.ok) {
            throw new Error(`${serviceLabel} error: ${await OpenAiApiCompatibleProvider.extractErrorMessage(response)}`)
        }

        const responseData = await response.json()

        // Return an array of model IDs from the response data
        return responseData.data.map((model: { id: string }) => model.id)
    }

    /**
     * Extracts a human readable message from an unsuccessful API response.
     *
     * Every service has its own error format: the most common ones are
     * handled, falling back to the HTTP status text when the body is missing,
     * is not a valid JSON or has an unknown structure.
     *
     * @param response - The unsuccessful response returned by the service.
     *
     * @returns A promise that resolves to the error message to display.
     */
    protected static async extractErrorMessage(response: Response): Promise<string> {
        try {
            const errorResponse = await response.json()
            const message = errorResponse?.error?.message ?? errorResponse?.error ?? errorResponse?.message ??
                errorResponse?.detail

            // Only a plain string is a usable message: anything else (a missing
            // field or a nested object) falls back to the HTTP status text
            return typeof message === 'string' ? message : response.statusText
        }
        catch {
            return response.statusText
        }
    }
}
