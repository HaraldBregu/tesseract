import React from 'react'
import ButtonColor from '@/components/button-color'
import HighlighterSplitted from './icons/Highlighter'

interface HighlightColorProps {
  onSelect?: (color: string) => void
  highlightColorInputRef?: React.RefObject<HTMLInputElement>
  highlightColor: string
  tabIndex?: number
  tooltip?: string
  ariaLabel?: string
}
// highlightColor
const HighlightColor: React.FC<HighlightColorProps> = ({
  onSelect,
  highlightColorInputRef,
  highlightColor,
  tabIndex = 0,
  ariaLabel = 'Highlight Color',
  tooltip
}) => {
  const handleClick = (): void => {
    highlightColorInputRef?.current?.click()
  }

  return (
    <ButtonColor
      tooltip={tooltip}
      onSelect={onSelect}
      initColor="white"
      tabIndex={tabIndex}
      ariaLabel={ariaLabel}
      icon={
        <HighlighterSplitted
          className="[&>path:first-child]:fill-current"
          style={{ color: highlightColor }}
          size="small"
        />
      }
      handleClick={handleClick}
    />
  )
}

export default HighlightColor
