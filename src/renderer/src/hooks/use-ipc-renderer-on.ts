import { useEffect } from 'react';

type IpcRendererCallback = (...args: any[]) => void;

export const useIpcRendererOn = (channel: string, callback: IpcRendererCallback, dependencies?: any[]) => {
    useEffect(() => {
        const removeListener = window.electron.ipcRenderer.on(channel, callback);

        return () => {
            removeListener();
        };
    }, [channel, callback, ...(dependencies || [])]);
}; 