createPromptDisplay()

function createPromptDisplay(): void {

    // Avoid creating the element if it already exists
    if(document.querySelector('#amsOuterRequest')) {
        return
    }

    // Main container for the request
    const amsOuterRequest: HTMLDivElement = document.createElement('div')
    amsOuterRequest.id = 'amsOuterRequest'

    // Uses a shadow DOM to handle all Requests, isolating it from styles
    // and any form of interaction present in the email client.
    const shadowRoot = amsOuterRequest.attachShadow({ mode: 'open' })

    // Inner container for the request
    const amsInnerRequest: HTMLDivElement = document.createElement('div')
    amsInnerRequest.id = 'amsInnerRequest'
    shadowRoot.appendChild(amsInnerRequest)

    // Add the CSS file to the shadow root
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = browser.runtime.getURL('/promptDisplay/promptDisplay.css')
    amsInnerRequest.appendChild(cssLink)

    // Contents -->
    const textarea = document.createElement('textarea')
    textarea.className = 'auto-resizing-textarea'
    textarea.placeholder = messenger.i18n.getMessage('promptDisplay.prompt.placeholder')
    textarea.rows = 1

    const sendButton = document.createElement('button')

    // Define the SVG send icon as a template literal string
    const svgIcon: string = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
    `
    sendButton.innerHTML = svgIcon

    amsInnerRequest.appendChild(textarea)
    amsInnerRequest.appendChild(sendButton)
    // <-- contents

    document.body.appendChild(amsOuterRequest)
}
