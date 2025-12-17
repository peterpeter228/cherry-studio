import { describe, expect, it } from 'vitest'

import {
  buildCombinedAbortSignal,
  DEFAULT_MAX_TOOL_STEPS,
  MAX_MAX_TOOL_STEPS,
  normalizeMaxToolSteps
} from '../streamingTimeout'

describe('streamingTimeout utilities', () => {
  describe('normalizeMaxToolSteps', () => {
    it('returns DEFAULT_MAX_TOOL_STEPS for undefined', () => {
      expect(normalizeMaxToolSteps(undefined)).toBe(DEFAULT_MAX_TOOL_STEPS)
    })

    it('returns DEFAULT_MAX_TOOL_STEPS for null', () => {
      expect(normalizeMaxToolSteps(null)).toBe(DEFAULT_MAX_TOOL_STEPS)
    })

    it('returns DEFAULT_MAX_TOOL_STEPS for 0', () => {
      expect(normalizeMaxToolSteps(0)).toBe(DEFAULT_MAX_TOOL_STEPS)
    })

    it('returns DEFAULT_MAX_TOOL_STEPS for negative values', () => {
      expect(normalizeMaxToolSteps(-1)).toBe(DEFAULT_MAX_TOOL_STEPS)
      expect(normalizeMaxToolSteps(-100)).toBe(DEFAULT_MAX_TOOL_STEPS)
    })

    it('returns the value when within valid range', () => {
      expect(normalizeMaxToolSteps(1)).toBe(1)
      expect(normalizeMaxToolSteps(50)).toBe(50)
      expect(normalizeMaxToolSteps(100)).toBe(100)
    })

    it('caps at MAX_MAX_TOOL_STEPS', () => {
      expect(normalizeMaxToolSteps(MAX_MAX_TOOL_STEPS + 1)).toBe(MAX_MAX_TOOL_STEPS)
      expect(normalizeMaxToolSteps(1000)).toBe(MAX_MAX_TOOL_STEPS)
    })
  })

  describe('buildCombinedAbortSignal', () => {
    it('returns a controller and signal', () => {
      const { signal, controller } = buildCombinedAbortSignal([])
      expect(signal).toBeInstanceOf(AbortSignal)
      expect(controller).toBeInstanceOf(AbortController)
    })

    it('ignores undefined signals', () => {
      const { signal } = buildCombinedAbortSignal([undefined, undefined])
      expect(signal.aborted).toBe(false)
    })

    it('aborts immediately if any input signal is already aborted', () => {
      const abortedController = new AbortController()
      abortedController.abort('test reason')

      const { signal } = buildCombinedAbortSignal([abortedController.signal])
      expect(signal.aborted).toBe(true)
    })

    it('aborts when any input signal aborts', () => {
      const controller1 = new AbortController()
      const controller2 = new AbortController()

      const { signal } = buildCombinedAbortSignal([controller1.signal, controller2.signal])
      expect(signal.aborted).toBe(false)

      controller1.abort('first abort')
      expect(signal.aborted).toBe(true)
    })

    it('works with mixed valid signals and undefined', () => {
      const controller = new AbortController()

      const { signal } = buildCombinedAbortSignal([undefined, controller.signal, undefined])
      expect(signal.aborted).toBe(false)

      controller.abort()
      expect(signal.aborted).toBe(true)
    })
  })
})
