import { ChartUtils } from './helpers/chartUtils'
import { logMessage } from './helpers/utils'
import { marked } from 'marked'

/**
 * Holds the raw markdown of the last AI response displayed in this document,
 * as received from the provider and before being rendered to HTML.
 * It is used as the input whenever the user asks to refine a response already
 * received.
 */
let lastAiResponseText = ''

// Manage async messages -->
browser.runtime.onMessage.addListener(async (message: any) => {
    if (message?.type) {
        createOutputDisplay()

        switch (message.type) {
            case 'addAudio':
                addAudio(message.content)
                break

            case 'addChart':
                addChart(message.content)
                break

            case 'addText':
                addText(message.content)
                break

            case 'setComposeMode':
                const actionsContainer = getInnerResponse().querySelector('#actionsContainer')
                if (message.isCompose) {
                    actionsContainer.classList.add('compose-mode')
                } else {
                    actionsContainer.classList.remove('compose-mode')
                }
                break

            case 'showError':
                showError(message.content)
                break

            case 'thinking':
                thinking(message.content)
                break
        }
    }
})
// <-- manage async messages

function addAudio(blob: Blob) {
    clearOutputDisplay()

    const reader = new FileReader()
    reader.onload = () => {
        const base64Data = reader.result as string

        const audioElement = document.createElement('audio')
        audioElement.src = base64Data
        audioElement.autoplay = true
        audioElement.controls = true

        getInnerResponse().querySelector('#amsContent').appendChild(audioElement)
    }

    reader.readAsDataURL(blob)
}

function addChart(chart: { [key: string]: number }) {
    clearOutputDisplay()

    const chartUtils = new ChartUtils()
    getInnerResponse().querySelector('#amsContent').append(chartUtils.createBarChart(chart, 50))
}

// Support function to get the inner response node inside the shadow
// DOM.
function getInnerResponse() {
    return document.querySelector('#amsOuterResponse')?.shadowRoot?.querySelector('#amsInnerResponse')
}

async function addText(newContent: string) {
    clearOutputDisplay()

    // Store the last response for any subsequent refinement
    lastAiResponseText = newContent

    getInnerResponse().classList.add('text-content')

    const htmlContent = await marked.parse(newContent)
    getInnerResponse().querySelector('#amsContent').innerHTML = htmlContent
}

function showError(newContent: string) {
    clearOutputDisplay()

    getInnerResponse().classList.add('error')
    getInnerResponse().querySelector('#amsContent').textContent = newContent
}

function thinking(thinkingText: string) {
    clearOutputDisplay()

    getInnerResponse().classList.add('thinking')
    getInnerResponse().querySelector('#amsContent').innerHTML = `${thinkingText}<span class="dots"></span>`
}

// Support function to create the container where various details
// populated by AI systems will be inserted.
function createOutputDisplay(): void {

    // Avoid creating the element if it already exists
    if(document.querySelector('#amsOuterResponse')) {
        return
    }

    // Main container for the AI model response
    const amsOuterResponse: HTMLDivElement = document.createElement('div')
    amsOuterResponse.id = 'amsOuterResponse'

    // Uses a shadow DOM to handle all responses, isolating it from styles
    // and any form of interaction present in the email client.
    const shadowRoot = amsOuterResponse.attachShadow({ mode: 'open' })

    // Inner container for the AI model response
    const amsInnerResponse: HTMLDivElement = document.createElement('div')
    amsInnerResponse.id = 'amsInnerResponse'
    shadowRoot.appendChild(amsInnerResponse)

    // Add the CSS file to the shadow root
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = browser.runtime.getURL('/outputDisplay/outputDisplay.css')
    amsInnerResponse.appendChild(cssLink)

    // Contents -->
    const image: HTMLImageElement = document.createElement('img')
    image.id = 'amsImage'
    image.src = browser.runtime.getURL('/images/bot-icon-color-64.webp')
    amsInnerResponse.appendChild(image)

    const content: HTMLDivElement = document.createElement('div')
    content.id = 'amsContent'
    amsInnerResponse.appendChild(content)

    // Close icon
    const closeIcon: HTMLSpanElement = document.createElement('span')
    closeIcon.className = 'close-icon'
    closeIcon.innerHTML = '&times;'
    closeIcon.addEventListener('click', () => clearOutputDisplay(true))
    amsInnerResponse.appendChild(closeIcon)

    // Actions container -->
    const actionsContainer: HTMLDivElement = document.createElement('div')
    actionsContainer.id = 'actionsContainer'

    // Copy in clipboard icon
    const copyClipboardIcon: HTMLSpanElement = document.createElement('span')
    copyClipboardIcon.className = 'copy-clipboard-icon'
    copyClipboardIcon.title = messenger.i18n.getMessage('outputDisplay.title.copyClipboard')
    copyClipboardIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m0 4h8m-8 4h6m-6 4h6"/>
            <path d="M12 2v4"/>
            <path d="M8 6h8"/>
        </svg>
    `
    copyClipboardIcon.addEventListener('click', copyClipboard)
    actionsContainer.appendChild(copyClipboardIcon)

    // Copy top icon
    const copyTopIcon: HTMLSpanElement = document.createElement('span')
    copyTopIcon.className = 'copy-top-icon'
    copyTopIcon.title = messenger.i18n.getMessage('outputDisplay.title.copyTop')
    copyTopIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V6"/>
            <path d="M5 12l7-7 7 7"/>
            <path d="M19 21H5"/>
        </svg>
    `
    copyTopIcon.addEventListener('click', copyToEmailTop)
    actionsContainer.appendChild(copyTopIcon)

    // Refine icon
    const refineIcon: HTMLSpanElement = document.createElement('span')
    refineIcon.className = 'refine-icon'
    refineIcon.title = messenger.i18n.getMessage('outputDisplay.title.refine')
    refineIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    `
    refineIcon.addEventListener('click', () => toggleRefineInput(amsInnerResponse))
    actionsContainer.appendChild(refineIcon)
    // <-- refine icon

    // Footer: groups action icons and refine input -->
    const amsFooter: HTMLDivElement = document.createElement('div')
    amsFooter.id = 'amsFooter'

    amsFooter.appendChild(actionsContainer)

    // Refine input area (hidden by default) -->
    const refineContainer: HTMLDivElement = document.createElement('div')
    refineContainer.id = 'refineContainer'

    const refineTextarea: HTMLTextAreaElement = document.createElement('textarea')
    refineTextarea.id = 'refineTextarea'
    refineTextarea.rows = 1
    refineTextarea.placeholder = messenger.i18n.getMessage('outputDisplay.refine.placeholder')
    refineTextarea.addEventListener('input', () => {
        refineTextarea.style.height = 'auto'
        refineTextarea.style.height = `${refineTextarea.scrollHeight}px`
        refineSendBtn.classList.toggle('active', refineTextarea.value.trim() !== '')
    })
    refineTextarea.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submitRefinement(refineTextarea, refineContainer)
        }
    })
    refineContainer.appendChild(refineTextarea)

    const refineSendBtn: HTMLButtonElement = document.createElement('button')
    refineSendBtn.className = 'refine-send'
    refineSendBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`
    refineSendBtn.addEventListener('click', () => submitRefinement(refineTextarea, refineContainer))
    refineContainer.appendChild(refineSendBtn)
    // <-- refine input area

    amsFooter.appendChild(refineContainer)
    amsInnerResponse.appendChild(amsFooter)
    // <-- footer

    document.body.appendChild(amsOuterResponse)
}

