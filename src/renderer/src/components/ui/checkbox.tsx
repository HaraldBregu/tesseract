import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string | React.ReactNode;
  labelClassName?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, labelClassName, ...props }, ref) => (
  <div className="flex items-center gap-2">
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary dark:border-grey-70 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary-70 dark:data-[state=checked]:border-primary-70 data-[state=checked]:text-primary-foreground ",
        " dark:disabled:data-[state=checked]:bg-grey-70 dark:disabled:data-[state=checked]:border-grey-70 dark:disabled:data-[state=checked]:text-grey-40",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {label && <label className={cn("text-[12px] font-semibold", labelClassName)}>{label}</label>}
  </div>
))

export { Checkbox }
