import { ChartUtils } from './helpers/chartUtils'
import removeMarkdown from 'remove-markdown'

// Manage async messages -->
(async () => {
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

                case 'showError':
                    showError(message.content)
                    break

                case 'thinking':
                    thinking(message.content)
                    break
            }
        }
    })
})()
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

function addText(newContent: string) {
    clearOutputDisplay()

    // Any Markdown present is converted to plain text
    const rawText = removeMarkdown(newContent)
    getInnerResponse().querySelector('#amsContent').textContent = rawText
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

    const content: HTMLSpanElement = document.createElement('div')
    content.id = 'amsContent'
    amsInnerResponse.appendChild(content)

    const closeIcon: HTMLSpanElement = document.createElement('span')
    closeIcon.className = 'close-icon'
    closeIcon.innerHTML = '&times;'
    closeIcon.addEventListener('click', () => clearOutputDisplay(true))
    amsInnerResponse.appendChild(closeIcon)
    // <-- contents

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

    getInnerResponse().classList.remove('error')
    getInnerResponse().classList.remove('thinking')
    getInnerResponse().querySelector('#amsContent').innerHTML = ''
}