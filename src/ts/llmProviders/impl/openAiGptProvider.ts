import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * OpenAI APIs.
 * Official documentation: https://platform.openai.com/docs/api-reference
 */
export class OpenAiGptProvider extends GenericProvider {
    private readonly apiKey: string
    private readonly organizationId: string
    private readonly model: string
    private readonly text2speechAudioQuality: string
    private readonly text2speechVoice: string
    private readonly text2speechSpeed: number

    public constructor(config: ConfigType) {
        super(config)

        this.apiKey = config.openai.apiKey
        this.organizationId = config.openai.organizationId
        this.model = config.openai.model
        this.text2speechAudioQuality = config.openai.text2speech.audioQuality
        this.text2speechVoice = config.openai.text2speech.voice
        this.text2speechSpeed = config.openai.text2speech.speed
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

    public async getSpeechFromText(input: string): Promise<Blob> {
        logMessage(`Request for text2speech of the text: ${input}`, 'debug')

        // The maximum input length is 4096 characters, see official documentation:
        // https://platform.openai.com/docs/api-reference/audio/createSpeech
        if (input.length > 4096) {
            throw new Error('The text is too long, it exceeds the maximum of 4096 characters')
        }

        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData: string = JSON.stringify({
            'model': this.text2speechAudioQuality,
            'input': input,
            'voice': this.text2speechVoice,
            'speed': this.text2speechSpeed
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch('https://api.openai.com/v1/audio/speech', requestOptions)
        clearAbortSignalWithTimeout()

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`OpenAI error: ${errorResponse.error.message}`)
        }

        return await response.blob()
    }

    // Classifies if text input is potentially harmful.
    // https://platform.openai.com/docs/api-reference/moderations
    public async moderateText(input: string): Promise<{ [key: string]: number }> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        const requestData = JSON.stringify({
            'model': 'omni-moderation-latest',
            'input': input
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch('https://api.openai.com/v1/moderations', requestOptions)
        clearAbortSignalWithTimeout()

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`OpenAI error: ${errorResponse.error.message}`)
        }

        const jsonData = await response.json()
        return this.normalizeModerationResponse(jsonData)
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
        logMessage(`Request to summarize in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input} in ${getLanguageNameFromCode(this.mainUserLanguageCode)}`, 'debug')

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

    /**
     * Function to generate headers for API requests.
     *
     * @returns {Headers} The headers object with necessary headers appended.
     */
    private getHeader(): Headers {
        const headers: Headers = new Headers()
        headers.append('Authorization', `Bearer ${this.apiKey}`)
        headers.append('Content-Type', 'application/json')

        if(this.organizationId) {
            headers.append('OpenAI-Organization', this.organizationId)
        }

        return headers
    }

    /**
     * This asynchronous method manages message content by sending a request
     * to the OpenAI API using the provided system and user input.
     * It constructs a POST request with the relevant model and message data,
     * manages the request with a timeout signal, and processes the response.
     *
     * If the request is successful, it returns the content of the response
     * message.
     * In case of failure, it throws an error with the specific message from
     * the OpenAI API.
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
            'messages': [
                { 'role': 'system', 'content': systemInput },
                { 'role': 'user', 'content': userInput }
            ],
            'temperature': this.temperature
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this.getHeader(),
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions)
        clearAbortSignalWithTimeout()

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`OpenAI error: ${errorResponse.error.message}`)
        }

        const responseData = await response.json()
        return responseData.choices[0].message.content
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
                // Manage a translated string for a specific OpenAI moderation
                // category.
                // Each moderation category (e.g., "hate/threatening") has an
                // associated name that may contain the "/" character, but
                // since localization keys cannot contain "/", it’s necessary 
                // to replace "/" with "_",
                // The string 'mailModerate.openaiClassification.' is concatenated
                // with the modified category (where "/" is replaced with "_") to
                // form a localization key. This key is then used to retrieve the
                // translated text associated with that specific moderation category
                // in line with OpenAI’s moderation documentation available at: 
                // https://platform.openai.com/docs/guides/moderation/quickstart?moderation-quickstart-examples=text
                const translatedCategory = browser.i18n.getMessage('mailModerate.openaiClassification.' + category.replace(/\//g, '_'))

                // Round the value and store it in the normalizedScores object
                normalizedScores[translatedCategory] = Math.round(categoryScores[category] * 100)
            }
        }

        return normalizedScores
    }
}