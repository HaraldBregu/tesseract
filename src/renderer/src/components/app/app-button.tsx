import { memo } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/original_button'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import React from 'react'

/**
 * WARNING: <AppButton> is a styled button component for application-wide use.
 * 
 * - Use this component instead of the default <button> or other button components for consistency.
 * - Pass `variant`, `size`, and other props as defined in the appButtonVariants for correct styling.
 * - For icon buttons, wrap your icon in a <Slot> for correct sizing.
 * - Do NOT override styles directly; extend via variants or update the appButtonVariants if needed.
 * - If you need a new variant or size, add it to appButtonVariants and document its usage.
 * 
 * Example usage:
 *   <AppButton variant="success" size="lg" onClick={...}>Save</AppButton>
 * 
 * See appButtonVariants below for all available options.
 */


const appButtonVariants = cva(buttonVariants(), {
  variants: {
    variant: {
      // Inherit all base variants
      default: buttonVariants({ variant: "default" }),
      destructive: cn(
        buttonVariants({ variant: "destructive" }),
        "!bg-destructive !text-destructive-foreground hover:!bg-destructive-60 disabled:!bg-grey-65 disabled:!text-grey"
      ),
      outline: cn(
        buttonVariants({ variant: "outline" }),
        "!bg-transparent !border-input !text-accent-foreground dark:!text-secondary-80 dark:border-input hover:!bg-secondary-95 dark:hover:!bg-secondary-30 disabled:!border-grey-60 disabled:!text-grey"
      ),
      secondary: cn(
        buttonVariants({ variant: "secondary" }),
        "!bg-secondary-95 !text-secondary hover:!bg-secondary-90 disabled:!bg-grey-65 disabled:!text-grey"
      ),
      ghost: buttonVariants({ variant: "ghost" }),
      link: buttonVariants({ variant: "link" }),
      // Custom app variants
      transparent:
        "!bg-transparent !text-black dark:!text-primary-foreground hover:!bg-transparent disabled:!text-grey dark:hover:!bg-transparent",
      ["transparent-selected"]:
        "!bg-transparent !text-white dark:!text-primary-foreground hover:!bg-transparent disabled:!text-grey dark:hover:!bg-transparent",
      success:
        "bg-green-600 text-white shadow-xs hover:bg-green-700 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40",
      warning:
        "bg-yellow-600 text-white shadow-xs hover:bg-yellow-700 focus-visible:ring-yellow-500/20 dark:focus-visible:ring-yellow-500/40",
      info: "bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40",
      gradient:
        "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs hover:from-purple-700 hover:to-pink-700 focus-visible:ring-purple-500/20 dark:focus-visible:ring-purple-500/40",
      glass:
        "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xs hover:bg-white/20 focus-visible:ring-white/20",
      sport:
        "bg-orange-600 text-white shadow-xs hover:bg-orange-700 focus-visible:ring-orange-500/20 dark:focus-visible:ring-orange-500/40 font-semibold",
      toolbar:
        "!bg-transparent !text-black dark:!text-primary-foreground hover:!bg-grey-80 disabled:!text-grey dark:hover:!bg-grey-50",
      styles:
        "!bg-transparent !text-black dark:!text-primary-foreground hover:!bg-grey-80 disabled:!text-grey dark:hover:!bg-grey-50",
      ['styles-selected']:
        "!text-white dark:!text-primary-foreground hover:!bg-blue-700 disabled:!bg-grey-65 disabled:!text-grey",
      ["toolbar-selected"]:
        "!text-black dark:!text-primary-foreground !bg-grey-80 dark:!bg-grey-50",
      ["special-character-popover"]: cn(
        "!bg-transparent !border-secondary !text-secondary dark:!text-secondary-80 dark:!border-secondary-80 hover:!bg-secondary-95 dark:hover:!bg-secondary-30 disabled:!border-grey-60 disabled:!text-grey"
      ),

      ["context-menu"]:
        "!bg-transparent !text-grey-10 dark:!text-grey-95 hover:!bg-grey-90 dark:hover:!bg-grey-40 disabled:!text-grey-60 dark:disabled:!text-grey-70",

      ["button-icon"]:
        "!bg-transparent !text-black dark:!text-primary-foreground hover:!bg-grey-80 disabled:!text-grey dark:hover:!bg-grey-50",
      ["button-icon-destructive"]:
        "!bg-transparent !text-red-500 dark:!text-primary-foreground hover:!bg-grey-80 disabled:!text-grey dark:hover:!bg-grey-50",
    },
    size: {
      // Inherit all base sizes
      default: cn(
        buttonVariants({ size: "default" }),
        "[&>svg]:!h-4 [&>svg]:!w-4"
      ),
      sm: cn(
        "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        "[&>svg]:!h-5 [&>svg]:!w-5",
      ),
      xs: cn(
        "h-6 rounded-xs gap-1.5 px-3 !text-xs",
        "[&>svg]:!h-3.5 [&>svg]:!w-3.5"
      ),
      lg: cn(buttonVariants({ size: "lg" }), "[&>svg]:!h-5 [&>svg]:!w-5"),
      icon: cn(
        buttonVariants({ size: "icon" }),
        "p-1 [&>svg]:!h-6 [&>svg]:!w-6 !font-bold"
      ),
      ["icon-md"]: cn(
        buttonVariants({ size: "icon" }),
        "p-1 [&>svg]:!h-8 [&>svg]:!w-8 !font-bold"
      ),
      ["icon-sm"]: cn(
        buttonVariants({ size: "icon" }),
        "p-1 [&>svg]:!h-5 [&>svg]:!w-5 !font-bold"
      ),
      ["icon-xs"]: cn(
        buttonVariants({ size: "icon" }),
        "p-1 [&>svg]:!h-4 [&>svg]:!w-4 !font-bold"
      ),
      // Custom app sizes
      xl: "h-12 rounded-lg px-8 text-base font-semibold has-[>svg]:px-6 [&>svg]:!h-5 [&>svg]:!w-5",
      "2xl":
        "h-14 rounded-xl px-10 text-lg font-bold has-[>svg]:px-8 [&>svg]:!h-6 [&>svg]:!w-6",
      compact:
        "h-7 rounded px-2 text-xs font-medium has-[>svg]:px-1.5 [&>svg]:!h-3 [&>svg]:!w-3",
      ["dialog-footer-xs"]: cn(
        "h-6 rounded-xs gap-1.5 px-8 !text-xs",
        "[&>svg]:!h-3.5 [&>svg]:!w-3.5"
      ),
      ["rect-sm"]: cn(
        "h-6 w-6 rounded-xs gap-1.5 px-8 !text-xs",
        "[&>svg]:!h-3.5 [&>svg]:!w-3.5"
      ),
      ["context-menu-icon-xs"]: cn(
        buttonVariants({ size: "icon" }),
        "[&>svg]:!h-4 [&>svg]:!w-4 flex items-center justify-between gap-3 px-3 py-2 !text-sm"
      ),
    },
    rounded: {
      default: "rounded-md",
      none: "rounded-none",
      xs: "rounded-xs",
      sm: "rounded-sm",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
    shadow: {
      none: "shadow-none",
      sm: "shadow-sm",
      default: "shadow-xs",
      lg: "shadow-lg",
      xl: "shadow-xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    rounded: "default",
    shadow: "default",
  },
});

const AppButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & VariantProps<typeof appButtonVariants> & { asChild?: boolean }>(
  ({ className, variant, size, rounded, shadow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        data-slot="button"
        className={cn(appButtonVariants({ variant, size, rounded, shadow, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);


AppButton.displayName = 'AppButton'

export default memo(AppButton)
