import { AppDialogDescription } from "@/components/app/app-dialog"
import { cn } from "@/lib/utils"
import { t } from "i18next"
import { memo, useCallback, useEffect, useRef } from "react"
import AppButton from "@/components/app/app-button"
import IconClose from "@/components/app/icons/IconClose"
import { AppChatDialog, AppChatDialogContent, AppChatDialogHeader, AppChatDialogTitle } from "@/components/app/app-chat-dialog"
import ChatMessageInput from "./components/chat/chat-message-input"
import ChatPartecipantList from "./components/chat/chat-partecipant-list"
import ChatMessageBubbleList from "./components/chat/chat-message-bubble-list"
import { useDispatch, useSelector } from "react-redux"
import { selectAccessLoading, selectCurrentUserAccess, selectMessages, selectParticipants } from "./store/chat/selector"
import { addMessage, getHistory, getPartecipants, filterMessages, getDocumentAccess } from "./store/chat/slice"
import IconMinusSimple from "@/components/app/icons/IconMinusSimple"
import { Badge } from "@/components/ui/badge"
import { useWebSocket, WebSocketState } from "../../hooks/use-websocket"
import { rendererLogger } from "@/utils/logger"
import { useEditor } from "./hooks/use-editor"
import { closeChat, minimizeChat, openChat, setChatReference } from "./provider/actions/chat"
import ChatMessageFilter from "./components/chat/chat-message-filter"
import ChatConnectionStatusBar from "./components/chat/chat-connection-status-bar"
import { Loader2, MessageCircle } from "lucide-react"


interface ChatProps {
    readonly documentId: string
}
const Chat = ({
    documentId,
}: ChatProps) => {
    const dispatch = useDispatch();
    const partecipants = useSelector(selectParticipants);
    const [state, action] = useEditor()

    const webSocket = useWebSocket({
        onConnecting: () => { },
        onConnected: () => { },
        onDisconnected: () => { },
        onChangeState: () => { },
        onMessage: (message: ChatMessage) => {
            dispatch(addMessage(message));
        },
    })

    const reconnectToWebsocket = useCallback(() => {
        setTimeout(() => {
            webSocket.connect()
        }, 500)
    }, [webSocket])

    const subscribeToChannel = useCallback(() => {
        if (!documentId)
            return;

        setTimeout(() => {
            webSocket.subscribe(documentId)
        }, 500)
    }, [webSocket])

    useEffect(() => {
        switch (webSocket.state) {
            case "CONNECTING":
                break;
            case "CONNECTED":
                subscribeToChannel()
                break;
            case "DISCONNECTED":
            case "ERROR":
                reconnectToWebsocket()
                break;
        }
    }, [webSocket.state])

    const sendMessage = useCallback((message: string, reference: string | null) => {
        if (!documentId) {
            rendererLogger.error("USE_CHAT", "No document ID");
            return;
        }

        webSocket
            .sendMessage(documentId, message, reference)
            .then((response) => {
                if (!response.success) {
                    rendererLogger.error("USE_CHAT", "Failed to send message: " + response.error.type);
                    return;
                }

                rendererLogger.debug("USE_CHAT", "Sending message: " + JSON.stringify(response.data))
                dispatch(addMessage({
                    ...response.data,
                    senderUserId: "CURRENT_USER"
                }));
                action(setChatReference(null))

            })
    }, [webSocket, dispatch, documentId])

    useEffect(() => {
        dispatch(getDocumentAccess({ documentId }))
    }, [state.chatState])

    if (state.chatState === "MINIMIZED") {
        return <MinimizedChat />
    }

    if (state.chatState === "OPENED") {
        return <OpenedChat
            // onConnect={() => {
            //     webSocket.connect()
            // }}
            // onDisConnect={() => {
            //     webSocket.disconnect()
            // }}
            // onSubscribeToChannel={() => {
            //     if (!documentId)
            //         return
            //     webSocket.subscribe(documentId)
            // }}
            connectionState={webSocket.state}
            partecipants={partecipants || []}
            onSend={sendMessage}
        />
    }

    return null
}

export default memo(Chat)

