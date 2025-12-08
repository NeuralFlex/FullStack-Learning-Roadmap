import type React from "react"
import type { MediaFile } from "../types"
import { useResize } from "../hooks/useResize"
import { parseIntWithFallback } from "../utils"

interface ResizeControlsProps {
  file: MediaFile
  onResize: (index: number, width: number, height: number) => void
  realIdx: number
}

interface PresetControlsProps {
  presets: { label: string; width: number; height: number }[]
  onPresetClick: (width: number, height: number) => void
}

const PresetControls: React.FC<PresetControlsProps> = ({ presets, onPresetClick }) => (
  <div className="card-controls">
    {presets.map((preset) => (
      <button
        key={preset.label}
        className="preset-btn"
        onClick={() => onPresetClick(preset.width, preset.height)}
      >
        {preset.label}
      </button>
    ))}
  </div>
)

export const ResizeControls: React.FC<ResizeControlsProps> = ({
  file,
  onResize,
  realIdx,
}) => {
  const { state, updateState, setDimensions, presets } = useResize(
    file.metadata.dimensions?.width || 800,
    file.metadata.dimensions?.height || 600
  )

  return (
    <>
      <PresetControls presets={presets} onPresetClick={setDimensions} />
      <div className="advanced-controls">
        <div className="dimension-inputs">
          <input
            type="number"
            value={state.width}
            onChange={(e) => updateState({ width: parseIntWithFallback(e.target.value, 800) })}
            placeholder="Width"
          />
          <span>×</span>
          <input
            type="number"
            value={state.height}
            onChange={(e) => updateState({ height: parseIntWithFallback(e.target.value, 600) })}
            placeholder="Height"
          />
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={state.ratio}
            onChange={(e) => updateState({ ratio: e.target.checked })}
          />
          <span>Maintain aspect ratio</span>
        </label>
        <button
          className="resize-action-btn"
          onClick={() => onResize(realIdx, state.width, state.height)}
          disabled={file.processing}
        >
          Resize Image
        </button>
      </div>
    </>
  )
}
