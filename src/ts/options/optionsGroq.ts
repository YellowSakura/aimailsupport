// Specific code to manage options for Groq Cloud

import { getConfig } from '../helpers/utils'
import { GroqProvider } from '../llmProviders/impl/groqProvider'

// Check if the currently used LLM provider is Groq, and if so, load the
// available local models.
if((await getConfig('llmProvider')) == 'groq') {
    getGroqModels()
}

// The LLM provider change event is handled to reload all available Groq
// Cloud models.
document.querySelector('#llmProvider')?.addEventListener('change', (event) => {
    const selectedValue = (event.target as HTMLSelectElement).value

    if(selectedValue == 'groq') {
        getGroqModels()
    }
})

// Adds a click event listener for loading all available Groq Cloud models
document.querySelector('#groqListModel')?.addEventListener('click', async _ => {
    getGroqModels()
})

async function getGroqModels() {
    const selectGroqModel = document.querySelector<HTMLSelectElement>('#groqModel')

    // The last selected model or the one previously saved in the options
    // is retrieved, and then all models are removed from the list to
    // ensure that the newly read models completely replace the old list.
    const selectedValue = selectGroqModel.value || (await getConfig('groq'))?.model
    selectGroqModel.innerHTML = ''

    // Removal of any previously displayed API error message
    document.querySelector('#groq .description.groq-error-api').classList.remove('show')

    try {
        const groqLocalModels = await GroqProvider.getModels(document.querySelector<HTMLSelectElement>('#groqApiKey').value)

        // Sort the array
        groqLocalModels.sort((a, b) => a.localeCompare(b))

        // Add the newly retrieved models
        groqLocalModels.forEach(model => {
            const option = document.createElement('option')
            option.textContent = model
            option.value = model

            // Restore the previously selected model (if any)
            if (selectedValue && model == selectedValue) {
                option.selected = true
            }

            selectGroqModel.appendChild(option)
        })
    }
    catch (error) {
        document.querySelector('#groq .description.groq-error-api').classList.add('show')
        document.querySelector('#groq .description.groq-error-api').innerHTML = error.message
    }
}
