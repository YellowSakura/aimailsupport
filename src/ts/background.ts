import { ProviderFactory } from './llmProviders/providerFactory'
import { getConfig, getConfigs, getCurrentMessageContent, getLanguageNameFromCode, logMessage, sendMessageToActiveTab } from './helpers/utils'


// The array contains references to the menus of any custom languages selected
// by the user for which a translation is requested.
let translationMenuItemIds: (number | string)[] = null

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
const menuIdTranslateSeparator = browser.menus.create({
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
browser.menus.create({
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
messenger.menus.onClicked.addListener(async (info: browser.menus.OnClickData) => {
    const configs = await getConfigs()
    const llmProvider = ProviderFactory.getInstance(configs)

    if(info.menuItemId == menuIdAnalyzeIntent) {
        sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

        const intentAnalysisInput = info.selectionText ?? await getCurrentMessageContent()

        if (intentAnalysisInput == null) {
            sendMessageToActiveTab({ type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound') })
        } else {
            llmProvider.analyzeTextIntent(intentAnalysisInput).then(intentAnalysisResult => {
                    sendMessageToActiveTab({ type: 'addText', content: intentAnalysisResult })
            })
            .catch(error => {
                sendMessageToActiveTab({ type: 'showError', content: error.message })
                logMessage(`Error during intent analysis: ${error.message}`, 'error')
            })
        }
    }
    else if(info.menuItemId == menuIdExplain) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToExplain = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textToExplain == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            llmProvider.explainText(textToExplain).then(textExplained => {
                sendMessageToActiveTab({type: 'addText', content: textExplained})
            }).catch(error => {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during explanation: ${error.message}`, 'error')
            })
        }
    }
    else if(info.menuItemId == menuIdSummarize) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToSummarize = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textToSummarize == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            llmProvider.summarizeText(textToSummarize).then(textSummarized => {
                sendMessageToActiveTab({type: 'addText', content: textSummarized})
            }).catch(error => {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during summarization: ${error.message}`, 'error')
            })
        }
    }
    else if([menuIdRephraseStandard, menuIdRephraseFluid, menuIdRephraseCreative, menuIdRephraseSimple,
            menuIdRephraseFormal, menuIdRephraseAcademic, menuIdRephraseExpanded, menuIdRephraseShortened,
            menuIdRephrasePolite].includes(info.menuItemId)) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToRephrase = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textToRephrase == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            // Extracts the tone of voice from the menuItemId by taking a substring
            // starting from the 10th character.
            // The value 10 corresponds to the length of the string 'aiRephrase',
            // allowing the code to retrieve the portion of the menuItemId that
            // follows 'aiRephrase'.
            const toneOfVoice = (info.menuItemId as string).substring(10).toLowerCase()

            llmProvider.rephraseText(textToRephrase, toneOfVoice).then(textRephrased => {
                sendMessageToActiveTab({type: 'addText', content: textRephrased})
            }).catch(error => {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during rephrasing: ${error.message}`, 'error')
            })
        }
    }
    else if([menuIdSuggestReplyStandard, menuIdSuggestReplyFluid, menuIdSuggestReplyCreative, menuIdSuggestReplySimple,
            menuIdSuggestReplyFormal, menuIdSuggestReplyAcademic, menuIdSuggestReplyExpanded, menuIdSuggestReplyShortened,
            menuIdSuggestReplyPolite].includes(info.menuItemId)) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textForSuggestion = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textForSuggestion == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            // Extracts the tone of voice from the menuItemId by taking a substring
            // starting from the 14th character.
            // The value 14 corresponds to the length of the string 'aiSuggestReply',
            // allowing the code to retrieve the portion of the menuItemId that
            // follows 'aiRephrase'.
            const toneOfVoice = (info.menuItemId as string).substring(14).toLowerCase()

            llmProvider.suggestReplyFromText(textForSuggestion, toneOfVoice).then(textSuggested => {
                sendMessageToActiveTab({type: 'addText', content: textSuggested})
            }).catch(error => {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during reply generation: ${error.message}`, 'error')
            })
        }
    }
    else if(info.menuItemId == menuIdSummarizeAndText2Speech) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToTranslateAndText2Speech = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textToTranslateAndText2Speech == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            try {
                const textSummarized = await llmProvider.summarizeText(textToTranslateAndText2Speech)
                const blob = await llmProvider.getSpeechFromText(textSummarized)

                sendMessageToActiveTab({type: 'addAudio', content: blob})
            } catch (error) {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during summarization and text-to-speech: ${error.message}`, 'error')
            }
        }
    }
    else if(info.menuItemId == menuIdText2Speech) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToPlay = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textToPlay == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            llmProvider.getSpeechFromText(textToPlay).then(blob => {
                sendMessageToActiveTab({type: 'addAudio', content: blob})
            }).catch(error => {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during text-to-speech conversion: ${error.message}`, 'error')
            })
        }
    }
    else if(info.menuItemId == menuIdTranslate || translationMenuItemIds?.includes(info.menuItemId)) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToTranslate = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textToTranslate == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            let languageCode = null

            // The language code is retrieved when selected from a menu item that
            // propagates the specific code in its ID.
            const prefix = 'aiTranslateTo_'
            if ((info.menuItemId as string).startsWith(prefix)) {
                languageCode = (info.menuItemId as string).slice(prefix.length)
            }

            llmProvider.translateText(textToTranslate, languageCode).then(textTranslated => {
                sendMessageToActiveTab({type: 'addText', content: textTranslated})
            }).catch(error => {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during translation: ${error.message}`, 'error')
            })
        }
    }
    else if(info.menuItemId == menuIdTranslateAndSummarize) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToTranslateAndSummarize = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textToTranslateAndSummarize == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            try {
                const textTranslated = await llmProvider.translateText(textToTranslateAndSummarize)
                const textTranslateAndSummarized = await llmProvider.summarizeText(textTranslated)

                sendMessageToActiveTab({type: 'addText', content: textTranslateAndSummarized})
            } catch (error) {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during translation and summarization: ${error.message}`, 'error')
            }
        }
    }
    else if(info.menuItemId == menuIdTranslateAndText2Speech) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToTranslateAndText2Speech = (info.selectionText) ? info.selectionText : await getCurrentMessageContent()

        if(textToTranslateAndText2Speech == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            try {
                const textTranslated = await llmProvider.translateText(textToTranslateAndText2Speech)
                const blob = await llmProvider.getSpeechFromText(textTranslated)

                sendMessageToActiveTab({type: 'addAudio', content: blob})
            } catch (error) {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during translation and text2Speech: ${error.message}`, 'error')
            }
        }
    }
    else if(info.menuItemId == menuIdModerate) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToModerate = await getCurrentMessageContent()

        if(textToModerate == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            llmProvider.moderateText(textToModerate).then(moderatedResponse => {
                sendMessageToActiveTab({type: 'addChart', content: moderatedResponse})
            }).catch(error => {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error during moderation: ${error.message}`, 'error')
            })
        }
    }
    else if(info.menuItemId == menuIdSuggestImprovements) {
        sendMessageToActiveTab({type: 'thinking', content: messenger.i18n.getMessage('thinking')})

        const textToImprove = await getCurrentMessageContent()

        if(textToImprove == null) {
            sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
        }
        else {
            llmProvider.suggestImprovementsForText(textToImprove).then(improvedText => {
                sendMessageToActiveTab({type: 'addText', content: improvedText})
            }).catch(error => {
                sendMessageToActiveTab({type: 'showError', content: error.message})
                logMessage(`Error while improving the text: ${error.message}`, 'error')
            })
        }
    }
    else if(info.menuItemId == menuIdCustomPrompt) {
        sendMessageToActiveTab({showPromptDisplay: true})
    }
    else if(info.menuItemId == menuIdOptions) {
        browser.runtime.openOptionsPage()
    }
    // Fallback message case, but only if the menu does not match any values to
    // ignore, e.g., options.
    else if (!['aiOptions'].includes(info.menuItemId as string)) {
        logMessage(`Invalid menu item selected: ${info.menuItemId}`, 'error')
    }
})

// Register a listener for the action sent from promptDisplay
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'sendUserPromptToBackground') {
    const configs = await getConfigs()
    const llmProvider = ProviderFactory.getInstance(configs)

    sendMessageToActiveTab({ type: 'thinking', content: messenger.i18n.getMessage('thinking') })

    const currentMessageContent = await getCurrentMessageContent()

    if(currentMessageContent == null) {
        sendMessageToActiveTab({type: 'showError', content: messenger.i18n.getMessage('errorTextNotFound')})
    }
    else {
        llmProvider.applyCustomPrompt(message.data.userPrompt, currentMessageContent).then(textProcessed => {
            sendMessageToActiveTab({type: 'addText', content: textProcessed})
        }).catch(error => {
            sendMessageToActiveTab({type: 'showError', content: error.message})
            logMessage(`Error during the custom prompt: ${error.message}`, 'error')
        })
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

// Listens for the message signaling the change in configurations to update the
// interface.
browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'optionsChanged') {
        updateMenuVisibility()
        updateMenuWithUserTranslationPreferences()
    }
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