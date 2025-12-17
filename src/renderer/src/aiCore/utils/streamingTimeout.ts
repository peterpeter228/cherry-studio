/**
 * Streaming idle timeout utility
 * Monitors SSE stream for idle periods and aborts if no data is received within the configured window
 */

import { loggerService } from '@logger'

const logger = loggerService.withContext('streamingTimeout')

/**
 * Creates an AbortController that will abort if no SSE chunks are received
 * within the specified idle timeout window.
 *
 * @param idleTimeoutMinutes - Idle timeout in minutes. If undefined, no timeout is applied.
 * @param abortSignal - Optional parent abort signal to chain with
 * @returns Object containing the abort controller and a function to reset the idle timer
 */
export function createStreamingIdleTimeout(
  idleTimeoutMinutes: number | undefined,
  abortSignal?: AbortSignal
): {
  abortController: AbortController
  resetIdleTimer: () => void
} {
  const abortController = new AbortController()

  // If no timeout configured, return a no-op controller
  if (idleTimeoutMinutes === undefined || idleTimeoutMinutes <= 0) {
    return {
      abortController,
      resetIdleTimer: () => {
        // No-op
      }
    }
  }

  const timeoutMs = idleTimeoutMinutes * 60 * 1000
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  // Chain with parent abort signal if provided
  if (abortSignal) {
    abortSignal.addEventListener('abort', () => {
      abortController.abort()
      if (idleTimer) {
        clearTimeout(idleTimer)
        idleTimer = null
      }
    })
  }

  const resetIdleTimer = () => {
    // Clear existing timer
    if (idleTimer) {
      clearTimeout(idleTimer)
      idleTimer = null
    }

    // Set new timer
    idleTimer = setTimeout(() => {
      logger.warn(`SSE idle timeout reached (${idleTimeoutMinutes} minutes). Aborting request.`)
      abortController.abort()
      idleTimer = null
    }, timeoutMs)
  }

  // Start the initial timer
  resetIdleTimer()

  return {
    abortController,
    resetIdleTimer
  }
}
