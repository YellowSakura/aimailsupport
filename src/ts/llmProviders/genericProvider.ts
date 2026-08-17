/**
 * Definition of a generic class for the implementation of an LLM service provider,
 * which all actual implementations must extend.
 */
import { ConfigType } from '../helpers/configType'

/**
 * Callback invoked with every piece of text produced by the LLM while the
 * answer is still being generated.
 *
 * The operations accepting it keep returning the whole text once the
 * generation is over, so the callback is a pure addition: a caller not
 * interested in the progressive output simply omits it.
 */
export type StreamCallback = (chunk: string) => void

export class GenericProvider {
    protected mainUserLanguageCode: string
    protected servicesTimeout: number
    protected temperature: number | null
    protected streamResponses: boolean

    /**
     * Controller of the request currently in flight, kept here so that the
     * generation can be interrupted from the outside through `abort()`.
     */
    private currentAbortController: AbortController | null = null

    protected readonly PROMPTS = {
        ANALYZE_INTENT: 'You are an assistant that analyzes the tone and perceived intent of an email and provides the analysis in %language%; describe how the email might come across to the recipient, considering tone, clarity, potential emotional impact, and coherence with the context of the email thread history; Ignore formatting, headers, footers, signatures, quoted replies and unusual characters',
        CHECK_ERRORS: 'You are an assistant that carefully checks emails in %language% for spelling errors, logical inconsistencies, inaccuracies, typos, and other potential issues; provide a detailed analysis pointing out any problems found and suggesting corrections; Ignore formatting, headers, footers, signatures, quoted replies and unusual characters',
        EXPLAIN: 'You are an assistant that explains the content of emails in %language% in a clear and simple way, preserving the original meaning; avoid unnecessary complexity; Ignore formatting, headers, footers, signatures, quoted replies and unusual characters',
        REPHRASE: 'You are an assistant that rephrases the content of emails in %language% using a %toneOfVoice% tone of voice; preserve the original meaning; Ignore formatting, headers, footers, signatures, quoted replies and unusual characters',
        SUGGEST_IMPROVEMENTS: 'You are an assistant that suggests improvements to the content of emails in %language%, focusing on clarity, tone, and effectiveness; Ignore formatting, headers, footers, signatures, quoted replies and unusual characters',
        SUGGEST_REPLY: 'You are an assistant that suggests a reply to the email in %language%, using a %toneOfVoice% tone of voice; ensure the reply is clear and relevant to the sender’s message; Ignore formatting, headers, footers, signatures, quoted replies and unusual characters',
        SUMMARIZE: 'You are an assistant that summarizes emails in %language% in a short and clear way, focusing only on the sender’s core message or request; Ignore formatting, headers, footers, signatures, quoted replies and unusual characters',
        TRANSLATE: 'You are an assistant that translates emails into %language% as naturally and accurately as possible; preserve meaning, tone, and style; Ignore formatting, headers, footers, signatures, quoted replies and unusual characters'
    }

    public constructor(config: ConfigType) {
        this.mainUserLanguageCode = config.mainUserLanguageCode
        this.servicesTimeout = config.servicesTimeout
        this.temperature = config.temperature

        // Streaming is the default: the comparison with false, instead of a
        // plain truthy check, keeps it enabled on the installations upgrading
        // from a version where the setting did not exist yet.
        this.streamResponses = config.streamResponses !== false
    }