/**
 * Clears the container used for displaying AI model responses between user
 * requests.
 *
 * @param destroy - A boolean flag indicating whether to destroy the container.
 *        The default value is false.
 */
function clearOutputDisplay(destroy: boolean = false): void {
    if(destroy) {
        document.querySelector('#amsOuterResponse').remove()
        return
    }

    // Ensure the component is visible
    if(!document.querySelector('#amsOuterResponse').classList.contains('show')) {
        document.querySelector('#amsOuterResponse').classList.add('show')
    }

    getInnerResponse().classList.remove('error', 'text-content', 'thinking')
    getInnerResponse().querySelector('#amsContent').innerHTML = ''
}

/**
 * Copies the textual content to the system clipboard.
 */
function copyClipboard(): void {
    const contentElement = getInnerResponse().querySelector('#amsContent')

    // Create a temporary selection range
    const selection = globalThis.getSelection()
    const range = document.createRange()
    range.selectNodeContents(contentElement)

    // Replace any existing selection
    selection.removeAllRanges()
    selection.addRange(range)

    try {
        document.execCommand('copy')
    } catch {
        logMessage('Copy to clipboard failed or was blocked', 'error')
    } finally {
        selection.removeAllRanges()
    }
}

/**
 * Inserts the LLM response content at the top of the compose email body.
 * This function is only available when in compose mode.
 */
function copyToEmailTop(): void {
    const contentElement = getInnerResponse().querySelector('#amsContent') as HTMLElement | null
    const htmlToCopy: string = contentElement?.innerHTML?.trim() || ''

    if (htmlToCopy) {
        try {
            // Get the current content of the email body
            const emailBody: HTMLElement | null = document.querySelector('body')
            if (emailBody) {
                // Create a new paragraph with the AI-generated content
                const aiContent: HTMLDivElement = document.createElement('div')
                aiContent.innerHTML = htmlToCopy

                // Insert at the beginning of the email body
                emailBody.insertBefore(aiContent, emailBody.firstChild)

                // Scroll the email back to the very top, since the user may be
                // composing further down.
                globalThis.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } catch (error) {
            if (error instanceof Error) {
                logMessage(`Error copying to email top: ${error.message}`, 'error')
            } else {
                logMessage('Unknown error copying to email top', 'error')
            }
        }
    }
}

/**
 * Shows or hides the input area used to ask for a refinement, moving the focus
 * to the textarea as soon as it becomes visible.
 *
 * @param amsInnerResponse - The inner response node hosting the refine input.
 */
function toggleRefineInput(amsInnerResponse: HTMLDivElement): void {
    const container = amsInnerResponse.querySelector('#refineContainer') as HTMLDivElement
    const isVisible = container.classList.toggle('show')
    if (isVisible) {
        (amsInnerResponse.querySelector('#refineTextarea') as HTMLTextAreaElement).focus()
    }
}

/**
 * Sends a refinement request to the background script, pairing the prompt typed
 * by the user with the last AI response, which is the text to be reworked.
 *
 * Nothing is sent when the prompt is empty or when no response has been
 * received yet. The input area is emptied and closed right away, while the new
 * response arrives asynchronously and replaces the current one.
 *
 * @param textarea - The textarea holding the refinement prompt.
 * @param container - The input area to be reset and hidden after sending.
 */
function submitRefinement(textarea: HTMLTextAreaElement, container: HTMLDivElement): void {
    const prompt = textarea.value.trim()
    if (!prompt || !lastAiResponseText) return

    browser.runtime.sendMessage({
        type: 'refineLastResponse',
        refinementPrompt: prompt,
        lastResponse: lastAiResponseText
    }).catch((error: Error) => {
        logMessage(`Error sending refinement: ${error.message}`, 'error')
    })

    textarea.value = ''
    textarea.style.height = 'auto'
    container.classList.remove('show')
}