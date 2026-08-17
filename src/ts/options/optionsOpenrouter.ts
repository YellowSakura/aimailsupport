// Specific code to manage options for OpenRouter

import { getConfig } from '../helpers/utils'
import { OpenRouterProvider } from '../llmProviders/impl/openrouterProvider'

// Check if the currently used LLM provider is OpenRouter, and if so, load the
// available models.
if((await getConfig('llmProvider')) == 'openrouter') {
    getOpenrouterModels()
}

// The LLM provider change event is handled to reload all available OpenRouter
// models.
document.querySelector('#llmProvider')?.addEventListener('change', (event) => {
    const selectedValue = (event.target as HTMLSelectElement).value

    if(selectedValue == 'openrouter') {
        getOpenrouterModels()
    }
})

// Adds a click event listener for loading all available OpenRouter models
document.querySelector('#openrouterListModel')?.addEventListener('click', async _ => {
    getOpenrouterModels()
})

async function getOpenrouterModels() {
    const selectOpenrouterModel = document.querySelector<HTMLSelectElement>('#openrouterModel')

    // The last selected model or the one previously saved in the options
    // is retrieved, and then all models are removed from the list to
    // ensure that the newly read models completely replace the old list.
    const selectedValue = selectOpenrouterModel.value || (await getConfig('openrouter'))?.model
    selectOpenrouterModel.innerHTML = ''

    // Removal of any previously displayed API error message
    document.querySelector('#openrouter .description.openrouter-error-api').classList.remove('show')

    try {
        const openrouterModels = await OpenRouterProvider.getModels(document.querySelector<HTMLSelectElement>('#openrouterApiKey').value)

        // Sort the array
        openrouterModels.sort((a, b) => a.localeCompare(b))

        // Add the newly retrieved models
        openrouterModels.forEach(model => {
            const option = document.createElement('option')
            option.textContent = model
            option.value = model

            // Restore the previously selected model (if any)
            if (selectedValue && model == selectedValue) {
                option.selected = true
            }

            selectOpenrouterModel.appendChild(option)
        })
    }
    catch (error) {
        document.querySelector('#openrouter .description.openrouter-error-api').classList.add('show')
        document.querySelector('#openrouter .description.openrouter-error-api').innerHTML = error.message
    }
}
