import { useState, useMemo, useCallback } from "react"

export interface ResizeState {
  width: number
  height: number
  ratio: boolean
}

export interface TrimState {
  start: number
  end: number
}

const PRESETS = [
  { label: "1080p", width: 1920, height: 1080 },
  { label: "720p", width: 1280, height: 720 },
  { label: "Standard", width: 800, height: 600 },
]

export const useResize = (initialWidth: number = 800, initialHeight: number = 600) => {
  const [state, setState] = useState<ResizeState>({
    width: initialWidth,
    height: initialHeight,
    ratio: false,
  })

  // Compute aspect ratio once with useMemo and reuse it
  const aspectRatio = useMemo(() => initialWidth / initialHeight, [initialWidth, initialHeight])

  const updateState = useCallback((updates: Partial<ResizeState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates }

      // If maintaining aspect ratio and both width and height are changing, let it happen
      if (newState.ratio && updates.width != null && updates.height == null) {
        // Only width changed, compute height
        newState.height = Math.round(newState.width / aspectRatio)
      } else if (newState.ratio && updates.height != null && updates.width == null) {
        // Only height changed, compute width
        newState.width = Math.round(newState.height * aspectRatio)
      }

      return newState
    })
  }, [aspectRatio])

  const setDimensions = useCallback((width: number, height: number) => {
    setState(prev => ({ ...prev, width, height }))
  }, [])

  return { state, updateState, setDimensions, presets: PRESETS }
}

export const useTrim = (initialStart: number = 0, initialEnd: number = 0) => {
  const [state, setState] = useState<TrimState>({
    start: initialStart,
    end: initialEnd,
  })

  const updateState = useCallback((updates: Partial<TrimState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates }
      // Validate trimEnd >= trimStart
      if (newState.end < newState.start) {
        newState.end = newState.start
      }
      return newState
    })
  }, [])

  const setTrimRange = useCallback((start: number, end: number) => {
    const validatedStart = Math.max(0, start)
    const validatedEnd = Math.max(validatedStart, end)
    setState({ start: validatedStart, end: validatedEnd })
  }, [])

  return { state, updateState, setTrimRange }
}
