import { InfoTooltip } from '@renderer/components/TooltipIcons'
import { useProvider } from '@renderer/hooks/useProvider'
import type { Provider } from '@renderer/types'
import { Button, Flex, InputNumber } from 'antd'
import { startTransition, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  providerId: string
}

const StreamingSettings = ({ providerId }: Props) => {
  const { t } = useTranslation()
  const { provider, updateProvider } = useProvider(providerId)

  const [requestTimeoutMinutes, setRequestTimeoutMinutes] = useState<number | null>(
    provider.requestTimeoutMinutes ?? null
  )
  const [sseIdleTimeoutMinutes, setSseIdleTimeoutMinutes] = useState<number | null>(
    provider.sseIdleTimeoutMinutes ?? null
  )
  const [maxToolSteps, setMaxToolSteps] = useState<number | null>(provider.maxToolSteps ?? null)

  const updateProviderTransition = useCallback(
    (updates: Partial<Provider>) => {
      startTransition(() => {
        updateProvider(updates)
      })
    },
    [updateProvider]
  )

  const handleSave = () => {
    updateProviderTransition({
      requestTimeoutMinutes: requestTimeoutMinutes ?? undefined,
      sseIdleTimeoutMinutes: sseIdleTimeoutMinutes ?? undefined,
      maxToolSteps: maxToolSteps ?? undefined
    })
  }

  const handleReset = () => {
    setRequestTimeoutMinutes(null)
    setSseIdleTimeoutMinutes(null)
    setMaxToolSteps(null)
    updateProviderTransition({
      requestTimeoutMinutes: undefined,
      sseIdleTimeoutMinutes: undefined,
      maxToolSteps: undefined
    })
  }

  return (
    <Flex vertical gap="large" style={{ padding: '8px 0' }}>
      <Flex vertical gap="middle">
        <Flex align="center" gap={6}>
          <label>{t('settings.provider.streaming.request_timeout.label')}</label>
          <InfoTooltip title={t('settings.provider.streaming.request_timeout.help')} />
        </Flex>
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={1440}
          placeholder={t('settings.provider.streaming.request_timeout.placeholder')}
          value={requestTimeoutMinutes}
          onChange={(value) => setRequestTimeoutMinutes(value)}
          addonAfter={t('settings.provider.streaming.timeout_unit')}
        />
      </Flex>

      <Flex vertical gap="middle">
        <Flex align="center" gap={6}>
          <label>{t('settings.provider.streaming.sse_idle_timeout.label')}</label>
          <InfoTooltip title={t('settings.provider.streaming.sse_idle_timeout.help')} />
        </Flex>
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={1440}
          placeholder={t('settings.provider.streaming.sse_idle_timeout.placeholder')}
          value={sseIdleTimeoutMinutes}
          onChange={(value) => setSseIdleTimeoutMinutes(value)}
          addonAfter={t('settings.provider.streaming.timeout_unit')}
        />
      </Flex>

      <Flex vertical gap="middle">
        <Flex align="center" gap={6}>
          <label>{t('settings.provider.streaming.max_tool_steps.label')}</label>
          <InfoTooltip title={t('settings.provider.streaming.max_tool_steps.help')} />
        </Flex>
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={1000}
          placeholder={t('settings.provider.streaming.max_tool_steps.placeholder')}
          value={maxToolSteps}
          onChange={(value) => setMaxToolSteps(value)}
        />
      </Flex>

      <Flex gap="small" justify="flex-end" style={{ marginTop: '8px' }}>
        <Button onClick={handleReset}>{t('settings.provider.streaming.reset')}</Button>
        <Button type="primary" onClick={handleSave}>
          {t('settings.provider.streaming.save')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default StreamingSettings
