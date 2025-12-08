import type React from "react"
import type { MediaFile } from "../types"
import { parseFloatWithFallback } from "../utils"
import { useTrim } from "../hooks/useResize"

interface TrimControlsProps {
  file: MediaFile
  onTrim: (index: number, start: number, end: number) => void
  realIdx: number
}

export const TrimControls: React.FC<TrimControlsProps> = ({
  file,
  onTrim,
  realIdx,
}) => {
  const { state, updateState } = useTrim(0, file.metadata.duration || 0)

  return (
    <div className="advanced-controls">
      <div className="trim-inputs">
        <label>
          <span>Start (s)</span>
          <input
            type="number"
            value={state.start}
            onChange={(e) =>
              updateState({ start: parseFloatWithFallback(e.target.value, 0) })
            }
            min="0"
            max={file.metadata.duration || 3600}
            step="0.1"
          />
        </label>
        <label>
          <span>End (s)</span>
          <input
            type="number"
            value={state.end}
            onChange={(e) =>
              updateState({
                end: parseFloatWithFallback(e.target.value, file.metadata.duration || 0),
              })
            }
            min="0"
            max={file.metadata.duration || 3600}
            step="0.1"
          />
        </label>
      </div>
      <button
        className="trim-action-btn"
        onClick={() => onTrim(realIdx, state.start, state.end)}
        disabled={file.processing}
      >
        Trim Video
      </button>
    </div>
  )
}
