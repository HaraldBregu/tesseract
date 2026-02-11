import { motion } from 'framer-motion'
import Account from './icons/Account'
import { cn } from '@/lib/utils'
import { memo, useCallback } from 'react'

interface UserData {
    firstname: string
    lastname: string
    email?: string
    institution?: string
}

interface AccountButtonProps {
    isLoggedIn: boolean
    user?: UserData | null
}

function getInitials(firstname: string, lastname: string): string {
    const nameInitial = firstname.charAt(0).toUpperCase()
    const surnameInitial = lastname.charAt(0).toUpperCase()
    return `${nameInitial}${surnameInitial}`
}

const AccountButton = ({
    isLoggedIn,
    user,
}: AccountButtonProps) => {
    const handleClick = useCallback(() => {
        globalThis.electron.ipcRenderer.send('toggle-account-panel')
    }, [])

    const initials = isLoggedIn && user ? getInitials(user.firstname, user.lastname) : ''

    return (
        <div className="relative flex items-center justify-center h-full px-1 gap-1">
            <motion.button
                className={cn(
                    "h-[24px] flex items-center justify-center rounded-full transition-all duration-300 flex-shrink-0 gap-1.5 border border-border",
                    isLoggedIn
                        ? "hover:bg-white dark:hover:bg-grey-50 pl-[2px]"
                        : "w-[24px] hover:bg-white dark:hover:bg-grey-50"
                )}
                whileTap={{ scale: 0.95 }}
                onClick={handleClick}
            >
                {isLoggedIn && user ? (
                    <>
                        <span className="w-[20px] h-[20px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px] font-semibold leading-none select-none">
                            {initials}
                        </span>
                        {/* <span className="text-[10px] font-medium leading-none select-none text-foreground px-2 py-1 rounded-full">
                            {user.firstname} {user.lastname}
                        </span> */}
                    </>
                ) : (
                    <Account className="w-4 h-4" color="currentColor" />
                )}
            </motion.button>
        </div>
    )
}

export default memo(AccountButton)
