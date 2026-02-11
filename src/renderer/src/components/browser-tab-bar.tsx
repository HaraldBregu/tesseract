import { AnimatePresence, motion, Reorder } from 'framer-motion'
import PlusSimple from './icons/PlusSimple'
import Close from './icons/Close'
import { cn } from '@/lib/utils'
import Unlocked from './icons/Unlocked'
import { memo, useCallback, useRef, useEffect } from 'react'
import AccountButton from './account_button'
import NotificationButton from './notification_button'

interface Props {
  item: TabInfo
  isSelected: boolean
  onClick: () => void
  onRemove: () => void
}

const BrowserTab = ({ item, onClick, onRemove, isSelected }: Props) => {
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((event) => {
    if (event.button === 1) {
      event.preventDefault();
      onRemove();
    } else {
      onClick();
    }
  }, [])

  const handleTabMouseEnter = useCallback((_: React.MouseEvent, tab: TabInfo) => {
    // Clear any existing timeout to prevent multiple tooltips
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    if (window.tooltip?.hide) {
      window.tooltip.hide().catch(() => { });
    } else if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.invoke('tooltip:hide').catch(() => { });
    }

    // Capture the position immediately while the event is valid
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const x = window.screenX + rect.left;

    const y = window.screenY + rect.y + rect.height + 25;

    // Add delay like Chrome (500ms)
    tooltipTimeoutRef.current = setTimeout(() => {

      // Try different approaches to call tooltip
      if (window.tooltip && typeof window.tooltip.show === 'function') {
        window.tooltip.show(x, y, tab.name).then(() => {
        }).catch(err => {
          console.error('❌ Error from tooltip.show:', err);
        });
      } else if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.invoke('tooltip:show', { x, y, text: tab.name }).then(() => {
        }).catch(err => {
          console.error('❌ Error from ipcRenderer.invoke:', err);
        });
      }

      tooltipTimeoutRef.current = null; // Clear the ref after use
    }, 500);
  }, []);

  const handleTabMouseLeave = useCallback(() => {
    // Clear timeout to prevent showing
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    // Hide tooltip immediately
    if (window.tooltip && typeof window.tooltip.hide === 'function') {
      window.tooltip.hide().catch(err => {
        console.error('Error hiding tooltip:', err);
      });
    } else if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.invoke('tooltip:hide').catch(err => {
        console.error('Error hiding tooltip via ipcRenderer:', err);
      });
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const getTitle = useCallback((item: TabInfo) => {
    return item.changed ? ' * ' + item.name : item.name
  }, [])

  return (
    <Reorder.Item
      value={item}
      ref={ref as unknown as React.RefObject<HTMLLIElement>}
      id={item.id.toString()}
      initial={{
        opacity: 1,
        y: 30
      }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.1,
          ease: 'easeInOut'
        }
      }}
      exit={{
        opacity: 0,
        y: 20,
        transition: {
          duration: 0.15
        }
      }}
      whileDrag={{
        transition: {
          ease: 'easeInOut'
        }
      }}
      className={cn(
        'rounded-t-md border-t border-l border-r',
        'titlebar-button',
        'relative cursor-pointer flex items-center overflow-hidden select-none',
        "mr-1 h-[30px] min-w-[10px] max-w-[220px] flex-1",
        isSelected
          ? 'selected bg-background z-[60] border-border  dark:bg-grey-20 dark:border-grey-50'
          : 'bg-muted border-b border-border dark:border-grey-50 z-[70]',
      )}
      onPointerDown={handleClick}
      onPointerEnter={(e) => handleTabMouseEnter(e, item)}
      onPointerLeave={handleTabMouseLeave}
    >
      <motion.div className='flex flex-row items-center h-full w-full border-b border-border px-2 dark:border-grey-50'>
        <motion.div
          layout
          className="flex align-center items-center mr-1 flex-shrink-0"
        >
          <Unlocked className={cn("w-4 h-4")} />
        </motion.div>
        <motion.span
          style={{
            maskImage: 'linear-gradient(to left, transparent 30px, #fff 60px)',
            WebkitMaskImage: 'linear-gradient(to left, transparent 30px, #fff 60px)',
          }}
          className={cn(
            `text-xs text-left flex-shrink flex-grow leading-[18px] whitespace-nowrap block min-w-0 pr-[30px]`,
            isSelected ? 'text-foreground' : 'text-muted-foreground'
          )}
          layout="position"
        >
          <div>
            {isSelected
              ? <strong>{getTitle(item)}</strong>
              : getTitle(item)}
          </div>
        </motion.span>
        <motion.div
          layout
          className="absolute top-0 bottom-0 right-[0px] flex align-center items-center justify-end flex-shrink-0 pr-2"
        >
          <motion.button
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
              setTimeout(() => {
                handleTabMouseLeave()
              }, 500)
            }}
            initial={false}
            animate={{
              backgroundColor: 'transparent'
            }}
            whileHover={{
              backgroundColor: 'hsl(var(--accent))',
              scale: 1.1,
              transition: { duration: 0.2 }
            }}
            className="rounded-full p-[2px]"
          >
            <Close className={cn("w-4 h-4")} />
          </motion.button>
        </motion.div>
      </motion.div>
    </Reorder.Item>
  )
}

