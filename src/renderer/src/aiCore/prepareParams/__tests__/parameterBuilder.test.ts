import { beforeEach, describe, expect, it, vi } from 'vitest'

const { stepCountIsMock } = vi.hoisted(() => ({
  stepCountIsMock: vi.fn(() => ({}) as any)
}))

vi.mock('ai', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    stepCountIs: stepCountIsMock
  }
})

vi.mock('@logger', () => ({
  loggerService: {
    withContext: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  }
}))

vi.mock('@renderer/store', () => ({
  default: {
    getState: () => ({
      websearch: {
        maxResults: 5,
        excludeDomains: '',
        searchWithTime: false
      }
    })
  }
}))

vi.mock('@renderer/config/models', () => ({
  isAnthropicModel: vi.fn(() => false),
  isFixedReasoningModel: vi.fn(() => false),
  isGeminiModel: vi.fn(() => false),
  isGenerateImageModel: vi.fn(() => false),
  isGrokModel: vi.fn(() => false),
  isOpenAIModel: vi.fn(() => true),
  isOpenRouterBuiltInWebSearchModel: vi.fn(() => false),
  isSupportedReasoningEffortModel: vi.fn(() => false),
  isSupportedThinkingTokenModel: vi.fn(() => false),
  isWebSearchModel: vi.fn(() => false)
}))

vi.mock('@renderer/services/AssistantService', () => ({
  getDefaultModel: vi.fn(() => ({
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    group: 'openai'
  }))
}))

vi.mock('@renderer/utils/prompt', () => ({
  replacePromptVariables: vi.fn(async (prompt: string) => prompt)
}))

vi.mock('@renderer/utils/blacklistMatchPattern', () => ({
  mapRegexToPatterns: vi.fn(() => [])
}))

vi.mock('@renderer/utils/provider', () => ({
  isAIGatewayProvider: vi.fn(() => false),
  isAwsBedrockProvider: vi.fn(() => false)
}))

vi.mock('../../provider/factory', () => ({
  getAiSdkProviderId: vi.fn(() => 'openai')
}))

vi.mock('../../utils/mcp', () => ({
  setupToolsConfig: vi.fn(() => undefined)
}))

vi.mock('../../utils/options', () => ({
  buildProviderOptions: vi.fn(() => ({
    providerOptions: {},
    standardParams: {}
  }))
}))

vi.mock('../../utils/websearch', () => ({
  buildProviderBuiltinWebSearchConfig: vi.fn(() => undefined)
}))

vi.mock('../header', () => ({
  addAnthropicHeaders: vi.fn(() => [])
}))

vi.mock('../modelParameters', () => ({
  getMaxTokens: vi.fn(() => 128),
  getTemperature: vi.fn(() => 0.7),
  getTopP: vi.fn(() => 1)
}))

import { DEFAULT_MAX_TOOL_STEPS } from '../../utils/streamingTimeout'
import { buildStreamTextParams } from '../parameterBuilder'

describe('parameterBuilder', () => {
  beforeEach(() => {
    stepCountIsMock.mockClear()
  })

  it('uses provider.maxToolSteps for stopWhen', async () => {
    const assistant: any = {
      id: 'assistant-1',
      name: 'Test Assistant',
      type: 'assistant',
      settings: {},
      model: { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', group: 'openai' }
    }
    const provider: any = {
      id: 'openai',
      type: 'openai',
      name: 'OpenAI',
      apiKey: 'test-key',
      apiHost: 'https://api.openai.com',
      models: [],
      maxToolSteps: 33
    }

    await buildStreamTextParams([], assistant, provider, {})

    expect(stepCountIsMock).toHaveBeenCalledWith(33)
  })

  it('falls back to default when maxToolSteps is undefined', async () => {
    const assistant: any = {
      id: 'assistant-1',
      name: 'Test Assistant',
      type: 'assistant',
      settings: {},
      model: { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', group: 'openai' }
    }
    const provider: any = {
      id: 'openai',
      type: 'openai',
      name: 'OpenAI',
      apiKey: 'test-key',
      apiHost: 'https://api.openai.com',
      models: []
    }

    await buildStreamTextParams([], assistant, provider, {})

    expect(stepCountIsMock).toHaveBeenCalledWith(DEFAULT_MAX_TOOL_STEPS)
  })
})
