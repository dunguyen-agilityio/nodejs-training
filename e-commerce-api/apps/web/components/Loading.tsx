'use client'

import React, { useState } from 'react'

export interface LoadingRef {
  showLoading: () => void
  hideLoading: () => void
}

/**
 * Loading indicator component with optional full-screen overlay
 */
const LoadingIndicator = ({
  loading,
  fullScreen,
}: {
  loading: boolean
  fullScreen?: boolean
}) => {
  if (!loading) return null
  return (
    <div
      className={
        fullScreen
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm'
          : 'flex items-center justify-center bg-background/50'
      }
    >
      <div className="animate-spin rounded-full h-28 w-28 border-b-6 border-t-4 border-blue-500 flex justify-center items-center">
        <div className="animate-spin rounded-full h-24 w-24 border-l-4 border-r-6 border-blue-500"></div>
      </div>
    </div>
  )
}

/**
 * Loading wrapper component that can be controlled via ref
 * Useful for showing loading states during navigation or async operations
 *
 * @example
 * ```tsx
 * const loadingRef = useRef<LoadingRef | null>(null)
 *
 * <Loading ref={loadingRef}>
 *   <YourContent />
 * </Loading>
 *
 * // Show loading
 * loadingRef.current?.showLoading()
 * // Hide loading
 * loadingRef.current?.hideLoading()
 * ```
 */
function Loading({
  children,
  ref,
}: React.PropsWithChildren<{
  ref: React.RefObject<LoadingRef | null>
}>) {
  const [loading, setLoading] = useState(false)
  ref.current = {
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
  }
  return (
    <>
      {children}
      <LoadingIndicator loading={loading} fullScreen />
    </>
  )
}

export default Loading
