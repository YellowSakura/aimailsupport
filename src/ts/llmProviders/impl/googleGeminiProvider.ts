import { GenericProvider, StreamCallback } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * Google AI Gemini APIs.
 * Official documentation: https://ai.google.dev/gemini-api/docs
 */
export class GoogleGeminiProvider extends GenericProvider {
    private readonly apiKey: string
    private readonly model: string
    private readonly reasoningEffort: string

    public constructor(config: ConfigType) {
        super(config)

        this.apiKey = config.google.apiKey
        this.model = config.google.model
        this.reasoningEffort = config.google.reasoningEffort || 'medium'
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
        headers.append('Content-Type', 'application/json')
        headers.append('x-goog-api-key', this.apiKey)
        headers.append('Accept', isStreaming ? 'text/event-stream' : 'application/json')

        return headers
    }

    /**
     * This asynchronous method manages message content by sending a request
     * to the Gogole AI API using the provided system and user input.
     * It constructs a POST request with the relevant model and message data,
     * manages the request with a timeout signal, and processes the response.
     *
     * If the request is successful, it returns the content of the response
     * message.
     * In case of failure, it throws an error with the specific message from
     * the Gogole AI API.
     *
     * When a callback is provided and streaming is enabled in the settings,
     * the answer is requested to the `streamGenerateContent` endpoint as a
     * Server-Sent Events stream and every piece of text is handed over as soon
     * as it arrives. The whole text is returned at the end either way.
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
            'system_instruction': {
                'parts': { 'text': systemInput }
            },
            'contents': {
                'parts': { 'text': userInput }
            },
            // All thresholds are disabled to avoid interference with the use of
            // various LLM functions.
            // https://ai.google.dev/gemini-api/docs/safety-settings
            'safety_settings': [
                {
                    'category': 'HARM_CATEGORY_HARASSMENT',
                    'threshold': 'BLOCK_NONE'
                },
                {
                    'category': "HARM_CATEGORY_HATE_SPEECH",
                    'threshold': "BLOCK_NONE"
                },
                {
                    'category': "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    'threshold': "BLOCK_NONE"
                },
                {
                    'category': "HARM_CATEGORY_DANGEROUS_CONTENT",
                    'threshold': "BLOCK_NONE"
                }
            ],
            'generationConfig': {
                // The temperature is omitted when the selected model does not
                // accept it, since those models reject the parameter.
                ...(this.temperature !== null && { 'temperature': this.temperature }),
                'thinkingConfig': {
                    'thinking_level': (this.reasoningEffort === 'off') ? 'MINIMAL' : this.reasoningEffort.toUpperCase()
                }
            }
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeaders(useStream),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        // The streaming answer comes from a dedicated endpoint, which without
        // `alt=sse` would reply with a JSON array instead of an event stream.
        const endpoint = useStream ? 'streamGenerateContent?alt=sse' : 'generateContent'
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:${endpoint}`, requestOptions)

        // While streaming the timeout has to survive the headers, since the
        // body is consumed afterwards: it is disarmed on the first chunk, as
        // soon as the service actually starts answering.
        if (!useStream || !response.ok) {
            clearAbortSignalWithTimeout()
        }

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Google AI error: ${errorResponse.error.message}`)
        }

        if (useStream) {
            return this.readGenerateContentStream(response, onChunk, clearAbortSignalWithTimeout)
        }

        const responseData = await response.json()

        // Check the response from the Google AI model for any safety-related
        // issues, if the finishReason is 'SAFETY', it indicates that the safety
        // threshold has been exceeded.
        // Reference: https://ai.google.dev/gemini-api/docs/safety-settings
        if(responseData.candidates[0].finishReason == 'SAFETY') {
            throw new Error(`Google AI error: ${browser.i18n.getMessage('errorGoogleGeminiSafetyThresholdExceeded')}`)
        }

        const parts = responseData.candidates[0].content.parts

        // When thinking is enabled the answer is split across several parts, and
        // the ones carrying the reasoning summary are flagged with "thought".
        // The first part holding actual text and not marked as a thought is the
        // answer, while the fallback on the last part covers the responses that
        // come as a single part, as happens when thinking is turned off.
        const textPart = parts.find((part: any) => !part.thought && part.text) || parts[parts.length - 1]

        return textPart.text
    }

    /**
     * Consumes the event stream of the `streamGenerateContent` endpoint,
     * collecting the text of the answer.
     *
     * Every event is a partial `GenerateContentResponse`, so the parts flagged
     * as `thought` have to be filtered out on each one of them, exactly as the
     * non-streaming path does on the whole answer: otherwise the reasoning
     * summary would end up in the text shown to the user.
     *
     * @param response - The streaming response returned by the service.
     * @param onChunk - Callback receiving the text as it is generated.
     * @param onFirstChunk - Called as soon as the service starts answering.
     *
     * @returns A promise that resolves to the whole generated text.
     *
     * @throws An error if the stream carries an error event or the safety
     *         threshold of the model is exceeded.
     */
    private async readGenerateContentStream(response: Response, onChunk: StreamCallback,
            onFirstChunk: () => void): Promise<string> {
        let fullText = ''

        await this.readSseStream(response, data => {
            let event: any

            try {
                event = JSON.parse(data)
            } catch {
                // A malformed event is skipped rather than failing the whole
                // generation: the text received so far stays usable.
                logMessage('Google AI: skipped a malformed stream event', 'warn')
                return
            }

            if (event.error) {
                throw new Error(`Google AI error: ${event.error?.message ?? 'unknown streaming error'}`)
            }

            const candidate = event.candidates?.[0]

            if (!candidate) {
                return
            }

            // Reference: https://ai.google.dev/gemini-api/docs/safety-settings
            if (candidate.finishReason === 'SAFETY') {
                throw new Error(`Google AI error: ${browser.i18n.getMessage('errorGoogleGeminiSafetyThresholdExceeded')}`)
            }

            for (const part of candidate.content?.parts ?? []) {
                if (!part.thought && part.text) {
                    fullText += part.text
                    onChunk(part.text)
                }
            }
        }, onFirstChunk)

        return fullText
    }
}