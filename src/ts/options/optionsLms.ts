// Specific code to manage options for LM Studio

import { getConfig } from '../helpers/utils'
import { LmsProvider } from '../llmProviders/impl/lmsProvider'

// Check if the currently used LLM provider is LM Studio, and if so, load the
// available local models.
if((await getConfig('llmProvider')) == 'lms') {
    getLmsLocalModels()
}

// The LLM provider change event is handled to reload all available LM Studio
// local models.
document.querySelector('#llmProvider')?.addEventListener('change', (event) => {
    const selectedValue = (event.target as HTMLSelectElement).value

    if(selectedValue == 'lms') {
        getLmsLocalModels()
    }
})

// Adds a click event listener for loading all available LM Studio local models
document.querySelector('#lmsListModel')?.addEventListener('click', async _ => {
    getLmsLocalModels()
})

async function getLmsLocalModels() {
    const selectLmsModel = document.querySelector<HTMLSelectElement>('#lmsModel')

    // The last selected model or the one previously saved in the options
    // is retrieved, and then all models are removed from the list to
    // ensure that the newly read models completely replace the old list.
    const selectedValue = selectLmsModel.value || (await getConfig('lms'))?.model
    selectLmsModel.innerHTML = ''

    // Removal of any previously displayed API error message
    document.querySelector('#lms .description.lms-error-api').classList.remove('show')

    // Removal of any previously displayed message to indicate that
    // no model was found in LM Studio.
    document.querySelector('#lms .description.lms-warning-no-model').classList.remove('show')

    try {
        const lmsLocalModels = await LmsProvider.getModels(document.querySelector<HTMLSelectElement>('#lmsServiceUrl').value)

        if (lmsLocalModels.length != 0) {
            // Sort the array
            lmsLocalModels.sort((a, b) => a.localeCompare(b))

            // Add the newly retrieved models
            lmsLocalModels.forEach(model => {
                const option = document.createElement('option')
                option.textContent = model
                option.value = model

                // Restore the previously selected model (if any)
                if (selectedValue && model == selectedValue) {
                    option.selected = true
                }

                selectLmsModel.appendChild(option)
            })
        }
        else {
            // A specific message is displayed to indicate that no model
            // was found in LM Studio.
            document.querySelector('#lms .description.lms-warning-no-model').classList.add('show')
        }
    }
    // Error handling: possible cases could be related to the fact that
    // LM Studio is not running, making the APIs unavailable, or that CORS
    // has not been enabled on these APIs, resulting in an:
    // "Access-Control-Allow-Origin" error.
    catch (error) {
        document.querySelector('#lms .description.lms-error-api').classList.add('show')
    }
}
