import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ChatMessageBubbleListProps {
    className?: string
    messages: ChatMessage[]
}
const ChatMessageBubbleList = forwardRef<HTMLDivElement, ChatMessageBubbleListProps>(
    ({ className, messages }, ref) => {

        const scrollRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => scrollRef.current as HTMLDivElement);

        useEffect(() => {
            if (messages.length > 0 && scrollRef.current) {
                const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollElement) {
                    scrollElement.scrollTop = scrollElement.scrollHeight;
                }
            }
        }, [messages.length]);

        return (
            <ScrollArea
                ref={scrollRef}
                className={className}>
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.chatId}
                            className="space-y-1">
                            {msg.senderUserId !== 'CURRENT_USER' && (
                                <div className="flex items-baseline gap-2">
                                    <span className="font-semibold text-sm">{msg.senderDisplayName}</span>
                                </div>
                            )}
                            <div
                                className={cn(
                                    "rounded-lg p-2 w-fit max-w-[85%]",
                                    msg.senderUserId === 'CURRENT_USER'
                                        ? 'bg-blue-700 text-primary-foreground ml-auto'
                                        : 'bg-muted text-foreground'
                                )}>
                                {msg.documentText && msg.documentText.length > 0 && <div
                                    className={cn(
                                        "rounded-md p-2 w-fit mb-2 border-l-4 border-black",
                                        msg.senderUserId === 'CURRENT_USER'
                                            ? 'bg-black/30 text-primary-foreground'
                                            : 'bg-white/80 text-foreground'
                                    )}>
                                    <p className="text-sm break-words">{msg.documentText}</p>
                                </div>}
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                            <div
                                className={cn(
                                    "text-xs text-muted-foreground",
                                    msg.senderUserId === 'CURRENT_USER' && "ml-auto w-fit max-w-[85%]"
                                )}>
                                {msg.timestamp ?
                                    format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm:ss') :
                                    format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        )
    }
)

ChatMessageBubbleList.displayName = 'ChatMessageBubbleList'

export default ChatMessageBubbleList