export const DEFAULT_MAX_TOOL_STEPS = 20
export const MAX_MAX_TOOL_STEPS = 200

export type StreamingIdleTimeout = {
  reset: () => void
  clear: () => void
  hasTriggered: () => boolean
}

type TimerHandle = ReturnType<typeof setTimeout>

/**
 * Create a deterministic, testable SSE idle timeout controller.
 * Call `reset()` whenever a stream event is received.
 */
export function createStreamingIdleTimeout({
  idleTimeoutMs,
  onTimeout,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout
}: {
  idleTimeoutMs: number
  onTimeout: () => void
  setTimeoutFn?: (handler: () => void, timeout: number) => TimerHandle
  clearTimeoutFn?: (handle: TimerHandle) => void
}): StreamingIdleTimeout {
  let timer: TimerHandle | null = null
  let triggered = false

  const clear = () => {
    if (timer) {
      clearTimeoutFn(timer)
      timer = null
    }
  }

  const reset = () => {
    if (triggered) {
      return
    }
    clear()
    timer = setTimeoutFn(() => {
      triggered = true
      onTimeout()
    }, idleTimeoutMs)
  }

  return {
    reset,
    clear,
    hasTriggered: () => triggered
  }
}
