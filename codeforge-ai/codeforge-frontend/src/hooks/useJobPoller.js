import { useEffect, useRef, useCallback } from 'react'
import { generationApi } from '../api/generationApi'

/**
 * useJobPoller — polls /generate/status/{jobId} every 2 seconds until COMPLETED or FAILED.
 * @param {string|null} jobId  — the job ID to poll (null = inactive)
 * @param {function} onComplete — called with { projectId, title, summary, version } when done
 * @param {function} onError    — called with errorMessage string when failed
 * @returns {{ isPolling: boolean, status: string|null }}
 */
export function useJobPoller(jobId, onComplete, onError) {
  const intervalRef = useRef(null)
  const statusRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!jobId) { stopPolling(); return }

    const poll = async () => {
      try {
        const { data } = await generationApi.getJobStatus(jobId)
        statusRef.current = data.status

        if (data.status === 'COMPLETED') {
          stopPolling()
          onComplete?.({
            projectId: data.projectId,
            title: data.title,
            summary: data.summary,
            version: data.version,
          })
        } else if (data.status === 'FAILED') {
          stopPolling()
          onError?.(data.error || 'Code generation failed. Please try again.')
        }
        // PENDING / PROCESSING → keep polling
      } catch (err) {
        // Network error — keep polling (don't stop on transient errors)
        console.warn('[useJobPoller] poll error:', err.message)
      }
    }

    // Poll immediately, then every 2 seconds
    poll()
    intervalRef.current = setInterval(poll, 2000)

    return () => stopPolling()
  }, [jobId, onComplete, onError, stopPolling])

  return {
    isPolling: !!intervalRef.current,
    status: statusRef.current,
    stopPolling,
  }
}
