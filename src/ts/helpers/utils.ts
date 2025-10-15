import { ConfigType } from './configType'

/**
 * Retrieve data from browser storage for a specific key.
 * Returns null if no data is found or an error occurs.
 *
 * @param key - The key to retrieve data from storage.
 *
 * @returns A promise that resolves with the retrieved data, or null if an error
 *          occurs.
 */
export async function getConfig(key: string): Promise<any> | null {
    let config: any = null

    try {
        config = (await browser.storage.sync.get(key))[key]
    } catch (error) {
        logMessage(`An error occurred while retrieving the config for ${key}: ${error}`, 'error')
    }

    return config
}

/**
 * Retrieve all data from browser storage.
 * Returns null if no data is found or an error occurs.
 *
 * @returns A promise that resolves with the retrieved data, or null if an error
 *          occurs.
 */
export async function getConfigs(): Promise<ConfigType> | null {
    let configs: any = null

    try {
        configs = await browser.storage.sync.get(null)
    } catch (error) {
        logMessage(`An error occurred while retrieving configs: ${error}`, 'error')
    }

    return configs
}

/**
 * Retrieves the content of the currently displayed message.
 *
 * This function asynchronously fetches the content of the currently displayed
 * message.
 * It retrieves the message content in both HTML and plain text format, and
 * returns the plain text content.
 * If the plain text content is not available, it attempts to extract it from
 * the HTML content.
 *
 * @returns A Promise resolving to the plain text content of the current message.
 *          Returns `null` if the content cannot be retrieved.
 */
export async function getCurrentMessageContent(): Promise<string> {
    const tabs = await messenger.tabs.query({ active: true, currentWindow: true })

    // The text of the current message is retrieved by distinguishing two cases:
    // whether we are dealing with an email being viewed, or whether we are in the
    // case of an email being created or edited.
    //
    // The second scenario is considered only if the messageDisplayed variable is
    // not valid.
    const messageDisplayed = await messenger.messageDisplay.getDisplayedMessage(tabs[0].id)
    // MANIFEST V3: const messageDisplayed = await messenger.messageDisplay.getDisplayedMessages(tabs[0].id)
    const composeDetails = !messageDisplayed ? await messenger.compose.getComposeDetails(tabs[0].id) : null

    let fullHtml = null
    let fullPlain = null

    // Case: Email viewing -->
    if(messageDisplayed) {
        // @ts-expect-error - Thunderbird 128+ introduce listInlineTextParts
        const textParts = await messenger.messages.listInlineTextParts(messageDisplayed.id)
        // MANIFEST V3: const textParts = await messenger.messages.listInlineTextParts(messageDisplayed['messages'][0].id)


        // Find the text/html and text/plain parts
        for (const part of textParts) {
            if (part.contentType?.toLowerCase() === 'text/html') {
                fullHtml = part.content
            } else if (part.contentType?.toLowerCase() === 'text/plain') {
                fullPlain = part.content
            }
        }
    }
    // <-- case: Email viewing
    // Case: Email creation or edit -->
    else if(composeDetails) {
        fullHtml = composeDetails.body
        fullPlain = composeDetails.plainTextBody
    }
    // <-- case: Email creation or edit

    if(fullPlain == null && fullHtml) {
        // @ts-expect-error - Thunderbird 128+ introduce messengerUtilities
        fullPlain = await messenger.messengerUtilities.convertToPlainText(fullHtml)
    }

    // Remove link (https and https), newlines and extra spaces before returning
    // the plain text
    if(fullPlain) {
        fullPlain = fullPlain
            .replace(/https?:\/\/[^\s]+/g, '')  // Remove URL
            .replace(/[\r\n]+/g, ' ')           // Replace newlines with space
            .replace(/\s{2,}/g, ' ')            // Replace multiple spaces with a single space
            .trim()                             // Remove leading/trailing spaces
    }

    return fullPlain || null
}

/**
 * Retrieves the extended name of a language based on its code.
 *
 * @param {string} languageCode - The language code (e.g., 'en' for English).
 * @param {string} locale - The locale used to format the language name, e.g.,
 *         'it' to display names in Italian.
 *          If not specified, 'en' (English) is used as the default.
 *
 * @returns {string | undefined} The extended name of the language if found,
 *          otherwise undefined.
 */
export function getLanguageNameFromCode(languageCode: string, locale: string = 'en'): string | undefined {
    const languageNames = new Intl.DisplayNames([locale], { type: 'language' })

    try {
        return languageNames.of(languageCode)
    } catch (error) {
        logMessage(`Error in retrieving the language name from the code: ${error}`, 'error')
        return undefined
    }
}

/**
 * Localizes HTML nodes with the 'data-l10n-ref' attribute.
 *
 * This function searches for all HTML nodes with the 'data-l10n-ref' attribute and
 * sets their inner HTML with the corresponding localized message obtained from the
 * internationalization message management module.
 *
 * @returns {void}
 */
export function localizeNodes(): void {
    document.querySelectorAll('[data-l10n-ref]').forEach((node: Element) => {
        const l10nRef = node.getAttribute('data-l10n-ref')
        node.innerHTML = messenger.i18n.getMessage(l10nRef)
    })
}

/**
 * Logs a message to the console if the debug mode is enabled.
 * 
 * This function checks the configuration for the 'debugMode' setting.
 * If 'debugMode' is true, it will log the provided message using the specified 
 * console method (e.g., 'log', 'error', 'warn', 'info').
 * 
 * @param message - The message to log to the console.
 * @param method - The console method to use for logging. Defaults to 'log'.
 * 
 * @returns A promise that resolves to void.
 */
export async function logMessage(message: string, method: string = 'log'): Promise<void> {
    const isDebugModeEnabled = await getConfig('debugMode')

    if (isDebugModeEnabled === true) {
        console[method](`AI Mail Support: ${message}`)
    }
}

/**
 * Sends a message to the currently active tab in the browser.
 * 
 * The function accepts two possible message formats:
 * 
 * 1. A structured message with 'type' and 'content' properties:
 *    - type: string identifying the message type
 *    - content: can be a Blob, string, or an index signature type
 *      { [key: string]: number } (used to manage graphs)
 * 2. Prompt display toggle format with a boolean to control prompt visibility
 * 
 * @param message - The message payload, which must be either:
 *        - { type: string; content: Blob | string | { [key: string]: number } }
 *          for structured messages
 *        - { showPromptDisplay: boolean } to toggle prompt display
 *
 * @returns A Promise that resolves when the message has been sent successfully
 */
export async function sendMessageToActiveTab(
    message: 
        | { type: string; content: Blob | string | { [key: string]: number } }
        | { showPromptDisplay: boolean } 
): Promise<void> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    await browser.tabs.sendMessage(tabs[0].id, message)
}