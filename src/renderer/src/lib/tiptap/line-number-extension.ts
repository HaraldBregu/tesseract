import { Extension } from '@tiptap/core';

export interface LineNumberOptions {
    show: boolean;
    frequency: 5 | 10 | 15;
    type: 'arabic' | 'roman';
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        lineNumbers: {
            toggleLineNumbers: (options?: { show?: boolean }) => ReturnType;
            setLineNumberFrequency: (frequency: 5 | 10 | 15) => ReturnType;
            setLineNumberType: (type: 'arabic' | 'roman') => ReturnType;
        };
    }

    interface EditorEvents {
        lineNumberOptionsChanged: (options: LineNumberOptions) => void;
    }
}

export const LineNumbers = Extension.create<LineNumberOptions>({
    name: 'lineNumbers',

    addOptions() {
        return {
            show: false,
            frequency: 5,
            type: 'arabic',
        };
    },

    addStorage() {
        return {
            options: this.options,
        };
    },

    addCommands() {
        return {
            toggleLineNumbers:
                (options = {}) =>
                    ({ editor }) => {
                        const show = options.show ?? !this.storage.options.show;
                        this.storage.options.show = show;

                        editor.view.dispatch(editor.state.tr);
                        editor.emit('lineNumberOptionsChanged', this.storage.options);

                        return true;
                    },
            setLineNumberFrequency:
                (frequency) =>
                    ({ editor }) => {
                        this.storage.options.frequency = frequency;

                        editor.view.dispatch(editor.state.tr);
                        editor.emit('lineNumberOptionsChanged', this.storage.options);

                        return true;
                    },
            setLineNumberType:
                (type) =>
                    ({ editor }) => {
                        this.storage.options.type = type;

                        editor.view.dispatch(editor.state.tr);
                        editor.emit('lineNumberOptionsChanged', this.storage.options);

                        return true;
                    },
        };
    },
});