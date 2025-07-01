import AlignLeft from "@/components/icons/AlignLeft";
import AlignCenter from "@/components/icons/AlignCenter";
import AlignRight from "@/components/icons/AlignRight";
import AlignJustify from "@/components/icons/AlignJustify";
import clsx from "clsx";
import * as ToggleGroup from '@radix-ui/react-toggle-group';

function TextAlignToggle({ value, onChange, disabled }: { value: string; onChange: (val: string) => void; disabled: boolean }) {
  const options = [
    { value: "left", label: "Align left", Icon: AlignLeft },
    { value: "center", label: "Align center", Icon: AlignCenter },
    { value: "right", label: "Align right", Icon: AlignRight },
    { value: "justify", label: "Justify", Icon: AlignJustify },
  ];

  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(val) => val && onChange(val)}
      className={clsx(
        "flex justify-between rounded-md w-[120px] p-[5px] border",
        disabled
          ? "bg-[#FAFAFA] border-[#E5E5E5] text-gray-400 cursor-not-allowed cursor-not-allowed"
          : "bg-white border-gray-300"
      )}
      disabled={disabled}>
      {options.map(({ value: alignValue, label, Icon }) => (
        <ToggleGroup.Item
          key={alignValue}
          value={alignValue}
          aria-label={label}
          className={clsx(
            "rounded h-[24px] w-[24px] flex items-center justify-center",
            value === alignValue ? "bg-secondary" : "hover:bg-gray-100",
            disabled && "cursor-not-allowed"
          )}
        >
          <Icon
            className="h-[20px] w-[20px]"
            color={disabled ? "#9CA3AF" : value === alignValue ? "white" : "currentColor"}
          />
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export default TextAlignToggle;
