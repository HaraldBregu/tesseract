import AppButton from "@/components/app/app-button"
import AppInput from "@/components/app/app-input"
import { Send, X } from "lucide-react"
import { useState, useCallback } from "react"

interface ChatMessageInputProps {
    readonly disabled: boolean;
    readonly reference: string | null
    readonly onSend: (message: string, reference: string | null) => void
    readonly onRemoveReference: () => void
}
const ChatMessageInput = ({
    disabled,
    reference,
    onSend,
    onRemoveReference,
}: ChatMessageInputProps) => {
    const [inputValue, setInputValue] = useState("")

    const handleSendMessage = useCallback((e) => {
        e?.preventDefault()

        if (!inputValue.trim())
            return

        onSend(inputValue, reference)
        setInputValue('')
    }, [inputValue, reference])

    return (
        <div className="border-t p-3 bg-background">
            {reference ? <div className="flex items-start justify-between gap-2 mb-2 rounded-md p-3 bg-primary/10 border-l-4 border-primary shadow-sm">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary mb-1">Document reference</p>
                    <p className="text-sm break-words text-foreground line-clamp-2">
                        {reference}
                    </p>
                </div>
                <AppButton
                    type="button"
                    size="icon-sm"
                    variant="transparent"
                    onClick={onRemoveReference}>
                    <X className="h-4 w-4" />
                </AppButton>
            </div> : null}
            <form
                onSubmit={handleSendMessage}
                className="flex gap-2">
                <AppInput
                    type="text"
                    placeholder=">|"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1"
                    autoFocus={false}
                />
                <AppButton
                    type="submit"
                    size="icon-sm"
                    variant="default"
                    rounded="default"
                    className="px-3"
                    disabled={!inputValue.trim() || disabled}>
                    <Send />
                </AppButton>
            </form>
        </div>
    );
}

ChatMessageInput.displayName = 'ChatMessageInput'

export default ChatMessageInput