import { ActivationState, Client } from '@stomp/stompjs';
import { userAuthentication } from './base/auth';
import { mainLogger } from '../shared/logger';

let stompClient: Client | null = null;

const baseUrl = import.meta.env.VITE_API_BASE_URL
const brokerURL = import.meta.env.VITE_API_WS_URL

export const getDocumentAccess = (
    documentId: string
): Promise<Result<GetChatDocumentAccessSuccess, GetChatDocumentAccessError>> =>
    userAuthentication<GetChatDocumentAccessSuccess, GetChatDocumentAccessError>(async (token: string, user: User) => {
        const url = `${baseUrl}/chat/${documentId}/access/user/${user.id}`
        mainLogger.info("[CHAT_API]", `Get chat access from ${url}`);

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    let type: GetChatDocumentAccessError['type']
                    type = 'UNKNOWN_ERROR'
                    const error: GetChatDocumentAccessError = { type };
                    mainLogger.info("[CHAT_API]", `Get chat access error ${response.status}`);
                    resolve({ success: false, error });
                    return;
                }

                const responseData = await response.json() as GetChatDocumentAccessSuccess;
                mainLogger.info("[CHAT_API]", `Get chat access with success`);
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const getHistory = (
    documentId: string,
    page: number,
    size: number,
): Promise<Result<GetChatHistorySuccess, GetChatHistoryError>> =>
    userAuthentication<GetChatHistorySuccess, GetChatHistoryError>(async (token: string, user: User) => {
        const url = `${baseUrl}/chat/${documentId}/messages?userId=${user.id}&page=${page}&size=${size}`
        const taskId = mainLogger.startTask("[CHAT]", `Get history for user ${user.email} from url: ${url}`);

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    let type: GetChatHistoryError['type']
                    type = 'UNKNOWN_ERROR'
                    const error: GetChatHistoryError = { type };
                    resolve({ success: false, error });
                    mainLogger.error("[CHAT]", `Get history error ${error.type} ${response.status}`);
                    mainLogger.endTask(taskId, "[CHAT]", `Chat history retrieved with error`);
                    return;
                }

                const responseData = await response.json() as GetChatHistorySuccess;
                console.log(JSON.stringify(responseData))

                const mappedResponse = {
                    ...responseData,
                    content: responseData.content.map((message: ChatMessage) => ({
                        ...message,
                        senderUserId: message.senderUserId === user.id ? "CURRENT_USER" : message.senderUserId,
                    }))
                } satisfies GetChatHistorySuccess
                resolve({ success: true, data: mappedResponse });
                mainLogger.endTask(taskId, "[CHAT]", `Chat history retrieved`);
            }).catch(reject)
        })
    });

export const getParticipants = (
    documentId: string
): Promise<Result<GetChatParticipantsSuccess, GetChatParticipantsError>> =>
    userAuthentication<GetChatParticipantsSuccess, GetChatParticipantsError>(async (token: string) => {
        const url = `${baseUrl}/chat/${documentId}/participants`;
        mainLogger.info("[CHAT_API]", `Get chat partecipants from ${url}`);

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            }).then(async (response) => {
                if (!response.ok) {
                    let type: GetChatParticipantsError['type']
                    type = 'UNKNOWN_ERROR'
                    const error: GetChatParticipantsError = { type };
                    mainLogger.info("[CHAT_API]", `Get chat partecipants error ${response.status}`);
                    resolve({ success: false, error });
                    return;
                }

                const responseData = await response.json() as GetChatParticipantsSuccess;
                mainLogger.info("[CHAT_API]", `Get chat partecipants success`);
                resolve({ success: true, data: responseData });
            }).catch(reject)
        })
    });

