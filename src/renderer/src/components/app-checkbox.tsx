import * as React from 'react'
import { Checkbox } from '@components/ui/checkbox'
import { cn } from '@/lib/utils'
import Typography from './Typography';

interface AppCheckboxProps {
  label?: string,
  id?: string,
  checked?: boolean,
  disabled?: boolean,
  className?: string,
  labelClassName?: string,
  containerClassName?: string,
  onCheckedChange?: (checked: boolean) => void,
}

const AppCheckbox = React.forwardRef<HTMLButtonElement, AppCheckboxProps>(
  ({ containerClassName, label, checked = false, disabled = false, className, onCheckedChange, labelClassName, id }, ref) => {
    return (
      <div className={`flex items-center space-x-2 ${containerClassName}`}>
        <Checkbox
          ref={ref}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          className={cn(
            'h-5 w-5 rounded-md',
            {
              "data-[state=checked]:bg-grey-70 data-[state=checked]:border-grey-70 data-[state=checked]:text-grey-30": disabled
            },
            className
          )}
          id={id}
        />
        {label && (
          <Typography
            component="label"
            className={cn('ml-1', { "cursor-not-allowed opacity-70": disabled }, labelClassName)}
            htmlFor={id}
          >
            {label}
          </Typography>
        )}
      </div>
    )
  }
)

AppCheckbox.displayName = 'AppCheckbox'

export default AppCheckbox