    /**
     * Analyze intent of the input string.
     *
     * @param input - The string to be analyzed.
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A promise that resolves to the analysis of the input text.
     */
    public async analyzeTextIntent(input: string, onChunk?: StreamCallback): Promise<any> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Applies a custom user-defined prompt to the given input string.
     *
     * @param userPrompt - The custom prompt provided by the user.
     * @param input - The input string to process.
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A promise that resolves to the resulting output string.
     * @throws If the prompt application is unsupported or fails.
     */
    public async applyCustomPrompt(userPrompt: string, input: string, onChunk?: StreamCallback): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Checks the provided text input for spelling errors, logical inconsistencies,
     * inaccuracies, typos, and other potential issues.
     *
     * @param input - The input text to be checked for errors.
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A Promise resolving to an analysis of errors found in the text.
     */
    public async checkTextForErrors(input: string, onChunk?: StreamCallback): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Explains the input string.
     *
     * @param input - The string to be explained.
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A promise that resolves to the explained version of the input text.
     */
    public async explainText(input: string, onChunk?: StreamCallback): Promise<any> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Converts text to speech.
     *
     * @param input - The input text to be converted.
     *
     * @returns A Promise resolving to the converted text as a Blob.
     */
    public async getSpeechFromText(input: string): Promise<Blob> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Moderates the input string.
     *
     * @param input - The string to be moderated.
     *
     * @returns A promise that resolves to the moderated JSON object.
     */
    public async moderateText(input: string): Promise<any> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Rephrase the input text according to the specified tone of voice
     * and provide a modified version.
     *
     * @param input - The input text to be rephrased.
     * @param toneOfVoice - The town on voice to be applied for rewriting
     *        (e.g., "formal", "creative", "polite", ...).
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A Promise resolving to the rephrased version of the input
     *          text based on the specified style.
     */
    public async rephraseText(input: string, toneOfVoice: string, onChunk?: StreamCallback): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Suggests improvements to the provided text input to enhance its clarity,
     * tone, or overall quality.
     *
     * @param input - The input text to be analyzed and improved.
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A Promise resolving to the improved version of the input text.
     */
    public async suggestImprovementsForText(input: string, onChunk?: StreamCallback): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Provides a suggested reply based on the input text according to the
     * specified tone of voice.
     *
     * @param input - The input text for which a reply is suggested.
     * @param toneOfVoice - The town on voice to be applied for rewriting
     *        (e.g., "formal", "creative", "polite", ...).
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A Promise resolving to the suggested reply.
     */
    public async suggestReplyFromText(input: string, toneOfVoice: string, onChunk?: StreamCallback): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Summarizes the input text.
     *
     * @param input - The input text to be summarized.
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A Promise resolving to the summarized text.
     */
    public async summarizeText(input: string, onChunk?: StreamCallback): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Tests the integration of the provider.
     *
     * @returns A Promise resolving to void.
     */
    public async testIntegration(): Promise<void> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    /**
     * Translates the input text.
     *
     * @param input - The input text to be translated.
     * @param languageCode - The target language code for the translation.
     *        Can be omitted or null, in such cases, the user's main language
     *        preference will be used as the default.
     * @param onChunk - Optional callback receiving the text as it is generated.
     *
     * @returns A Promise resolving to the translated text.
     */
    public async translateText(input: string, languageCode: string | null = null, onChunk?: StreamCallback): Promise<string> {
        throw new Error(browser.i18n.getMessage('errorInvalidAddonOptions'))
    }

    // Methods to verify if the object implementing a particular LLM service has
    // specific capabilities.
    // This is done by checking that the current class actually has a specific
    // implementation for the reference method. -->
    public canAnalyzeTextIntent(): boolean {
        return this.analyzeTextIntent !== GenericProvider.prototype.analyzeTextIntent
    }

    public canApplyCustomPrompt(): boolean {
        return this.applyCustomPrompt !== GenericProvider.prototype.applyCustomPrompt
    }

    public canExplainText(): boolean {
        return this.explainText !== GenericProvider.prototype.explainText
    }

    public canModerateText(): boolean {
        return this.moderateText !== GenericProvider.prototype.moderateText
    }

    public canRephraseText(): boolean {
        return this.rephraseText !== GenericProvider.prototype.rephraseText
    }

    public canSpeechFromText(): boolean {
        return this.getSpeechFromText !== GenericProvider.prototype.getSpeechFromText
    }

    public canCheckTextForErrors(): boolean {
        return this.checkTextForErrors !== GenericProvider.prototype.checkTextForErrors
    }

    public canSuggestImprovementsForText(): boolean {
        return this.suggestImprovementsForText !== GenericProvider.prototype.suggestImprovementsForText
    }

    public canSuggestReply(): boolean {
        return this.suggestReplyFromText !== GenericProvider.prototype.suggestReplyFromText
    }

