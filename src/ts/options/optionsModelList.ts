// Shared code to manage the model list of every provider that is able to
// enumerate its own models through an API call.
//
// All these providers follow the same conventions in the options page, so the
// whole behaviour can be derived from the provider key alone, the same one
// used by the factory and by the configuration:
//
//   #{provider}                                 fieldset of the provider
//   #{provider}Model                            <select> of the models
//   #{provider}ListModel                        button that reloads them
//   .description.{provider}-error-api           API error message
//   .description.{provider}-warning-no-model    shown when no model is available
//
// The last two elements are optional: a provider gets the related message only
// when its partial declares it.
//
// The error message follows the markup as well. When the description carries a
// `data-l10n-ref` its localized text is kept, as it happens for the local
// services, whose failures only produce an opaque network error and whose text
// explains how to make the service reachable. When it's empty, instead, it's
// filled with the message of the caught error, as it happens for the remote
// services, whose errors are informative (invalid API key, rate limits, ...).

import { getConfig } from '../helpers/utils'
import { GroqProvider } from '../llmProviders/impl/groqProvider'
import { LmsProvider } from '../llmProviders/impl/lmsProvider'
import { OllamaProvider } from '../llmProviders/impl/ollamaProvider'
import { OpenRouterProvider } from '../llmProviders/impl/openRouterProvider'
import { VllmProvider } from '../llmProviders/impl/vllmProvider'

interface ModelListOptions {
    // Key of the provider, used to build the id and the classes of all the
    // involved elements.
    provider: string

    // Retrieves the available models, reading from the options page whatever
    // the service requires to answer (API key, service URL, ...).
    fetchModels: () => Promise<string[]>
}

// Groq Cloud
setupModelList({
    provider: 'groq',
    fetchModels: () => GroqProvider.getModels(inputValue('#groqApiKey'))
})

// LM Studio
setupModelList({
    provider: 'lms',
    fetchModels: () => LmsProvider.getModels(inputValue('#lmsServiceUrl'))
})

// Ollama
setupModelList({
    provider: 'ollama',
    fetchModels: () => OllamaProvider.getModels(inputValue('#ollamaServiceUrl'))
})

// OpenRouter
setupModelList({
    provider: 'openrouter',
    fetchModels: () => OpenRouterProvider.getModels(inputValue('#openrouterApiKey'))
})

// vLLM
setupModelList({
    provider: 'vllm',
    fetchModels: () => VllmProvider.getModels(inputValue('#vllmServiceUrl'), inputValue('#vllmApiKey'))
})

/**
 * Retrieves the current value of an input of the options page.
 *
 * @param selector - CSS selector of the input.
 *
 * @returns The value of the input.
 */
function inputValue(selector: string): string {
    return document.querySelector<HTMLInputElement>(selector).value
}

/**
 * Registers all the events that trigger the loading of the models of a
 * provider: the initial load, performed only when it's the currently used one,
 * the change of the LLM provider and the click on its "list models" button.
 *
 * @param options - Configuration of the provider.
 */
function setupModelList(options: ModelListOptions): void {
    // Check if the currently used LLM provider is this one, and if so, load
    // the available models.
    getConfig('llmProvider').then(llmProvider => {
        if (llmProvider == options.provider) {
            loadModels(options)
        }
    })

    // The LLM provider change event is handled to reload all the available
    // models.
    document.querySelector('#llmProvider')?.addEventListener('change', (event) => {
        const selectedValue = (event.target as HTMLSelectElement).value

        if (selectedValue == options.provider) {
            loadModels(options)
        }
    })

    // Adds a click event listener for loading all the available models
    document.querySelector(`#${options.provider}ListModel`)?.addEventListener('click', async _ => {
        loadModels(options)
    })
}

/**
 * Replaces the content of the model list of a provider with the models it
 * currently exposes, restoring the previous selection and reporting the
 * possible errors.
 *
 * @param options - Configuration of the provider.
 */
async function loadModels({ provider, fetchModels }: ModelListOptions): Promise<void> {
    const selectModel = document.querySelector<HTMLSelectElement>(`#${provider}Model`)
    const errorApi = document.querySelector<HTMLElement>(`#${provider} .description.${provider}-error-api`)
    const warningNoModel = document.querySelector(`#${provider} .description.${provider}-warning-no-model`)

    // The last selected model or the one previously saved in the options
    // is retrieved, and then all models are removed from the list to
    // ensure that the newly read models completely replace the old list.
    const selectedValue = selectModel.value || (await getConfig(provider))?.model
    selectModel.innerHTML = ''

    // Removal of any previously displayed API error message, and of the
    // message stating that the service exposes no model at all.
    errorApi?.classList.remove('show')
    warningNoModel?.classList.remove('show')

    try {
        const models = await fetchModels()

        // A specific message is displayed to indicate that no model was found
        // in the service, when its partial provides one.
        if (models.length == 0 && warningNoModel) {
            warningNoModel.classList.add('show')
            return
        }

        // Sort the array
        models.sort((a, b) => a.localeCompare(b))

        // Add the newly retrieved models
        models.forEach(model => {
            const option = document.createElement('option')
            option.textContent = model
            option.value = model

            // Restore the previously selected model (if any)
            if (selectedValue && model == selectedValue) {
                option.selected = true
            }

            selectModel.appendChild(option)
        })
    }
    // Error handling: for the local services the possible cases could be
    // related to the fact that the service is not running, making the APIs
    // unavailable, or that CORS has not been enabled on these APIs, resulting
    // in an "Access-Control-Allow-Origin" error, see:
    //
    //   1. https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama
    //   2. https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server
    //
    // So for example in a macOS environment, the following command should be
    // executed:
    // launchctl setenv OLLAMA_ORIGINS "moz-extension://*"
    catch (error: any) {
        errorApi?.classList.add('show')

        // The description is filled with the error only when it has no
        // localized text of its own to show.
        if (errorApi && !errorApi.dataset.l10nRef) {
            errorApi.innerHTML = error.message
        }
    }
}
