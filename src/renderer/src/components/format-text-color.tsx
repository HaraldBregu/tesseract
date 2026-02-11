import ButtonColor from "@/components/button-color";
import React, { useCallback, useMemo } from "react";
import { ToolbarButtonTooltip } from "@/pages/editor/components/toolbar-button-tooltip";
import AppButton from "./app/app-button";
import IconColorText from "./app/icons/IconColorText";

interface FormatTextColorProps {
  onSelect?: (color: string) => void;
  FormatTextColorInputRef?: React.RefObject<HTMLInputElement>;
  textColor?: string;
  tabIndex?: number;
  ariaLabel?: string;
  tooltip?: string;
  disabled?: boolean;
}

const FormatTextColor: React.FC<FormatTextColorProps> = ({
  onSelect,
  FormatTextColorInputRef,
  textColor,
  tabIndex = 0,
  ariaLabel = "Text Color",
  tooltip,
  disabled = false,
}) => {
  const handleClick = useCallback((): void => {
    FormatTextColorInputRef?.current?.click();
  }, [FormatTextColorInputRef]);

  const tooltipMemo = useMemo(() => tooltip ?? "Text Color", [tooltip]);

  return (
    <ButtonColor
      onSelect={onSelect}
      initColor="#000000"
      tooltip={tooltipMemo}
      ariaLabel={ariaLabel}
      tabIndex={tabIndex}
      icon={
        <ToolbarButtonTooltip
          tooltip={tooltipMemo}
          disabled={disabled}
        >
          <AppButton
            asChild
            variant='toolbar'
            aria-label={tooltipMemo}
            size="icon"
            rounded="sm"
            tabIndex={tabIndex}
            disabled={disabled}
          >
            <IconColorText textColor={textColor} />
          </AppButton>
        </ToolbarButtonTooltip>
      }
      handleClick={handleClick}
      disabled={disabled}
    />
  );
};

export default React.memo(FormatTextColor);
