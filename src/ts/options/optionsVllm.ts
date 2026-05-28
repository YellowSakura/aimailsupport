// Specific code to manage options for vLLM

import { getConfig } from '../helpers/utils'
import { VllmProvider } from '../llmProviders/impl/vllmProvider'

// Check if the currently used LLM provider is vLLM, and if so, load the
// available models from the server.
if((await getConfig('llmProvider')) == 'vllm') {
    getVllmModels()
}

// The LLM provider change event is handled to reload all available vLLM models.
document.querySelector('#llmProvider').addEventListener('change', (event) => {
    const selectedValue = (event.target as HTMLSelectElement).value

    if(selectedValue == 'vllm') {
        getVllmModels()
    }
})

// Adds a click event listener for loading all available vLLM models
document.querySelector('#vllmListModel').addEventListener('click', async _ => {
    getVllmModels()
})

async function getVllmModels() {
    const selectVllmModel = document.querySelector<HTMLSelectElement>('#vllmModel')

    const selectedValue = selectVllmModel.value || (await getConfig('vllm'))?.model
    selectVllmModel.innerHTML = ''

    document.querySelector('#vllm .description.vllm-error-api').classList.remove('show')
    document.querySelector('#vllm .description.vllm-warning-no-model').classList.remove('show')

    try {
        const serviceUrl = document.querySelector<HTMLInputElement>('#vllmServiceUrl').value
        const apiKey = document.querySelector<HTMLInputElement>('#vllmApiKey').value
        const models = await VllmProvider.getModels(serviceUrl, apiKey)

        if (models.length !== 0) {
            models.sort((a, b) => a.localeCompare(b))

            models.forEach(model => {
                const option = document.createElement('option')
                option.textContent = model
                option.value = model

                if (selectedValue && model === selectedValue) {
                    option.selected = true
                }

                selectVllmModel.appendChild(option)
            })
        }
        else {
            document.querySelector('#vllm .description.vllm-warning-no-model').classList.add('show')
        }
    }
    catch {
        document.querySelector('#vllm .description.vllm-error-api').classList.add('show')
    }
}
