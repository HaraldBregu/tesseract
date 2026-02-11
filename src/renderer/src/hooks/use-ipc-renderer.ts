import { useEffect } from 'react';

type IpcRendererCallback = (...args: any[]) => void;
type IpcSetupCallback = (ipc: {
    on: (channel: string, callback: IpcRendererCallback) => () => void;
    off: (channel: string) => void;
    send: (channel: string, ...args: any[]) => void;
    cleanup: () => void;
}) => void;

export const useIpcRenderer = (setup: IpcSetupCallback, deps: any[] = []) => {
    useEffect(() => {
        const listeners: Map<string, (() => void)[]> = new Map();

        const on = (channel: string, callback: IpcRendererCallback) => {
            const removeListener = window.electron.ipcRenderer.on(channel, callback);

            if (!listeners.has(channel)) {
                listeners.set(channel, []);
            }
            listeners.get(channel)?.push(removeListener);

            return () => {
                const channelListeners = listeners.get(channel);
                if (channelListeners) {
                    const index = channelListeners.indexOf(removeListener);
                    if (index > -1) {
                        channelListeners.splice(index, 1);
                        removeListener();
                    }
                }
            };
        };

        const off = (channel: string) => {
            const channelListeners = listeners.get(channel);
            if (channelListeners) {
                channelListeners.forEach(removeListener => removeListener());
                listeners.delete(channel);
            }
        };

        const send = (channel: string, ...args: any[]) => {
            window.electron.ipcRenderer.send(channel, ...args);
        };

        const cleanup = () => {
            listeners.forEach(channelListeners => {
                channelListeners.forEach(removeListener => removeListener());
            });
            listeners.clear();
        };

        setup({ on, off, send, cleanup });

        return () => {
            cleanup();
        };
    }, deps);
};