const BrowserTabMemo = memo(BrowserTab)

interface BrowserTabBarProps {
  tabs: TabInfo[]
  selectedTab: TabInfo | null
  onAdd: () => void
  onSelect: (tab: TabInfo) => void
  onRemove: (tab: TabInfo) => void
  onReorder: (tabs: TabInfo[]) => void
  isLoggedIn?: boolean
  user?: { firstname: string; lastname: string; email?: string; institution?: string } | null
  unreadNotificationsCount?: number
  onNotificationClick?: () => void
}

const BrowserTabBar = ({
  tabs,
  selectedTab,
  onAdd,
  onSelect,
  onRemove,
  onReorder,
  isLoggedIn = false,
  user = null,
  unreadNotificationsCount = 0,
  onNotificationClick = () => {},
}: BrowserTabBarProps) => {
  return (
    <div className="h-[32px] w-full flex flex-row titlebar justify-end border-t relative bg-white dark:bg-grey-30">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-grey-80 dark:bg-grey-50 pointer-events-none"></div>
      <div className="flex flex-row items-start w-full overflow-hidden">
        <div className="w-full h-full">
          <div className="flex flex-row w-full flex-grow px-2 bg-muted dark:bg-grey-30">
            <div className="flex flex-row w-full justify-between items-center h-full pr-2">
              <div className="flex-1 min-w-0 h-full flex items-end">
                <Reorder.Group
                  as="ul"
                  axis="x"
                  onReorder={onReorder}
                  className="flex-row flex-nowrap flex justify-start items-end h-full w-full border-b border-grey-80 dark:border-grey-50 dark:bg-grey-30"
                  values={tabs}
                >
                  <AnimatePresence initial={false}>
                    {tabs.map((item) => (
                      <BrowserTabMemo
                        key={item.id}
                        item={item}
                        isSelected={selectedTab?.id === item.id}
                        onClick={() => onSelect(item)}
                        onRemove={() => {
                          onRemove(item)
                        }}
                      />
                    ))}
                    <div className="flex items-center h-[32px]">
                      <motion.button
                        className="w-[24px] h-[24px] flex items-center justify-center hover:bg-grey-95 dark:hover:bg-grey-50 rounded-full transition-all duration-300"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onAdd()}
                      >
                        <PlusSimple className="w-4 h-4" color="currentColor" />
                      </motion.button>
                    </div>
                  </AnimatePresence>
                </Reorder.Group>
              </div>
              <div className="flex items-center gap-1">
                <NotificationButton
                  isLoggedIn={isLoggedIn}
                  unreadCount={unreadNotificationsCount}
                  onClick={onNotificationClick}
                />
                <AccountButton
                  isLoggedIn={isLoggedIn}
                  user={user}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(BrowserTabBar)
