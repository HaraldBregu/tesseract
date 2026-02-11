import { WebSocketState } from "@/hooks/use-websocket";
import cn from "@/utils/classNames";

interface ChatConnectionStatusBarProps {
    readonly connectionState: WebSocketState;
}
const ChatConnectionStatusBar = ({
    connectionState,
}: ChatConnectionStatusBarProps) => {

    if (connectionState === "DISCONNECTED") {
        return (
            <div className={cn(
                "px-2 py-[2px] font-medium flex items-center gap-2 transition-colors",
                "bg-yellow-500",
            )} />
        )
    }

    if (connectionState === "ERROR") {
        return (
            <div className={cn(
                "px-2 py-[2px] flex items-center gap-2 transition-colors",
                "bg-red-500",
            )} />
        )
    }

    return null;
}

ChatConnectionStatusBar.displayName = 'ChatConnectionStatusBar'

export default ChatConnectionStatusBar;