import { describe, expect, it, vi } from 'vitest'

import { createStreamingIdleTimeout } from '../streamingTimeout'

describe('streamingTimeout', () => {
  it('triggers onTimeout after idle timeout', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    const idle = createStreamingIdleTimeout({ idleTimeoutMs: 1000, onTimeout })

    idle.reset()
    expect(onTimeout).not.toHaveBeenCalled()

    vi.advanceTimersByTime(999)
    expect(onTimeout).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onTimeout).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('reset restarts the timer', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    const idle = createStreamingIdleTimeout({ idleTimeoutMs: 1000, onTimeout })

    idle.reset()
    vi.advanceTimersByTime(500)
    idle.reset()
    vi.advanceTimersByTime(500)
    expect(onTimeout).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(onTimeout).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('clear cancels the timer', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    const idle = createStreamingIdleTimeout({ idleTimeoutMs: 1000, onTimeout })

    idle.reset()
    idle.clear()
    vi.advanceTimersByTime(2000)
    expect(onTimeout).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
