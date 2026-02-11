import { forwardRef, memo, useCallback, useState } from 'react'
import AppInput from './app-input'
import { cn } from '@/lib/utils'

interface LinkInputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string, isValid: boolean) => void
  className?: string
  errorClassName?: string
  label?: string
  labelClassName?: string
  validateOnBlur?: boolean
  showErrorOnEmpty?: boolean
  customValidation?: (url: string) => string | null
}

function LinkInputComponent(
  {
    value,
    onChange,
    className,
    errorClassName,
    label,
    labelClassName,
    validateOnBlur = false,
    showErrorOnEmpty = false,
    customValidation,
    autoFocus = true,
    ...props
  }: LinkInputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateUrl = useCallback(
    (url: string): string | null => {
      // Empty value validation
      if (!url.trim()) {
        return showErrorOnEmpty ? 'URL is required' : null
      }

      // HTTPS validation
      if (!url.startsWith('https://')) {
        return 'URL must start with https://'
      }

      // Basic URL format validation
      try {
        const urlObj = new URL(url)
        if (urlObj.protocol !== 'https:') {
          return 'Only HTTPS protocol is allowed'
        }
      } catch {
        return 'Invalid URL format'
      }

      // Custom validation if provided
      if (customValidation) {
        return customValidation(url)
      }

      return null
    },
    [showErrorOnEmpty, customValidation]
  )

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      const validationError = validateUrl(newValue)

      if (!validateOnBlur || touched) {
        setError(validationError)
      }

      onChange(newValue, validationError === null)
    },
    [onChange, validateUrl, validateOnBlur, touched]
  )

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true)
      const validationError = validateUrl(event.target.value)
      setError(validationError)

      if (props.onBlur) {
        props.onBlur(event)
      }
    },
    [validateUrl, props]
  )

  const showError = error && (touched || !validateOnBlur)

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <AppInput
        ref={ref}
        type="url"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        className={cn(
          showError && 'border-destructive focus-visible:ring-destructive',
        )}
        placeholder="https://example.com"
        {...props}
      />
      {showError && (
        <span
          className={cn(
            'text-xs text-destructive',
            errorClassName
          )}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  )
}

export const AppLinkInput = memo(forwardRef(LinkInputComponent))

AppLinkInput.displayName = 'AppLinkInput'