interface OpenedChatProps {
    readonly connectionState: WebSocketState;
    readonly partecipants: ChatParticipant[]
    readonly onSend: (message: string, reference: string | null) => void
    // readonly onConnect: () => void
    // readonly onDisConnect: () => void
    // readonly onSubscribeToChannel: () => void
}
const OpenedChat = ({
    connectionState,
    partecipants,
    onSend,
    // onConnect,
    // onDisConnect,
    // onSubscribeToChannel,
}: OpenedChatProps) => {
    const dispatch = useDispatch()
    const accessLoading = useSelector(selectAccessLoading);
    const currentUserAccess = useSelector(selectCurrentUserAccess);
    const filteredMessages = useSelector(selectMessages)
    const [state, action] = useEditor()

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        (async () => {
            const document = await globalThis.doc.getDocument();
            const documentId = document.id
            dispatch(getPartecipants({ documentId }))
            dispatch(getHistory({ documentId }))
        })()
    }, [])

    return (
        <AppChatDialog
            open={true}
            modal={false}>
            <AppChatDialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={cn("max-w-lg h-[90vh] flex flex-col")}>
                <AppChatDialogHeader
                    onDoubleClick={() => action(minimizeChat())}
                    className="bg-blue-600 text-primary-foreground px-4 py-1 rounded-t-md">
                    <div className="flex items-center justify-between w-full">
                        <AppChatDialogTitle>
                            <MessageCircle className="h-5 w-5" />
                            {t("Chat")}
                        </AppChatDialogTitle>
                        <div className="flex items-center gap-1">
                            {/* <AppButton
                                className="bg-transparent hover:bg-transparent"
                                variant="default"
                                size="icon-md"
                                onClick={onConnect}>
                                Connect
                            </AppButton>
                            <AppButton
                                className="bg-transparent hover:bg-transparent"
                                variant="default"
                                size="icon-md"
                                onClick={onDisConnect}>
                                DisConnect
                            </AppButton>
                            <AppButton
                                className="bg-transparent hover:bg-transparent"
                                variant="default"
                                size="icon-md"
                                onClick={onSubscribeToChannel}>
                                Subscribe
                            </AppButton> */}
                            <AppButton
                                className="bg-transparent hover:bg-transparent"
                                variant="default"
                                size="icon-md"
                                onClick={() => action(minimizeChat())}>
                                <IconMinusSimple />
                            </AppButton>
                            <AppButton
                                className="bg-transparent hover:bg-transparent"
                                variant="default"
                                size="icon-md"
                                onClick={() => action(closeChat())}>
                                <IconClose />
                            </AppButton>
                        </div>
                    </div>
                    <AppDialogDescription />
                </AppChatDialogHeader>

                <ChatConnectionStatusBar
                    connectionState={connectionState}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {accessLoading && (
                        <div className="flex flex-col items-center justify-center flex-1">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            <p className="text-xs text-muted-foreground mt-3">
                                {t("Loading chat")}
                            </p>
                        </div>
                    )}

                    {!accessLoading && !currentUserAccess?.canAccess && (
                        <div className="flex flex-col items-center justify-center flex-1 px-6">
                            <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground text-center">
                                {t("chat.accessDenied", "You do not have access to this chat")}
                            </p>
                        </div>
                    )}

                    {!accessLoading && currentUserAccess?.canAccess && (
                        <>
                            <ChatMessageFilter
                                partecipants={partecipants}
                                onFilter={(searchText, senderUserId, dateFrom) => {
                                    dispatch(filterMessages({ searchText, senderUserId, dateFrom, }))
                                }}
                            />

                            <ChatMessageBubbleList
                                ref={scrollRef}
                                className="flex-1 p-4"
                                messages={filteredMessages}
                            />

                            <ChatMessageInput
                                disabled={connectionState !== "CONNECTED"}
                                reference={state.chatTextReference}
                                onSend={onSend}
                                onRemoveReference={() => {
                                    action(setChatReference(null))
                                }}
                            />

                            <ChatPartecipantList
                                partecipants={partecipants}
                            />
                        </>
                    )}
                </div>

            </AppChatDialogContent>
        </AppChatDialog>
    )
}

const MinimizedChat = () => {
    const messages = useSelector(selectMessages)
    const [, action] = useEditor()

    return (
        <div className="fixed bottom-12 right-6 z-50">
            <button
                onClick={() => {
                    action(openChat())
                }}
                className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center text-white transition-all duration-200"
                title="Open chat"
                aria-label="Open chat">
                <MessageCircle className="h-6 w-6" />
            </button>
            {messages.length > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full p-0 text-xs">
                    {messages.length > 99 ? '99+' : messages.length}
                </Badge>
            )}
        </div>
    )
}
