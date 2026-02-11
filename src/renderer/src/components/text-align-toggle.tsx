import AlignLeft from "@/components/icons/AlignLeft";
import AlignCenter from "@/components/icons/AlignCenter";
import AlignRight from "@/components/icons/AlignRight";
import AlignJustify from "@/components/icons/AlignJustify";
import clsx from "clsx";
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useTheme } from "@/hooks/use-theme";

function TextAlignToggle({ value, onChange, disabled }: { value: string; onChange: (val: string) => void; disabled: boolean }) {
  const { isDark } = useTheme();

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
          ? "bg-[#FAFAFA] dark:bg-grey-20 border-[#E5E5E5] dark:border-grey-40 text-gray-400 dark:text-grey-60 cursor-not-allowed"
          : "bg-white dark:bg-grey-10 border-gray-300 dark:border-grey-40"
      )}
      disabled={disabled}>
      {options.map(({ value: alignValue, label, Icon }) => (
        <ToggleGroup.Item
          key={alignValue}
          value={alignValue}
          aria-label={label}
          className={clsx(
            "rounded h-[24px] w-[24px] flex items-center justify-center",
            value === alignValue ? "bg-secondary" : "hover:bg-gray-100 dark:hover:bg-grey-20",
            disabled && "cursor-not-allowed"
          )}
        >
          <Icon
            className="h-[20px] w-[20px]"
            inheritColor={!isDark}
            intent="secondary"
            variant="tonal"
            size="small"
            color={disabled
              ? (isDark ? "#6B7280" : "#9CA3AF")
              : value === alignValue
                ? "#FFFFFF"
                : "currentColor"
            }
          />
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export default TextAlignToggle;
