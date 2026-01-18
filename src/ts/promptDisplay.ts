// Manage async messages -->
browser.runtime.onMessage.addListener(async (message: any) => {
    if (message?.showPromptDisplay === true) {
        createRequestDisplay()
    }
})
// <-- manage async messages

// Support function to create the container where the user will be able to enter
// their own custom prompt as a request.
function createRequestDisplay(): void {

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
    textarea.placeholder = messenger.i18n.getMessage('promptDisplay.placeholder')
    textarea.rows = 1
    amsInnerRequest.appendChild(textarea)

    const sendButton = document.createElement('button')
    // Define the SVG send icon as a template literal string
    sendButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>`
    sendButton.addEventListener('click', () => {
        if(textarea.value.trim() === '') {
            return
        }

        // Send the user prompt to the background script, which will handle it appropriately
        browser.runtime.sendMessage({
            action: 'sendUserPromptToBackground',
            data: { userPrompt: textarea.value }
        })
    })
    amsInnerRequest.appendChild(sendButton)

    const closeIcon: HTMLSpanElement = document.createElement('span')
    closeIcon.className = 'close-icon'
    closeIcon.innerHTML = '&times;'
    closeIcon.addEventListener('click', () => {
        document.querySelector('#amsOuterRequest').remove()
    })
    amsInnerRequest.appendChild(closeIcon)
    // <-- contents

    // Handle input event for both auto-resizing the textarea and enabling the button
    textarea.addEventListener('input', () => {
        // Reset height to 'auto' to let the browser calculate the natural height
        textarea.style.height = 'auto'

        // Toggle button state based on content presence, and set the correct height
        // for the main textarea.
        if (textarea.value.trim() !== '') {
            sendButton.classList.add('active')
            textarea.style.height = `${textarea.scrollHeight}px`
        } else {
            sendButton.classList.remove('active')
        }
    })

    document.body.appendChild(amsOuterRequest)
}