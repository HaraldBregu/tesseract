import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface NavigatableListProps<T> {
  items: T[]
  onSelect: (item: T, index: number) => void
  renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode
  className?: string
  itemClassName?: string
  selectedItemClassName?: string
  onNavigate?: (index: number) => void
  onEscape?: () => void
  onEnter?: (item: T, index: number) => void
  initialSelectedIndex?: number
  autoFocus?: boolean
  keyboardEnabled?: boolean
}

function NavigatableListComponent<T>({
  items,
  onSelect,
  renderItem,
  className,
  itemClassName,
  selectedItemClassName,
  onNavigate,
  onEscape,
  onEnter,
  initialSelectedIndex = 0,
  autoFocus = true,
  keyboardEnabled = true
}: NavigatableListProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Auto focus container on mount if enabled
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      containerRef.current.focus()
    }
  }, [autoFocus])

  // Reset selected index when items change
  useEffect(() => {
    if (items.length > 0 && selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1))
    }
  }, [items.length, selectedIndex])

  // Scroll selected item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [selectedIndex])

  // Notify parent of navigation changes
  useEffect(() => {
    if (onNavigate && items.length > 0) {
      onNavigate(selectedIndex)
    }
  }, [selectedIndex, onNavigate, items.length])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!keyboardEnabled || items.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
          break

        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break

        case 'Enter':
          event.preventDefault()
          if (items[selectedIndex]) {
            if (onEnter) {
              onEnter(items[selectedIndex], selectedIndex)
            } else {
              onSelect(items[selectedIndex], selectedIndex)
            }
          }
          break

        case 'Home':
          event.preventDefault()
          setSelectedIndex(0)
          break

        case 'End':
          event.preventDefault()
          setSelectedIndex(items.length - 1)
          break

        case 'Escape':
          event.preventDefault()
          if (onEscape) {
            onEscape()
          }
          break

        default:
          break
      }
    },
    [keyboardEnabled, items, selectedIndex, onSelect, onEscape, onEnter]
  )

  const handleItemClick = useCallback(
    (index: number) => {
      setSelectedIndex(index)
      onSelect(items[index], index)
    },
    [items, onSelect]
  )

  if (items.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={cn('outline-none', className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
      aria-activedescendant={`item-${selectedIndex}`}
    >
      {items.map((item, index) => {
        const isSelected = index === selectedIndex

        return (
          <div
            key={index}
            id={`item-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            className={cn(
              'cursor-pointer transition-colors',
              itemClassName,
              isSelected && cn('bg-accent', selectedItemClassName)
            )}
            onClick={() => handleItemClick(index)}
            role="option"
            aria-selected={isSelected}
          >
            {renderItem(item, index, isSelected)}
          </div>
        )
      })}
    </div>
  )
}

export const AppNavigatableList = memo(NavigatableListComponent) as <T>(
  props: NavigatableListProps<T>
) => React.ReactElement