export const connect = (
    event: Electron.IpcMainInvokeEvent
): Promise<Result<ConnectChatSuccess, ConnectChatError>> =>
    userAuthentication<ConnectChatSuccess, ConnectChatError>((token: string, user: User) => {
        const baseAuth = token.split(' ');
        const baseAuthToken = baseAuth[1];
        const baseAuthTokenDecoded = atob(baseAuthToken)
        const username = baseAuthTokenDecoded.split(':')[0]
        const password = baseAuthTokenDecoded.split(':')[1]

        const taskId = mainLogger.startTask("[WEBSOCKET]", `Connecting to websocket...`);

        return new Promise((resolve) => {
            if (stompClient?.active) {
                mainLogger.error("[WEBSOCKET]", "Stomp client is already active")
                return resolve({ success: true, data: true });
            }

            const client = new Client({
                brokerURL,
                connectHeaders: {
                    userId: user.id,
                    login: username,
                    passcode: password,
                    Authorization: token
                },
                reconnectDelay: 5000,
                onConnect: () => {
                    mainLogger.info("[WEBSOCKET]", "Stomp client connected")
                    stompClient = client;

                    if (!event.sender.isDestroyed()) {
                        event.sender.send('chat:connected');
                    }
                },
                onStompError: (frame) => {
                    const errorMsg = frame.headers['message'] || 'STOMP error';
                    mainLogger.error("[WEBSOCKET]", "Stomp client error: " + errorMsg)

                    if (!event.sender.isDestroyed()) {
                        event.sender.send('chat:error', errorMsg);
                    }
                },
                onWebSocketError: () => {
                    mainLogger.error("[WEBSOCKET]", "Websocket error")

                    if (!event.sender.isDestroyed()) {
                        event.sender.send('chat:error', 'WebSocket connection failed');
                    }
                },
                onDisconnect: () => {
                    stompClient = null;
                    mainLogger.info("[WEBSOCKET]", "Stomp client disconnected")

                    if (!event.sender.isDestroyed()) {
                        event.sender.send('chat:disconnected');
                    }
                },
                onChangeState: (state: ActivationState) => {
                    if (!event.sender.isDestroyed()) {
                        event.sender.send('chat:changeState', state);
                    }
                }
            });

            if (!event.sender.isDestroyed()) {
                event.sender.send('chat:connecting');
            }

            client.activate();
            mainLogger.endTask(taskId, "[WEBSOCKET]", `Connection initiated`);
            return resolve({ success: true, data: true });
        });
    });

export const disconnect = ():
    Promise<void> =>
    new Promise((resolve) => {
        if (stompClient?.active) {
            stompClient.deactivate();
            stompClient = null;
            mainLogger.info("[WEBSOCKET]", `Disconnecting to websocket...`);
            return resolve()
        }

        mainLogger.error("[WEBSOCKET]", "Websocket is already disconnected")
        return resolve()
    })

export const connected = ():
    Promise<boolean> =>
    new Promise((resolve) => {
        if (stompClient?.active) {
            mainLogger.info("[WEBSOCKET]", `Websocket is connected`);
            return resolve(true);
        }
        mainLogger.error("[WEBSOCKET]", "Websocket is not connected")
        return resolve(false);
    })

export const subscribe = (
    event: Electron.IpcMainInvokeEvent,
    documentId: string,
): Promise<Result<SubscribeChatChannelSuccess, SubscribeChatChannelError>> =>
    userAuthentication<SubscribeChatChannelSuccess, SubscribeChatChannelError>((_, user: User) => {
        const topic = `/topic/${documentId}`;
        const taskId = mainLogger.startTask("[WEBSOCKET]", `Subscribing to topic ${topic}`);

        return new Promise((resolve) => {

            if (!stompClient?.active) {
                const error = {
                    type: "UNCONNECTED_WEBSOCKET"
                } satisfies SubscribeChatChannelError;
                mainLogger.error("[WEBSOCKET]", "Stomp client is not activated")
                return resolve({ success: false, error })
            }

            stompClient.subscribe(topic, (message) => {
                const chatMessage = JSON.parse(message.body) as ChatMessage;
                mainLogger.debug("[WEBSOCKET]", `Message received: ${message}`)

                if (chatMessage.senderUserId !== user.id) {
                    if (!event.sender.isDestroyed()) {
                        event.sender.send('chat:message', chatMessage);
                    }
                }
            });

            mainLogger.endTask(taskId, "[WEBSOCKET]", `Subscribed to topic ${topic}`);
            return resolve({ success: true, data: true })
        })
    })

export const unsubscribe = (
    documentId: string,
): Promise<Result<UnsubscribeChatChannelSuccess, UnsubscribeChatChannelError>> =>
    userAuthentication<UnsubscribeChatChannelSuccess, UnsubscribeChatChannelError>(() => {
        const topic = `/topic/${documentId}`;
        const taskId = mainLogger.startTask("[WEBSOCKET]", `Unsubscribing to topic ${topic}`);

        return new Promise((resolve) => {
            if (!stompClient?.active) {
                const error = {
                    type: "UNCONNECTED_WEBSOCKET"
                } satisfies SubscribeChatChannelError;
                mainLogger.error("[WEBSOCKET]", "Stomp client is not activated")
                return resolve({ success: false, error })
            }

            stompClient.unsubscribe(topic);
            mainLogger.endTask(taskId, "[WEBSOCKET]", `Unsubscribed to topic ${topic}`);
            return resolve({ success: true, data: true })
        })
    })

