import { rendererLogger } from '@/utils/logger';
import { useEffect, useRef, useState } from 'react';


export type WebSocketState = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR"

export interface UseWebSocketReturn {
  state: WebSocketState;
  connect: () => void;
  disconnect: () => void;
  subscribe: (documentId: string) => void
  sendMessage: (documentId: string, message: string, reference: string | null) => Promise<Result<SendMessageChatSuccess, SendMessageChatError>>;
  onMessage: (callback: (message: ChatMessage) => void) => () => void
  onChangeState: (callback: (state: ChatState) => void) => () => void
}

interface UseWebSocketProps {
  onConnecting?: () => void
  onConnected?: () => void
  onError?: () => void
  onDisconnected?: () => void
  onChangeState?: (state: ChatState) => void
  onMessage?: (message: ChatMessage) => void
}
export const useWebSocket = ({
  onConnecting,
  onConnected,
  onError,
  onDisconnected,
  onChangeState,
  onMessage,
}: UseWebSocketProps = {}): UseWebSocketReturn => {
  const onConnectingRef = useRef(onConnecting);
  const onConnectedRef = useRef(onConnected);
  const onErrorRef = useRef(onError);
  const onDisconnectedRef = useRef(onDisconnected);
  const onChangeStateRef = useRef(onChangeState);
  const onMessageRef = useRef(onMessage);

  const [webSocketState, setWebSocketState] = useState<WebSocketState>("DISCONNECTED")

  useEffect(() => {
    onConnectingRef.current = onConnecting;
    onConnectedRef.current = onConnected;
    onErrorRef.current = onError;
    onDisconnectedRef.current = onDisconnected;
    onChangeStateRef.current = onChangeState;
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    const unsubConnecting = globalThis.chat.onConnecting(() => {
      rendererLogger.debug("USE_CHAT", "Connecting to websocket")
      setWebSocketState("CONNECTING")
      onConnectingRef.current?.()
    });

    const unsubConnected = globalThis.chat.onConnected(() => {
      rendererLogger.debug("USE_CHAT", "Connected to websocket")
      setWebSocketState("CONNECTED")
      onConnectedRef.current?.()
    });

    const unsubError = globalThis.chat.onError((_err) => {
      rendererLogger.debug("USE_CHAT", "Error connecting to websocket")
      setWebSocketState("ERROR")
      onErrorRef.current?.()
    });

    const unsubDisconnected = globalThis.chat.onDisconnected(() => {
      rendererLogger.debug("USE_CHAT", "Disconnected from websocket")
      setWebSocketState("DISCONNECTED")
      onDisconnectedRef.current?.()
    });

    const unsubChangeState = globalThis.chat.onChangeState((state: ChatState) => {
      rendererLogger.debug("USE_CHAT", "Change state: " + state)
      onChangeStateRef.current?.(state);
    });

    const unsubMessage = globalThis.chat.onMessage((message: ChatMessage) => {
      rendererLogger.debug("USE_CHAT", "Receiving message: " + message.text)
      onMessageRef.current?.(message)
    });

    return () => {
      unsubConnecting();
      unsubConnected();
      unsubError();
      unsubDisconnected();
      unsubChangeState();
      unsubMessage();
    };
  }, []);

  useEffect(() => {
    const loadConnectionData = async () => {
      const connected = await globalThis.chat.connected()
      rendererLogger.debug("USE_CHAT", "Is connected: " + connected)
      if (connected)
        setWebSocketState("CONNECTED")
      else
        setWebSocketState("DISCONNECTED")
    }
    loadConnectionData()
  }, [])

  return {
    state: webSocketState,
    connect: globalThis.chat.connect,
    disconnect: globalThis.chat.disconnect,
    subscribe: globalThis.chat.subscribe,
    sendMessage: globalThis.chat.sendMessage,
    onMessage: globalThis.chat.onMessage,
    onChangeState: globalThis.chat.onChangeState,
  };
};
