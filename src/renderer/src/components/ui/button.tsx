import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 w-fit whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      intent: {
        primary: "",
        secondary: "",
        destructive: "",
      },
      variant: {
        filled: "",
        outline: "border bg-transparent",
        tonal: "",
        border: "border bg-transparent",
        icon: "bg-transparent",
        link: "bg-transparent uppercase",
        ghost:""
      },
      size: {
        small: "h-[40px] px-[12px] py-[8px] text-sm",
        mini: "h-[24px] px-[8px] py-[4px] text-xs",
        icon: "h-9 w-9 p-[12px]",
        iconSm: "h-[24px] w-[24px] p-[4px] rounded-[4px]",
        iconMini: "h-[18px] w-[18px] p-[2px] rounded-[6px]",
      },
    },
    defaultVariants: {
      intent: "primary",
      variant: "filled",
      size: "small",
    },
    compoundVariants: [
      {
        intent: "primary",
        variant: "filled",
        className: "bg-primary text-primary-foreground hover:bg-primary-40 disabled:bg-grey-65 disabled:text-grey"
      },
      {
        intent: "primary",
        variant: "outline",
        className: "border-primary text-primary hover:bg-primary-95 disabled:border-grey-60 disabled:text-grey"
      },
      {
        intent: "primary",
        variant: "tonal",
        className: "bg-primary-95 text-primary hover:bg-primary-90 disabled:bg-grey-65 disabled:text-grey"
      },
      {
        intent: "secondary",
        variant: "filled",
        className: "bg-secondary text-secondary-foreground hover:bg-secondary-40 disabled:bg-grey-65 disabled:text-grey"
      },
      {
        intent: "secondary",
        variant: "outline",
        className: "border-secondary text-secondary dark:text-secondary-80 dark:border-secondary-80 hover:bg-secondary-95 dark:hover:bg-secondary-30 disabled:border-grey-60 disabled:text-grey"
      },
      {
        intent: "secondary",
        variant: "tonal",
        className: "bg-secondary-95 text-secondary hover:bg-secondary-90 disabled:bg-grey-65 disabled:text-grey"
      },
      {
        intent: "destructive",
        variant: "filled",
        className: "bg-destructive text-destructive-foreground hover:bg-destructive-60 disabled:bg-grey-65 disabled:text-grey"
      },
      {
        intent: "destructive",
        variant: "outline",
        className: "border-destructive text-destructive hover:bg-destructive-95 disabled:border-grey-60 disabled:text-grey"
      },
      {
        intent: "destructive",
        variant: "tonal",
        className: "bg-destructive-95 text-destructive hover:bg-destructive-90 disabled:bg-grey-65 disabled:text-grey"
      },
      {
        intent: "primary",
        variant: "border",
        className: "text-primary border-grey-85 hover:bg-grey-80 disabled:text-grey"
      },
      {
        intent: "secondary",
        variant: "border",
        className: "text-secondary border-grey-85 hover:bg-grey-80 disabled:text-grey"
      },
      {
        intent: "destructive",
        variant: "border",
        className: "text-destructive border-grey-85 hover:bg-grey-80 disabled:text-grey"
      },
      //icon variables
      {
        intent: "primary",
        variant: "icon",
        className: "text-primary hover:bg-grey-80 disabled:text-grey dark:hover:bg-grey-50"
      },
      {
        intent: "secondary",
        variant: "icon",
        className: "text-secondary hover:bg-grey-80 disabled:text-grey dark:hover:bg-grey-50"
      },
      {
        intent: "destructive",
        variant: "icon",
        className: "text-destructive hover:bg-grey-80 disabled:text-grey dark:hover:bg-grey-50"
      },
      // Icon + Outline combinations for icon buttons with borders
      {
        intent: "primary",
        variant: "outline",
        size: ["icon", "iconSm", "iconMini"],
        className: "border-primary text-primary hover:bg-primary-95 disabled:border-grey-60 disabled:text-grey"
      },
      {
        intent: "secondary",
        variant: "outline",
        size: ["icon", "iconSm", "iconMini"],
        className: "border-secondary text-secondary hover:bg-secondary-95 disabled:border-grey-60 disabled:text-grey"
      },
      {
        intent: "destructive",
        variant: "outline",
        size: ["icon", "iconSm", "iconMini"],
        className: "border-destructive text-destructive hover:bg-destructive-95 disabled:border-grey-60 disabled:text-grey"
      },
      // Icon + Tonal combinations for icon buttons with tonal backgrounds
      {
        intent: "primary",
        variant: "tonal",
        size: ["icon", "iconSm", "iconMini"],
        className: "bg-primary-95 dark:bg-primary-50 text-primary hover:bg-primary-90 disabled:bg-grey-65 disabled:text-grey dark:hover:bg-primary-70"
      },
      {
        intent: "secondary",
        variant: "tonal",
        size: ["icon", "iconSm", "iconMini"],
        className: "bg-secondary-95 dark:bg-secondary-50 text-secondary hover:bg-secondary-90 disabled:bg-grey-65 disabled:text-grey dark:hover:bg-secondary-70"
      },
      {
        intent: "destructive",
        variant: "tonal",
        size: ["icon", "iconSm", "iconMini"],
        className: "bg-destructive-95 dark:bg-destructive-50 text-destructive hover:bg-destructive-90 disabled:bg-grey-65 disabled:text-grey dark:hover:bg-destructive-70"
      },
      // Icon + Filled combinations for icon buttons with filled backgrounds
      {
        intent: "primary",
        variant: "filled",
        size: ["icon", "iconSm", "iconMini"],
        className: "bg-primary text-primary-foreground hover:bg-primary-40 disabled:bg-grey-65 disabled:text-grey"
      },
      {
        intent: "secondary",
        variant: "filled",
        size: ["icon", "iconSm", "iconMini"],
        className: "bg-secondary text-secondary-foreground hover:bg-secondary-40 disabled:bg-grey-65 disabled:text-grey"
      },
      {
        intent: "destructive",
        variant: "filled",
        size: ["icon", "iconSm", "iconMini"],
        className: "bg-destructive text-destructive-foreground hover:bg-destructive-60 disabled:bg-grey-65 disabled:text-grey"
      },
      // Link variants
      {
        intent: "primary",
        variant: "link",
        className: "text-primary hover:text-primary-40 disabled:text-grey"
      },
      {
        intent: "secondary",
        variant: "link",
        className: "text-secondary hover:text-secondary-40 disabled:text-grey"
      },
      {
        intent: "destructive",
        variant: "link",
        className: "text-destructive hover:text-destructive-40 disabled:text-grey"
      }
    ]
  }
)

// Helper function to clone React elements and add disabled prop
const cloneElementWithDisabled = (element: React.ReactNode, disabled: boolean): React.ReactNode => {
  if (React.isValidElement<{ disabled?: boolean }>(element)) {
    return React.cloneElement(element, {
      ...(typeof element.props === 'object' && element.props !== null ? element.props : {}),
      disabled,
    });
  }
  return element;
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, variant, size, asChild = false, leftIcon, rightIcon, icon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    let buttonSize = size;
    if (icon) {
      if (size !== 'icon' && size !== 'iconSm' && size !== 'iconMini') {
        buttonSize = 'icon';
      }

      const buttonElement = (
        <Comp
          className={cn(buttonVariants({ intent, variant, size: buttonSize, className }))}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {cloneElementWithDisabled(icon, disabled || false)}
        </Comp>
      );

      return buttonElement;
    }

    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ intent, variant, size: buttonSize, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {leftIcon && <span className="inline-flex">{cloneElementWithDisabled(leftIcon, disabled || false)}</span>}
        {children}
        {rightIcon && <span className="inline-flex">{cloneElementWithDisabled(rightIcon, disabled || false)}</span>}
      </Comp>
    );

    return buttonElement;
  }
)
Button.displayName = "Button"

export default Button