export const sendMessage = (
    documentId: string,
    message: string,
    reference: string | null,
): Promise<Result<SendMessageChatSuccess, SendMessageChatError>> =>
    userAuthentication<SendMessageChatSuccess, SendMessageChatError>((_, user: User) => {
        const destination = `/chat-app/send/${documentId}`;
        const taskId = mainLogger.startTask("[WEBSOCKET]", `Publish message to ${destination}`);

        return new Promise((resolve) => {
            if (!stompClient?.active) {
                const error = {
                    type: "UNCONNECTED_WEBSOCKET"
                } satisfies SendMessageChatError;
                mainLogger.error("[WEBSOCKET]", "Stomp client is not activated")
                return resolve({ success: false, error })
            }

            const messageBody = {
                documentId,
                userId: user.id,
                senderDisplayName: user.firstname + ' ' + user.lastname,
                text: message.trim(),
                documentText: reference,
            };

            try {
                stompClient.publish({
                    destination,
                    headers: {
                        userId: user.id
                    },
                    body: JSON.stringify(messageBody)
                });

                mainLogger.endTask(taskId, "[WEBSOCKET]", `Published message to ${destination}`);

                const returnMessage = {
                    chatId: crypto.randomUUID(),
                    documentId,
                    senderUserId: "CURRENT_USER",
                    senderDisplayName: user.firstname,
                    senderInitials: (user.firstname + ' ' + user.lastname).split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2),
                    text: message.trim(),
                    documentText: reference,
                    timestamp: new Date().toISOString(),
                    formattedTime: "",
                    eventType: "MESSAGE_SENT",
                } satisfies ChatMessage

                return resolve({ success: true, data: returnMessage })
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Failed to send message';
                mainLogger.error("[WEBSOCKET]", `Publish error: ${errorMsg}`);

                const sendError = {
                    type: "UNCONNECTED_WEBSOCKET"
                } satisfies SendMessageChatError;

                return resolve({ success: false, error: sendError })
            }
        })
    });

export const deleteMessage = (
    documentId: string,
    message: string,
    reference: string | null,
): Promise<Result<SendMessageChatSuccess, SendMessageChatError>> =>
    userAuthentication<SendMessageChatSuccess, SendMessageChatError>((_, user: User) => {
        const destination = `/chat-app/delete/${documentId}`;
        const taskId = mainLogger.startTask("[WEBSOCKET]", `Publish message to ${destination}`);

        return new Promise((resolve) => {
            if (!stompClient?.active) {
                const error = {
                    type: "UNCONNECTED_WEBSOCKET"
                } satisfies SendMessageChatError;
                mainLogger.error("[WEBSOCKET]", "Stomp client is not activated")
                return resolve({ success: false, error })
            }

            const messageBody = {
                documentId,
                userId: user.id,
                senderDisplayName: user.firstname + ' ' + user.lastname,
                text: message.trim(),
                documentText: reference,
            };

            try {
                stompClient.publish({
                    destination,
                    headers: {
                        userId: user.id
                    },
                    body: JSON.stringify(messageBody)
                });

                mainLogger.endTask(taskId, "[WEBSOCKET]", `Published message to ${destination}`);

                const returnMessage = {
                    chatId: crypto.randomUUID(),
                    documentId,
                    senderUserId: "CURRENT_USER",
                    senderDisplayName: user.firstname,
                    senderInitials: (user.firstname + ' ' + user.lastname).split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2),
                    text: message.trim(),
                    documentText: reference,
                    timestamp: new Date().toISOString(),
                    formattedTime: "",
                    eventType: "MESSAGE_SENT",
                } satisfies ChatMessage

                return resolve({ success: true, data: returnMessage })
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Failed to send message';
                mainLogger.error("[WEBSOCKET]", `Publish error: ${errorMsg}`);

                const sendError = {
                    type: "UNCONNECTED_WEBSOCKET"
                } satisfies SendMessageChatError;

                return resolve({ success: false, error: sendError })
            }
        })
    });
