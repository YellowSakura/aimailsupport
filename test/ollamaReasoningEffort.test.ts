import { ConfigType } from '../src/ts/helpers/configType'
import { OllamaProvider } from '../src/ts/llmProviders/impl/ollamaProvider'

import 'jest-webextension-mock'

function createConfig(reasoningEffort: ConfigType['ollama']['reasoningEffort']): ConfigType {
    return {
        mainUserLanguageCode: 'en',
        temperature: 0,
        servicesTimeout: 10,
        streamResponses: false,
        debugMode: false,
        maskPii: false,
        ollama: {
            serviceUrl: 'http://localhost:11434',
            model: 'example-model',
            reasoningEffort
        }
    } as ConfigType
}

function mockCompletion(): jest.MockedFunction<typeof fetch> {
    const fetchMock = jest.fn().mockResolvedValue(new Response(JSON.stringify({
        choices: [{ message: { content: 'translated text' } }]
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    })) as jest.MockedFunction<typeof fetch>

    globalThis.fetch = fetchMock
    return fetchMock
}

function requestBody(fetchMock: jest.MockedFunction<typeof fetch>): Record<string, unknown> {
    const options = fetchMock.mock.calls[0][1] as RequestInit
    return JSON.parse(options.body as string)
}

describe('OllamaProvider reasoning effort', () => {
    test('sends the selected reasoning effort', async () => {
        const fetchMock = mockCompletion()
        const provider = new OllamaProvider(createConfig('none'))

        await provider.translateText('Beispiel')

        expect(requestBody(fetchMock).reasoning_effort).toBe('none')
    })

    test('omits reasoning effort when model default is selected', async () => {
        const fetchMock = mockCompletion()
        const provider = new OllamaProvider(createConfig('default'))

        await provider.translateText('Beispiel')

        expect(requestBody(fetchMock)).not.toHaveProperty('reasoning_effort')
    })
})
