import { ProviderFactory } from './llmProviders/providerFactory'
import { GenericProvider, StreamCallback } from './llmProviders/genericProvider'
import { getConfig, getConfigs, getCurrentMessageContent, getLanguageNameFromCode, isComposeDisplayed, logMessage, sendMessageToTab } from './helpers/utils'

// The array contains references to the menus of any custom languages selected
// by the user for which a translation is requested.
let translationMenuItemIds: (number | string)[] = []

/**
 * Requests currently in flight, keyed by the tab that originated them, so that
 * the stop button of the response panel can interrupt the right one.
 */
const pendingRequests = new Map<number, { provider: GenericProvider, isStoppedByUser: boolean }>()

/**
 * How long the generated text is accumulated before being sent to the tab.
 *
 * Forwarding every single fragment would mean one message per token, which is
 * far more than the panel needs to look responsive.
 */
const STREAM_FLUSH_INTERVAL = 100

// Create the menu entries -->
const menuIdAnalyzeIntent = messenger.menus.create({
    id: 'aiAnalyzeIntent',
    title: browser.i18n.getMessage('mailAnalyzeIntent'),
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdExplain = messenger.menus.create({
    id: 'aiExplain',
    title: browser.i18n.getMessage('mailExplain'),
    contexts: [
        'compose_action_menu',
        'message_display_action_menu',
        'selection'
    ]
})

const menuIdSummarize = messenger.menus.create({
    id: 'aiSummarize',
    title: browser.i18n.getMessage('mailSummarize'),
    contexts: [
        'compose_action_menu',
        'message_display_action_menu',
        'selection'
    ]
})

// Rephrase submenu -->
const subMenuIdRephrase = messenger.menus.create({
    id: 'aiSubMenuRephrase',
    title: browser.i18n.getMessage('mailRephrase'),
    contexts: [
        'selection'
    ]
})

const menuIdRephraseStandard = messenger.menus.create({
    id: 'aiRephraseStandard',
    title: browser.i18n.getMessage('mailRephrase.standard'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseFluid = messenger.menus.create({
    id: 'aiRephraseFluid',
    title: browser.i18n.getMessage('mailRephrase.fluid'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseCreative = messenger.menus.create({
    id: 'aiRephraseCreative',
    title: browser.i18n.getMessage('mailRephrase.creative'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseSimple = messenger.menus.create({
    id: 'aiRephraseSimple',
    title: browser.i18n.getMessage('mailRephrase.simple'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseFormal = messenger.menus.create({
    id: 'aiRephraseFormal',
    title: browser.i18n.getMessage('mailRephrase.formal'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseAcademic = messenger.menus.create({
    id: 'aiRephraseAcademic',
    title: browser.i18n.getMessage('mailRephrase.academic'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseExpanded = messenger.menus.create({
    id: 'aiRephraseExpanded',
    title: browser.i18n.getMessage('mailRephrase.expanded'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephraseShortened = messenger.menus.create({
    id: 'aiRephraseShortened',
    title: browser.i18n.getMessage('mailRephrase.shortened'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})

const menuIdRephrasePolite = messenger.menus.create({
    id: 'aiRephrasePolite',
    title: browser.i18n.getMessage('mailRephrase.polite'),
    parentId: subMenuIdRephrase,
    contexts: [
        'selection'
    ]
})
// <-- rephrase submenu

// Suggest reply submenu -->
const subMenuIdSuggestReply = messenger.menus.create({
    id: 'aiSubMenuSuggestReply',
    title: browser.i18n.getMessage('mailSuggestReply'),
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyStandard = messenger.menus.create({
    id: 'aiSuggestReplyStandard',
    title: browser.i18n.getMessage('mailSuggestReply.standard'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyFluid = messenger.menus.create({
    id: 'aiSuggestReplyFluid',
    title: browser.i18n.getMessage('mailSuggestReply.fluid'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyCreative = messenger.menus.create({
    id: 'aiSuggestReplyCreative',
    title: browser.i18n.getMessage('mailSuggestReply.creative'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplySimple = messenger.menus.create({
    id: 'aiSuggestReplySimple',
    title: browser.i18n.getMessage('mailSuggestReply.simple'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyFormal = messenger.menus.create({
    id: 'aiSuggestReplyFormal',
    title: browser.i18n.getMessage('mailSuggestReply.formal'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyAcademic = messenger.menus.create({
    id: 'aiSuggestReplyAcademic',
    title: browser.i18n.getMessage('mailSuggestReply.academic'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyExpanded = messenger.menus.create({
    id: 'aiSuggestReplyExpanded',
    title: browser.i18n.getMessage('mailSuggestReply.expanded'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyShortened = messenger.menus.create({
    id: 'aiSuggestReplyShortened',
    title: browser.i18n.getMessage('mailSuggestReply.shortened'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})

const menuIdSuggestReplyPolite = messenger.menus.create({
    id: 'aiSuggestReplyPolite',
    title: browser.i18n.getMessage('mailSuggestReply.polite'),
    parentId: subMenuIdSuggestReply,
    contexts: [
        'compose_action_menu'
    ]
})
// <-- suggest reply submenu

// Summarize submenu -->
const subMenuIdSummarize = messenger.menus.create({
    id: 'aiSubMenuSummarize',
    title: browser.i18n.getMessage('mailSummarizeAnd'),
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

const menuIdSummarizeAndText2Speech = messenger.menus.create({
    id: 'aiSummarizeAndText2Speech',
    title: browser.i18n.getMessage('mailListen'),
    parentId: subMenuIdSummarize,
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})
// <-- summarize submenu

const menuIdText2Speech = messenger.menus.create({
    id: 'aiText2Speech',
    title: browser.i18n.getMessage('mailListen'),
    contexts: [
        'selection'
    ]
})

const menuIdTranslate = messenger.menus.create({
    id: 'aiTranslate',
    title: browser.i18n.getMessage('mailTranslate'),
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

// Translate submenu -->
const subMenuIdTranslateAnd = messenger.menus.create({
    id: 'aiSubMenuTranslate',
    title: browser.i18n.getMessage('mailTranslateAnd'),
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

const menuIdTranslateAndSummarize = messenger.menus.create({
    id: 'aiTranslateAndSummarize',
    title: browser.i18n.getMessage('mailSummarizeAndAfter'),
    parentId: subMenuIdTranslateAnd,
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

const menuIdTranslateAndText2Speech = messenger.menus.create({
    id: 'aiTranslateAndText2Speech',
    title: browser.i18n.getMessage('mailListenAndAfter'),
    parentId: subMenuIdTranslateAnd,
    contexts: [
        'message_display_action_menu',
        'selection'
    ]
})

// Separator for the message display action menu
const menuIdTranslateSeparator = messenger.menus.create({
    id: "aiTranslateSeparator",
    type: 'separator',
    parentId: subMenuIdTranslateAnd,
    contexts: [
        'message_display_action_menu',
        'selection'
    ],
    visible: false
})

// Translations into the (optional) target languages selected by the user
updateMenuWithUserTranslationPreferences()
// <-- translate submenu

const menuIdModerate = messenger.menus.create({
    id: 'aiModerate',
    title: browser.i18n.getMessage('mailModerate'),
    contexts: [
        'message_display_action_menu'
    ]
})

const menuIdCheckErrors = messenger.menus.create({
    id: 'aiCheckErrors',
    title: browser.i18n.getMessage('mailCheckErrors'),
    contexts: [
        'compose_action_menu',
        'selection'
    ]
})

const menuIdSuggestImprovements = messenger.menus.create({
    id: 'aiSuggestImprovements',
    title: browser.i18n.getMessage('mailSuggestImprovements'),
    contexts: [
        'compose_action_menu',
        'message_display_action_menu',
        'selection'
    ]
})

const menuIdCustomPrompt = messenger.menus.create({
    id: 'aiCustomPrompt',
    title: browser.i18n.getMessage('mailCustomPrompt'),
    contexts: [
        'compose_action_menu',
        'message_display_action_menu'
    ]
})

// Separator for the message display action menu
messenger.menus.create({
    id: 'aiMessageDisplayActionMenuSeparator1',
    type: 'separator',
    contexts: [
        'message_display_action_menu'
    ]
})

const menuIdOptions = messenger.menus.create({
    id: 'aiOptions',
    title: browser.i18n.getMessage('options'),
    contexts: [
        'message_display_action_menu'
    ]
})

// Invocation of the method to handle the visibility of menu options based on the
// user-selected LLM.
// This ensures that all menu items are properly handled at add-on startup.
updateMenuVisibility()
// <-- create the menu entries

// Register a listener for the menus.onClicked events
messenger.menus.onClicked.addListener(async (info: messenger.menus.OnClickData, tab: messenger.tabs.Tab) => {
    // Capture the originating tab ID so that the response is always sent back
    // to the tab where the request was initiated, even if the user switches
    // tabs while the LLM is processing.
    const tabId = tab.id

    // Handling menu actions that only open UI panels without LLM processing:
    // - Options: opens the add-on settings page
    // - Custom prompt: shows the prompt input popup (LLM processing is
    //   deferred until the user submits the prompt via onMessage listener)
    // -->
    if([menuIdOptions, menuIdCustomPrompt].includes(info.menuItemId)) {
        if(info.menuItemId == menuIdOptions) {
            browser.runtime.openOptionsPage()
        }
        else if(info.menuItemId == menuIdCustomPrompt) {
            sendMessageToTab(tabId, {showPromptDisplay: true})
        }

        return
    }
    // <-- handling menu actions that only open UI panels

    const configs = await getConfigs()
    const llmProvider = ProviderFactory.getInstance(configs)

    // Retrieving text for LLM processing regardless of the user-requested option,
    // with the application of the general "thinking" output.
    sendMessageToTab(tabId, { type: 'thinking', content: messenger.i18n.getMessage('thinking') })
    const textToBeProcessed = info.selectionText ?? await getCurrentMessageContent(tabId)

    if (textToBeProcessed == null) {
        sendMessageToTab(tabId, { type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
        return
    }

    // Determine if we're in compose mode and notify the content script first
    const isCompose = await isComposeDisplayed(tabId)
    sendMessageToTab(tabId, { type: 'setComposeMode', isCompose: isCompose })

    if(info.menuItemId == menuIdAnalyzeIntent) {
        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.analyzeTextIntent(textToBeProcessed, onChunk),
            'Error during intent analysis')
    }
    else if(info.menuItemId == menuIdExplain) {
        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.explainText(textToBeProcessed, onChunk),
            'Error during explanation')
    }
    else if(info.menuItemId == menuIdSummarize) {
        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.summarizeText(textToBeProcessed, onChunk),
            'Error during summarization')
    }
    else if([menuIdRephraseStandard, menuIdRephraseFluid, menuIdRephraseCreative, menuIdRephraseSimple,
            menuIdRephraseFormal, menuIdRephraseAcademic, menuIdRephraseExpanded, menuIdRephraseShortened,
            menuIdRephrasePolite].includes(info.menuItemId)) {
        // Extracts the tone of voice from the menuItemId by taking a substring
        // starting from the 10th character.
        // The value 10 corresponds to the length of the string 'aiRephrase',
        // allowing the code to retrieve the portion of the menuItemId that
        // follows 'aiRephrase'.
        const toneOfVoice = (info.menuItemId as string).substring(10).toLowerCase()

        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.rephraseText(textToBeProcessed, toneOfVoice, onChunk),
            'Error during rephrasing')
    }
    else if([menuIdSuggestReplyStandard, menuIdSuggestReplyFluid, menuIdSuggestReplyCreative, menuIdSuggestReplySimple,
            menuIdSuggestReplyFormal, menuIdSuggestReplyAcademic, menuIdSuggestReplyExpanded, menuIdSuggestReplyShortened,
            menuIdSuggestReplyPolite].includes(info.menuItemId)) {
        // Extracts the tone of voice from the menuItemId by taking a substring
        // starting from the 14th character.
        // The value 14 corresponds to the length of the string 'aiSuggestReply',
        // allowing the code to retrieve the portion of the menuItemId that
        // follows 'aiRephrase'.
        const toneOfVoice = (info.menuItemId as string).substring(14).toLowerCase()

        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.suggestReplyFromText(textToBeProcessed, toneOfVoice, onChunk),
            'Error during reply generation')
    }
    else if(info.menuItemId == menuIdSummarizeAndText2Speech) {
        try {
            const textSummarized = await llmProvider.summarizeText(textToBeProcessed)
            const blob = await llmProvider.getSpeechFromText(textSummarized)

            sendMessageToTab(tabId, {type: 'addAudio', content: blob})
        } catch (error) {
            sendMessageToTab(tabId, {type: 'showError', content: getLocalizedErrorMessage(error)})
            logMessage(`Error during summarization and text-to-speech: ${error.message}`, 'error')
        }
    }
    else if(info.menuItemId == menuIdText2Speech) {
        llmProvider.getSpeechFromText(textToBeProcessed).then(blob => {
            sendMessageToTab(tabId, {type: 'addAudio', content: blob})
        }).catch(error => {
            sendMessageToTab(tabId, {type: 'showError', content: getLocalizedErrorMessage(error)})
            logMessage(`Error during text-to-speech conversion: ${error.message}`, 'error')
        })
    }
    else if(info.menuItemId == menuIdTranslate || translationMenuItemIds?.includes(info.menuItemId)) {
        let languageCode = null

        // The language code is retrieved when selected from a menu item that
        // propagates the specific code in its ID.
        const prefix = 'aiTranslateTo_'
        if ((info.menuItemId as string).startsWith(prefix)) {
            languageCode = (info.menuItemId as string).slice(prefix.length)
        }

        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.translateText(textToBeProcessed, languageCode, onChunk),
            'Error during translation')
    }
    else if(info.menuItemId == menuIdTranslateAndSummarize) {
        // Only the summary is streamed: the translation is an intermediate
        // step, whose whole text is the input of the operation that follows.
        await runTextOperation(tabId, llmProvider,
            async onChunk => llmProvider.summarizeText(await llmProvider.translateText(textToBeProcessed), onChunk),
            'Error during translation and summarization')
    }
    else if(info.menuItemId == menuIdTranslateAndText2Speech) {
        try {
            const textTranslated = await llmProvider.translateText(textToBeProcessed)
            const blob = await llmProvider.getSpeechFromText(textTranslated)

            sendMessageToTab(tabId, {type: 'addAudio', content: blob})
        } catch (error) {
            sendMessageToTab(tabId, {type: 'showError', content: getLocalizedErrorMessage(error)})
            logMessage(`Error during translation and text2Speech: ${error.message}`, 'error')
        }
    }
    else if(info.menuItemId == menuIdModerate) {
        llmProvider.moderateText(textToBeProcessed).then(moderatedResponse => {
            sendMessageToTab(tabId, {type: 'addChart', content: moderatedResponse})
        }).catch(error => {
            sendMessageToTab(tabId, {type: 'showError', content: getLocalizedErrorMessage(error)})
            logMessage(`Error during moderation: ${error.message}`, 'error')
        })
    }
    else if(info.menuItemId == menuIdCheckErrors) {
        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.checkTextForErrors(textToBeProcessed, onChunk),
            'Error during error checking')
    }
    else if(info.menuItemId == menuIdSuggestImprovements) {
        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.suggestImprovementsForText(textToBeProcessed, onChunk),
            'Error while improving the text')
    }
    // Fallback for unrecognized menu items. The 'aiOptions' entry is excluded
    // because it is already handled in the actions that only open UI panels.
    else if (!['aiOptions'].includes(info.menuItemId as string)) {
        sendMessageToTab(tabId, {type: 'showError', content: `Invalid menu item selected: ${info.menuItemId}`})
        logMessage(`Invalid menu item selected: ${info.menuItemId}`, 'error')
    }
})

// Listens for the message signaling.
browser.runtime.onMessage.addListener(async (message, sender) => {
    // Settings saved by the user: the interface is realigned immediately, without
    // restarting the add-on. For example, choosing a model that supports text to
    // speech enables the related menu entries, which are disabled again as soon as
    // a model without that capability is selected.
    if (message.type === 'optionsChanged') {
        updateMenuVisibility()
        updateMenuWithUserTranslationPreferences()
    }

    // Custom prompt typed by the user in the promptDisplay panel: it is applied to
    // the content of the email currently displayed or being composed.
    if (message.action === 'sendUserPromptToBackground') {
        // Capture the originating tab ID so that the response is always sent back
        // to the tab where the request was initiated, even if the user switches
        // tabs while the LLM is processing.
        const tabId = sender.tab.id

        const configs = await getConfigs()
        const llmProvider = ProviderFactory.getInstance(configs)

        sendMessageToTab(tabId, { type: 'thinking', content: messenger.i18n.getMessage('thinking') })

        const currentMessageContent = await getCurrentMessageContent(tabId)

        if(currentMessageContent == null) {
            sendMessageToTab(tabId, {type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            await runTextOperation(tabId, llmProvider,
                onChunk => llmProvider.applyCustomPrompt(message.data.userPrompt, currentMessageContent, onChunk),
                'Error during the custom prompt')
        }
    }

    // Refinement requested from the outputDisplay panel: the prompt is applied to
    // the previous AI response, carried by the message itself, and not to the email.
    if (message.type === 'refineLastResponse') {
        const tabId = sender.tab.id

        const configs = await getConfigs()
        const llmProvider = ProviderFactory.getInstance(configs)

        sendMessageToTab(tabId, { type: 'thinking', content: messenger.i18n.getMessage('thinking') })

        await runTextOperation(tabId, llmProvider,
            onChunk => llmProvider.applyCustomPrompt(message.refinementPrompt, message.lastResponse, onChunk),
            'Error during refinement')
    }

    // Stop button pressed in the outputDisplay panel while an answer was being
    // generated: the request of that tab is interrupted, keeping the text
    // received so far.
    if (message.type === 'stopGeneration') {
        const pendingRequest = pendingRequests.get(sender.tab.id)

        if (pendingRequest) {
            // The flag is raised before aborting, so that the rejection caused
            // by the abort is recognized as a user request and not reported as
            // a failure.
            pendingRequest.isStoppedByUser = true
            pendingRequest.provider.abort()
        }
    }
})

/**
 * Using the messageDisplayScripts API for customizing the content displayed when
 * viewing a message.
 *
 * For more information check the docs at:
 * https://webextension-api.thunderbird.net/en/stable/messageDisplayScripts.html
 */
messenger.messageDisplayScripts.register({
    js: [
        { file: '/outputDisplay/outputDisplay.js' },
        { file: '/promptDisplay/promptDisplay.js' }
    ],
    css: [
        { file: '/outputDisplay/outputDisplay.css' },
        { file: '/promptDisplay/promptDisplay.css' }
    ]
})

/**
 * Using the composeScripts API for customizing the content displayed when create
 * or edit a message.
 *
 * For more information check the docs at:
 * https://webextension-api.thunderbird.net/en/stable/composeScripts.html
 */
messenger.composeScripts.register({
    js: [
        { file: '/outputDisplay/outputDisplay.js' },
        { file: '/promptDisplay/promptDisplay.js' }
    ],
    css: [
        { file: '/outputDisplay/outputDisplay.css' },
        { file: '/promptDisplay/promptDisplay.css' }
    ]
})

// The function manages the visibility of menu options based on the user-selected
// LLM.
async function updateMenuVisibility(): Promise<void> {
    const configs = await getConfigs()
    const llmProvider = ProviderFactory.getInstance(configs)

    // canAnalyzeTextIntent -->
    messenger.menus.update(menuIdAnalyzeIntent, {
        enabled: llmProvider.canAnalyzeTextIntent()
    })
    // <-- canAnalyzeTextIntent

    // canApplyCustomPrompt -->
    messenger.menus.update(menuIdCustomPrompt, {
        enabled: llmProvider.canApplyCustomPrompt()
    })
    // <-- canApplyCustomPrompt

    // canExplainText -->
    messenger.menus.update(menuIdExplain, {
        enabled: llmProvider.canExplainText()
    })
    // <-- canExplainText

    // canModerateText -->
    messenger.menus.update(menuIdModerate, {
        enabled: llmProvider.canModerateText()
    })
    // <-- canModerateText

    // canCheckTextForErrors -->
    messenger.menus.update(menuIdCheckErrors, {
        enabled: llmProvider.canCheckTextForErrors()
    })
    // <-- canCheckTextForErrors

    // canRephraseText -->
    messenger.menus.update(subMenuIdRephrase, {
        enabled: llmProvider.canRephraseText()
    })
    // <-- canRephraseText

    // canSpeechFromText -->
    messenger.menus.update(menuIdText2Speech, {
        enabled: llmProvider.canSpeechFromText()
    })

    messenger.menus.update(menuIdSummarizeAndText2Speech, {
        enabled: llmProvider.canSpeechFromText()
    })

    messenger.menus.update(menuIdTranslateAndText2Speech, {
        enabled: llmProvider.canSpeechFromText()
    })
    // <-- canSpeechFromText

    // canSuggestImprovementsForText -->
    messenger.menus.update(menuIdSuggestImprovements, {
        enabled: llmProvider.canSuggestImprovementsForText()
    })
    // <-- canSuggestImprovementsForText

    // canSuggestReply -->
    messenger.menus.update(subMenuIdSuggestReply, {
        enabled: llmProvider.canSuggestReply()
    })
    // <-- canSuggestReply

    // canSummarizeText -->
    messenger.menus.update(menuIdSummarize, {
        enabled: llmProvider.canSummarizeText()
    })

    messenger.menus.update(subMenuIdSummarize, {
        enabled: llmProvider.canSummarizeText()
    })
    // <-- canSummarizeText

    // canTranslateText -->
    messenger.menus.update(menuIdTranslate, {
        enabled: llmProvider.canTranslateText()
    })

    messenger.menus.update(subMenuIdTranslateAnd, {
        enabled: llmProvider.canTranslateText()
    })
    // <-- canTranslateText
}

// Updates the menu based on the user's preferred languages.
// This function retrieves the user's language preferences and dynamically
// updates the menu options accordingly.
async function updateMenuWithUserTranslationPreferences(): Promise<void> {
    const mainUserLanguageCode = await getConfig('mainUserLanguageCode')
    const translationLanguageCodes = await getConfig('translationLanguageCodes')

    // Removal of old menu items, necessary to ensure consistency of values
    // in case the user updates their language settings.
    translationMenuItemIds?.forEach((menuItemId: (number | string)) => {
        messenger.menus.remove(menuItemId)
    })

    // Inhibition of visibility for the separator between general translation
    // menu items and those specific to multiple languages.
    messenger.menus.update(menuIdTranslateSeparator, {
        visible: false
    })

    if(translationLanguageCodes?.length > 0) {
        translationMenuItemIds = []

        // Enabling the visibility of the separator between general translation
        // menu items and those specific to multiple languages.
        messenger.menus.update(menuIdTranslateSeparator, {
            visible: true
        })

        translationLanguageCodes.forEach((languageCode: string) => {
            const languageName = getLanguageNameFromCode(languageCode, mainUserLanguageCode)

            if(languageName !== undefined) {
                // The language code is embedded directly into the menu item ID to uniquely
                // identify the translation target (e.g., "aiTranslateTo_it" for Italian).
                // This allows easy lookup or removal of specific language-related menu items.
                const menuId = `aiTranslateTo_${languageCode}`

                const menuItemId = messenger.menus.create({
                    id: menuId,
                    title: browser.i18n.getMessage('mailTranslateTo', languageName),
                    parentId: subMenuIdTranslateAnd,
                    contexts: [
                        'message_display_action_menu',
                        'selection'
                    ]
                })

                translationMenuItemIds.push(menuItemId)
            }
        })
    }
}

/**
 * Runs an LLM operation producing text, forwarding the answer to the tab as it
 * is generated and keeping the handle used to interrupt it.
 *
 * The fragments are accumulated and sent every STREAM_FLUSH_INTERVAL, so that
 * the panel is updated often enough to look responsive without one message per
 * token. When the provider does not stream, either because the setting is off
 * or because the operation does not support it, the whole text simply arrives
 * as a single chunk.
 *
 * An interruption requested by the user is not an error: the generation is
 * closed as if it were complete and the text received so far stays on screen.
 *
 * @param tabId - The tab where the request was initiated.
 * @param provider - The provider running the operation, whose `abort()` backs
 *        the stop button.
 * @param operation - The operation to run, receiving the callback to which the
 *        generated text has to be handed over.
 * @param errorContext - Prefix of the message written to the log on failure.
 */
async function runTextOperation(tabId: number, provider: GenericProvider,
        operation: (onChunk: StreamCallback) => Promise<string>, errorContext: string): Promise<void> {
    const pendingRequest = { provider: provider, isStoppedByUser: false }
    pendingRequests.set(tabId, pendingRequest)

    let buffer = ''
    let hasStarted = false
    let flushTimeoutId: ReturnType<typeof setTimeout> | null = null

    const flush = () => {
        flushTimeoutId = null

        if (!buffer) {
            return
        }

        // The panel is told the generation has begun only when there is
        // something to show, which is also when the stop button appears.
        if (!hasStarted) {
            hasStarted = true
            sendMessageToTab(tabId, { type: 'streamStart' })
        }

        sendMessageToTab(tabId, { type: 'addTextChunk', content: buffer })
        buffer = ''
    }

    try {
        const fullText = await operation(chunk => {
            buffer += chunk

            if (flushTimeoutId === null) {
                flushTimeoutId = setTimeout(flush, STREAM_FLUSH_INTERVAL)
            }
        })

        if (flushTimeoutId !== null) {
            clearTimeout(flushTimeoutId)
            flushTimeoutId = null
        }

        // Without streaming nothing has been shown yet, so the whole text is
        // sent at once: it also covers the answers arriving as a single chunk.
        if (!hasStarted && !buffer) {
            sendMessageToTab(tabId, { type: 'addText', content: fullText })
            return
        }

        flush()
        sendMessageToTab(tabId, { type: 'endText' })
    } catch (error) {
        if (flushTimeoutId !== null) {
            clearTimeout(flushTimeoutId)
        }

        if (pendingRequest.isStoppedByUser) {
            // Everything received before the stop is kept, so the partial
            // answer can still be copied or refined.
            flush()
            sendMessageToTab(tabId, { type: 'endText' })
            return
        }

        sendMessageToTab(tabId, { type: 'showError', content: getLocalizedErrorMessage(error) })
        logMessage(`${errorContext}: ${error.message}`, 'error')
    } finally {
        // A newer request may have taken the slot in the meantime, and it must
        // not be dropped by the one that is ending now.
        if (pendingRequests.get(tabId) === pendingRequest) {
            pendingRequests.delete(tabId)
        }
    }
}

/**
 * Returns a user-facing, localized error message for a given error.
 *
 * If the error is an AbortError (raised when a fetch request exceeds the
 * configured timeout), a localized timeout message is returned instead of
 * the browser's generic, non-localized default.
 * For all other errors the original message is returned unchanged.
 *
 * @param error - The caught error object.
 * @returns The localized error message string.
 */
function getLocalizedErrorMessage(error: any): string {
    if (error?.name === 'AbortError') {
        return messenger.i18n.getMessage('errorServiceTimeout')
    }

    return error.message
}