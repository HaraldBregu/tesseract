import * as React from "react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const chipVariants = cva(
  "rounded-full",
  {
    variants: {
      chipVariant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary-95 text-secondary border border-secondary hover:bg-secondary-90 dark:bg-secondary-30 dark:text-secondary-80 dark:border-secondary-80",
        outline: "bg-transparent border border-secondary text-secondary dark:text-secondary-80 dark:border-secondary-80 hover:bg-secondary-95 dark:hover:bg-secondary-30",
      },
    },
    defaultVariants: {
      chipVariant: "primary",
    },
  }
);

const chipCloseVariants = cva(
  "ml-1 h-4 w-4 rounded-full",
  {
    variants: {
      chipVariant: {
        primary: "hover:bg-primary-foreground/20 text-primary-foreground/80 hover:text-primary-foreground",
        secondary: "hover:bg-secondary/20 text-secondary/80 hover:text-secondary dark:text-secondary-80 dark:hover:text-secondary-60",
        outline: "hover:bg-secondary/20 text-secondary/80 hover:text-secondary dark:text-secondary-80 dark:hover:text-secondary-60",
      },
    },
    defaultVariants: {
      chipVariant: "primary",
    },
  }
);

type InputTagsProps = Omit<InputProps, "value" | "onChange"> & 
  VariantProps<typeof chipVariants> & {
    value: string[];
    onChange: React.Dispatch<React.SetStateAction<string[]>>;
    chipClassName?: string;
    inputClassName?: string;
    inputDisabled?: boolean;
  };

const InputTags = React.forwardRef<HTMLInputElement, InputTagsProps>(
  ({ className, value, onChange, chipClassName, inputClassName, chipVariant, disabled, inputDisabled, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState("");

    const isInputDisabled = disabled || inputDisabled;

    React.useEffect(() => {
      if (pendingDataPoint.includes(",")) {
        const newDataPoints = new Set([
          ...value,
          ...pendingDataPoint.split(",").map((chunk) => chunk.trim()),
        ]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint("");
      }
    }, [pendingDataPoint, onChange, value]);

    const addPendingDataPoint = () => {
      if (pendingDataPoint) {
        const newDataPoints = new Set([...value, pendingDataPoint]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint("");
      }
    };

    return (
      <div
        className={cn(
          // caveat: :has() variant requires tailwind v3.4 or above: https://tailwindcss.com/blog/tailwindcss-v3-4#new-has-variant
          "has-[:focus-visible]:outline-none has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring min-h-10 flex w-full flex-wrap gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-grey-40 dark:has-[:focus-visible]:ring-primary-70",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {value.map((item) => (
          <Badge key={item} className={cn(chipVariants({ chipVariant }), chipClassName)}>
            {item}
            <Button
              variant="icon"
              size="icon"
              className={chipCloseVariants({ chipVariant })}
              onClick={() => {
                if (!disabled) {
                  onChange(value.filter((i) => i !== item));
                }
              }}
              disabled={disabled}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <input
          className={cn(inputClassName, 'flex-1 outline-none bg-transparent placeholder:text-neutral-500 dark:placeholder:text-neutral-400 dark:text-white', isInputDisabled && 'cursor-not-allowed')}
          value={pendingDataPoint}
          onChange={(e) => setPendingDataPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addPendingDataPoint();
            } else if (
              e.key === "Backspace" &&
              pendingDataPoint.length === 0 &&
              value.length > 0
            ) {
              e.preventDefault();
              onChange(value.slice(0, -1));
            }
          }}
          disabled={isInputDisabled}
          {...props}
          ref={ref}
        />
      </div>
    );
  }
);

InputTags.displayName = "InputTags";

export { InputTags };