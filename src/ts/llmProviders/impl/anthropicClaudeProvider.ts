import { GenericProvider, StreamCallback } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Anthropic APIs.
 * Official documentation: https://platform.claude.com/docs/en/api/overview
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
        // A null value means that the selected model does not accept the
        // parameter at all, so there is nothing to normalize.
        this.temperature = (config.temperature === null) ? null : config.temperature / 2
        this.apiKey = config.anthropic.apiKey
        this.model = config.anthropic.model
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
     * @param isStreaming - Whether the request expects a Server-Sent Events
     *        response instead of a plain JSON one.
     *
     * @returns {Headers} The headers object with necessary headers appended.
     */
    private getHeaders(isStreaming: boolean = false): Headers {
        const headers: Headers = new Headers()
        headers.append('x-api-key', this.apiKey)
        headers.append('anthropic-version', '2023-06-01')
        headers.append('anthropic-dangerous-direct-browser-access', 'true')
        headers.append('Content-Type', 'application/json')
        headers.append('Accept', isStreaming ? 'text/event-stream' : 'application/json')

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
    private async manageMessageContent(systemInput: string, userInput: string,
            onChunk?: StreamCallback): Promise<string> {
        const useStream = onChunk !== undefined && this.streamResponses
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData = JSON.stringify({
            'model': this.model,
            // The temperature is omitted when the selected model does not
            // accept it, since those models reject the parameter.
            ...(this.temperature !== null && { 'temperature': this.temperature }),
            // The limit covers the reasoning tokens too, which the most recent
            // models produce by default, so it must leave room for both the
            // reasoning and the actual answer.
            'max_tokens': 8192,
            'system': systemInput,
            'messages': [
                { 'role': 'user', 'content': userInput }
            ],
            ...(useStream && { 'stream': true })
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeaders(useStream),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', requestOptions)

        // While streaming the timeout has to survive the headers, since the
        // body is consumed afterwards: it is disarmed on the first chunk, as
        // soon as the service actually starts answering.
        if (!useStream || !response.ok) {
            clearAbortSignalWithTimeout()
        }

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Anthropic error: ${errorResponse.error.message}`)
        }

        if (useStream) {
            return this.readMessageStream(response, onChunk, clearAbortSignalWithTimeout)
        }

        const responseData = await response.json()

        // The most recent models can decline a request through their safety
        // classifiers: the call succeeds, but the content is empty or partial,
        // so it has to be handled before reading the text.
        if (responseData.stop_reason === 'refusal') {
            throw new Error('Anthropic error: the request was declined by the safety filters of the model')
        }

        const textContent = responseData.content?.find((block: { type: string }) => block.type === 'text')

        if (!textContent) {
            throw new Error('Anthropic error: the response did not contain any text content')
        }

        return textContent.text
    }

    /**
     * Consumes the event stream of the messages endpoint, collecting the text
     * of the answer.
     *
     * Every event carries its own type inside the JSON payload, so the `event:`
     * field of the stream can be ignored. Only the `text_delta` fragments are
     * taken: the models producing a reasoning summary emit it as
     * `thinking_delta`, which must not end up in the answer shown to the user.
     *
     * @param response - The streaming response returned by the service.
     * @param onChunk - Callback receiving the text as it is generated.
     * @param onFirstChunk - Called as soon as the service starts answering.
     *
     * @returns A promise that resolves to the whole generated text.
     *
     * @throws An error if the stream carries an error event or the request is
     *         declined by the safety filters of the model.
     */
    private async readMessageStream(response: Response, onChunk: StreamCallback,
            onFirstChunk: () => void): Promise<string> {
        let fullText = ''

        await this.readSseStream(response, data => {
            let event: any

            try {
                event = JSON.parse(data)
            } catch {
                // A malformed event is skipped rather than failing the whole
                // generation: the text received so far stays usable.
                logMessage('Anthropic: skipped a malformed stream event', 'warn')
                return
            }

            switch (event.type) {
                case 'content_block_delta':
                    if (event.delta?.type === 'text_delta' && event.delta.text) {
                        fullText += event.delta.text
                        onChunk(event.delta.text)
                    }
                    break

                case 'message_delta':
                    // The same refusal handled on the non-streaming path, which
                    // here is only known once the generation is over.
                    if (event.delta?.stop_reason === 'refusal') {
                        throw new Error('Anthropic error: the request was declined by the safety filters of the model')
                    }
                    break

                case 'error':
                    throw new Error(`Anthropic error: ${event.error?.message ?? 'unknown streaming error'}`)
            }
        }, onFirstChunk)

        return fullText
    }
}