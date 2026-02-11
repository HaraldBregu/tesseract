import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import IconNotifications from './app/icons/IconNotifications'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

interface NotificationButtonProps {
    isLoggedIn: boolean
    unreadCount?: number
    onClick: () => void
}

const NotificationButton = ({
    isLoggedIn,
    unreadCount = 0,
    onClick,
}: NotificationButtonProps) => {
    const { t } = useTranslation()

    const handleClick = useCallback(() => {
        if (isLoggedIn) {
            onClick()
        }
    }, [isLoggedIn, onClick])

    const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString()

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.button
                    className={cn(
                        "relative flex items-center justify-center",
                        "w-[26px] h-[26px] rounded-full",
                        "transition-colors duration-200",
                        isLoggedIn
                            ? "hover:bg-grey-95 dark:hover:bg-grey-50 cursor-pointer"
                            : "opacity-50 cursor-not-allowed"
                    )}
                    whileTap={isLoggedIn ? { scale: 0.95 } : undefined}
                    onClick={handleClick}
                    disabled={!isLoggedIn}
                    aria-label={t('toolbar.notifications')}
                >
                    <IconNotifications className="w-4 h-4" />
                    {unreadCount > 0 && isLoggedIn && (
                        <span
                            className={cn(
                                "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                                "min-w-[14px] h-[14px] px-0.5 rounded-full",
                                "bg-red-500 text-white text-[8px] font-semibold",
                                "pointer-events-none"
                            )}
                        >
                            {displayCount}
                        </span>
                    )}
                </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={5}>
                <p>{t('toolbar.notifications')}</p>
            </TooltipContent>
        </Tooltip>
    )
}

export default memo(NotificationButton)
