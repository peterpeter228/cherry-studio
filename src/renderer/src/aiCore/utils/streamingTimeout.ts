/**
 * Streaming timeout utilities for long-running SSE tasks
 *
 * Provides configurable timeout constants and signal combination for:
 * - Request hard timeout
 * - SSE idle timeout
 * - Max tool steps
 */

/** Default max tool steps if provider.maxToolSteps is undefined */
export const DEFAULT_MAX_TOOL_STEPS = 20

/** Maximum allowed tool steps to prevent UI input overflow */
export const MAX_MAX_TOOL_STEPS = 200

/**
 * Normalizes the maxToolSteps value from provider config.
 * Returns DEFAULT_MAX_TOOL_STEPS if undefined, null, or <= 0.
 */
export function normalizeMaxToolSteps(value: number | undefined | null): number {
  if (value == null || value <= 0) {
    return DEFAULT_MAX_TOOL_STEPS
  }
  return Math.min(value, MAX_MAX_TOOL_STEPS)
}

/**
 * Builds a combined AbortSignal that aborts when any of the provided signals abort.
 *
 * @param signals - Array of AbortSignal or undefined values
 * @returns Combined AbortSignal that aborts when any input signal aborts
 */
export function buildCombinedAbortSignal(signals: (AbortSignal | undefined)[]): {
  signal: AbortSignal
  controller: AbortController
} {
  const controller = new AbortController()
  const validSignals = signals.filter((s): s is AbortSignal => s !== undefined)

  for (const signal of validSignals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      break
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }

  return { signal: controller.signal, controller }
}
