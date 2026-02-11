import React, { useCallback, useMemo } from "react";
import ButtonColor from "@/components/button-color";
import { ToolbarButtonTooltip } from "@/pages/editor/components/toolbar-button-tooltip";
import IconHighlighter from "./app/icons/IconHighlighter";
import AppButton from "./app/app-button";

interface HighlightColorProps {
  onSelect?: (color: string) => void;
  highlightColorInputRef?: React.RefObject<HTMLInputElement>;
  highlightColor: string;
  tabIndex?: number;
  tooltip?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const HighlightColor: React.FC<HighlightColorProps> = ({
  onSelect,
  highlightColorInputRef,
  highlightColor,
  tabIndex = 0,
  ariaLabel = "Highlight Color",
  tooltip,
  disabled = false,
}) => {
  const handleClick = useCallback((): void => {
    highlightColorInputRef?.current?.click();
  }, [highlightColorInputRef]);

  const tooltipMemo = useMemo(() => tooltip ?? "Highlight Color", [tooltip]);

  return (
    <ButtonColor
      tooltip={tooltipMemo}
      onSelect={onSelect}
      initColor="#FFFFFF"
      tabIndex={tabIndex}
      ariaLabel={ariaLabel}
      icon={
        <ToolbarButtonTooltip
          tooltip={tooltipMemo}
          disabled={disabled}
        >
          <AppButton
            asChild
            variant='toolbar'
            aria-label={ariaLabel}
            size="icon"
            rounded="sm"
            tabIndex={tabIndex}
            disabled={disabled}
          >
            <IconHighlighter textColor={highlightColor} />
          </AppButton>
        </ToolbarButtonTooltip>
      }
      handleClick={handleClick}
      disabled={disabled}
    />
  );
};

export default React.memo(HighlightColor);
