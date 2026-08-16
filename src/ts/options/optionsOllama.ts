// Specific code to manage options for Ollama

import { getConfig } from '../helpers/utils'
import { OllamaProvider } from '../llmProviders/impl/ollamaProvider'

// Check if the currently used LLM provider is Ollama, and if so, load the
// available local models.
if((await getConfig('llmProvider')) == 'ollama') {
    getOllamaLocalModels()
}

// The LLM provider change event is handled to reload all available Ollama
// local models.
document.querySelector('#llmProvider')?.addEventListener('change', (event) => {
    const selectedValue = (event.target as HTMLSelectElement).value

    if(selectedValue == 'ollama') {
        getOllamaLocalModels()
    }
})

// Adds a click event listener for loading all available Ollama local models
document.querySelector('#ollamaListModel')?.addEventListener('click', async _ => {
    getOllamaLocalModels()
})

async function getOllamaLocalModels() {
    const selectOllamaModel = document.querySelector<HTMLSelectElement>('#ollamaModel')

    // The last selected model or the one previously saved in the options
    // is retrieved, and then all models are removed from the list to
    // ensure that the newly read models completely replace the old list.
    const selectedValue = selectOllamaModel.value || (await getConfig('ollama'))?.model
    selectOllamaModel.innerHTML = ''

    // Removal of any previously displayed API error message
    document.querySelector('#ollama .description.ollama-error-api').classList.remove('show')

    // Removal of any previously displayed message to indicate that
    // no model was found in Ollama.
    document.querySelector('#ollama .description.ollama-warning-no-model').classList.remove('show')

    try {
        const ollamaLocalModels = await OllamaProvider.getModels(document.querySelector<HTMLSelectElement>('#ollamaServiceUrl').value)

        if (ollamaLocalModels.length != 0) {
            // Sort the array
            ollamaLocalModels.sort((a, b) => a.localeCompare(b))

            // Add the newly retrieved models
            ollamaLocalModels.forEach(model => {
                const option = document.createElement('option')
                option.textContent = model
                option.value = model

                // Restore the previously selected model (if any)
                if (selectedValue && model == selectedValue) {
                    option.selected = true
                }

                selectOllamaModel.appendChild(option)
            })
        }
        else {
            // A specific message is displayed to indicate that no model
            // was found in Ollama.
            document.querySelector('#ollama .description.ollama-warning-no-model').classList.add('show')
        }
    }
    // Error handling: possible cases could be related to the fact that
    // Ollama is not running, making the APIs unavailable, or that CORS
    // has not been enabled on these APIs, resulting in an:
    // "Access-Control-Allow-Origin" error, see:
    //
    //   1. https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama
    //   2. https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server
    //
    // So for exmaple in a macOS environment, the following command
    // should be executed:
    // launchctl setenv OLLAMA_ORIGINS "moz-extension://*"
    catch (error) {
        document.querySelector('#ollama .description.ollama-error-api').classList.add('show')
    }
}