    public canSummarizeText(): boolean {
        return this.summarizeText !== GenericProvider.prototype.summarizeText
    }

    public canTranslateText(): boolean {
        return this.translateText !== GenericProvider.prototype.translateText
    }
    // <-- check capabilities

    /**
     * Interrupts the request currently in flight, if any.
     *
     * It is what backs the stop button of the response panel: the fetch is
     * aborted, the operation rejects with an AbortError and the text received
     * so far stays available to the caller.
     */
    public abort(): void {
        this.currentAbortController?.abort()
    }

    /**
     * This function initializes an AbortController and sets a timeout to automatically
     * abort the signal after the given duration.
     * It also provides a clear function to cancel the timeout if the request completes
     * successfully before the timeout.
     *
     * The AbortSignal can be used to interrupt remote calls, ensuring that long-running
     * requests do not hang indefinitely. By passing this signal to a fetch request,
     * the request will be aborted if it takes longer than the specified timeout.
     *
     * @param timeout - The duration in seconds after which the request should be
     *        aborted.
     *
     * @returns An object containing the AbortSignal and a clear function.
     */
    protected createAbortSignalWithTimeout(timeout: number): { signal: AbortSignal,
            clearAbortSignalWithTimeout: () => void } {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout * 1000)

        // The controller is kept on the instance so that `abort()` can reach
        // it, which is how the request gets interrupted on user request.
        this.currentAbortController = controller

        // Function to clear the timeout if the request completes successfully
        const clearAbortSignalWithTimeout = () => {
            clearTimeout(timeoutId)
        }

        return { signal: controller.signal, clearAbortSignalWithTimeout }
    }

    /**
     * Reads a Server-Sent Events response, handing over the payload of every
     * `data:` field as soon as it is complete.
     *
     * The format is shared by all the streaming protocols supported by the
     * add-on, while the shape of the payload is not: parsing it is left to the
     * caller, which knows the service it is talking to.
     *
     * @param response - The streaming response returned by the service.
     * @param onData - Called with the raw payload of every event, already
     *        stripped of the `data:` prefix. The `[DONE]` terminator and the
     *        keep-alive comments are filtered out beforehand.
     * @param onFirstChunk - Called once, as soon as the first bytes of the body
     *        are read. It marks the moment the service actually started
     *        answering, and it is where the callers disarm the timeout.
     */
    protected async readSseStream(response: Response, onData: (data: string) => void,
            onFirstChunk?: () => void): Promise<void> {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let buffer = ''
        let isFirstChunk = true

        try {
            for (;;) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                if (isFirstChunk) {
                    isFirstChunk = false
                    onFirstChunk?.()
                }

                buffer += decoder.decode(value, { stream: true })

                // Events are separated by a blank line: everything before the
                // last separator is complete and can be dispatched, while the
                // remainder stays in the buffer waiting for the next read.
                const events = buffer.split(/\r?\n\r?\n/)
                buffer = events.pop() ?? ''

                for (const event of events) {
                    GenericProvider.dispatchSseEvent(event, onData)
                }
            }

            // A stream closed without the trailing blank line still carries a
            // last, complete event.
            if (buffer.trim()) {
                GenericProvider.dispatchSseEvent(buffer, onData)
            }
        } finally {
            reader.releaseLock()
        }
    }

    /**
     * Extracts the payload of a single SSE event and hands it to the callback.
     *
     * An event can spread its payload over several `data:` lines, which the
     * specification requires to be joined with a newline. The other fields
     * (`event:`, `id:`, `retry:`) and the comments are ignored: every protocol
     * used here repeats the event type inside the JSON payload.
     *
     * @param event - The raw text of the event, without the trailing separator.
     * @param onData - Called with the payload, unless it is empty or the
     *        `[DONE]` terminator.
     */
    private static dispatchSseEvent(event: string, onData: (data: string) => void): void {
        const dataLines = event.split(/\r?\n/)
            .filter(line => line.startsWith('data:'))
            .map(line => line.slice(5).trimStart())

        if (dataLines.length === 0) {
            return
        }

        const data = dataLines.join('\n')

        if (data && data !== '[DONE]') {
            onData(data)
        }
    }
}