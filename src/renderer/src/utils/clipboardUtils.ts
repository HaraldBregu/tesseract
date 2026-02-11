export const writeClipboardItem = (innerHtml: string, text: string): Promise<void> => {
    const clipboardItems = [new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'text/html': new Blob([innerHtml], { type: 'text/html' }),
    })]

    return writeClipboardItems(clipboardItems)
}

export const writeClipboardItems = (items: ClipboardItem[]): Promise<void> => {
    return navigator.clipboard.write(items)
}

export const readClipboardItems = (): Promise<ClipboardItem[]> => {
    return navigator.clipboard.read()
}

export const readClipboardText = (): Promise<string> => {       
    return navigator.clipboard.readText()
}

export const clearClipboardData = () => {
    navigator.clipboard.write([])
}
