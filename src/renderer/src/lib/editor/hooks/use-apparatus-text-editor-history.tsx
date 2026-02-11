import { useCallback, useRef, useMemo, useEffect } from "react";
import { Editor, JSONContent } from "@tiptap/core";
import { Transaction } from "@tiptap/pm/state";
import { debounce } from "lodash-es";

export interface UseApparatusTextEditorHistoryReturn {
    add: (transaction: Transaction, editor: Editor) => void;
    undo: (editor: Editor) => void;
    redo: (editor: Editor) => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    historyList: JSONContent[];
    currentPosition: number;
    apparatusId: string;
}

function collectApparatusIds(content?: JSONContent[]): string[] {
    const ids: string[] = [];

    if (!content) {
        return ids;
    }

    content.forEach((node) => {
        if (!node) {
            return;
        }

        if (node.type === "apparatusEntry" && typeof node.attrs?.id === "string") {
            ids.push(node.attrs.id);
        }

        if (Array.isArray(node.content)) {
            ids.push(...collectApparatusIds(node.content));
        }
    });

    return ids;
}

function collectLemmaNodes(content?: JSONContent[]): Record<string, JSONContent> {
    const map: Record<string, JSONContent> = {};

    if (!content) {
        return map;
    }

    function walk(nodes: JSONContent[], entryId?: string) {
        nodes.forEach((node) => {
            if (!node) {
                return;
            }

            let currentEntryId = entryId;

            if (node.type === "apparatusEntry" && typeof node.attrs?.id === "string") {
                currentEntryId = node.attrs.id;
            }

            if (currentEntryId && node.type === "lemma") {
                map[currentEntryId] = node;
            }

            if (Array.isArray(node.content)) {
                walk(node.content, currentEntryId);
            }
        });
    }

    walk(content);
    return map;
}

function alignLemmaContent(previous?: JSONContent[], current?: JSONContent[]): boolean {
    const previousLemmaNodes = collectLemmaNodes(previous);
    const currentLemmaNodes = collectLemmaNodes(current);
    let updated = false;

    Object.entries(previousLemmaNodes).forEach(([id, previousLemma]) => {
        const currentLemma = currentLemmaNodes[id];
        const previousContent = previousLemma?.attrs?.lemma?.content ?? "";
        const currentContent = currentLemma?.attrs?.lemma?.content;

        if (currentLemma && currentContent && previousContent !== currentContent) {
            previousLemma.attrs = {
                ...previousLemma.attrs,
                lemma: {
                    ...(previousLemma.attrs?.lemma ?? {}),
                    content: currentContent,
                },
            };
            updated = true;
        }
    });

    return updated;
}

function haveSameApparatusSnapshot(current: string[], target: string[]): boolean {
    if (current.length !== target.length) {
        return false;
    }

    const sortedCurrent = [...current].sort();
    const sortedTarget = [...target].sort();

    return sortedCurrent.every((id, index) => id === sortedTarget[index]);
}

export function useApparatusTextEditorHistory(
    maxItems: number,
    apparatusId: string
): UseApparatusTextEditorHistoryReturn {
    const historyListRef = useRef<JSONContent[]>([]);
    const currentPositionRef = useRef<number>(-1);
    const maxItemsRef = useRef(maxItems);
    const apparatusIdRef = useRef(apparatusId);
    const isUndoRedoRef = useRef<boolean>(false);

    maxItemsRef.current = maxItems;
    apparatusIdRef.current = apparatusId;

    const addToHistory = useCallback((editor: Editor) => {
        const currentContent = editor.getJSON();
        const newHistory = [...historyListRef.current];
        const currentPos = currentPositionRef.current;

        if (currentPos < newHistory.length - 1) {
            newHistory.splice(currentPos + 1);
        }

        newHistory.push(currentContent);

        let itemsRemoved = 0;
        while (newHistory.length > maxItemsRef.current) {
            newHistory.shift();
            itemsRemoved++;
        }

        const newPos = Math.min(currentPos - itemsRemoved + 1, newHistory.length - 1);
        currentPositionRef.current = newPos;
        historyListRef.current = newHistory;
    }, []);

    const debouncedAddToHistory = useMemo(() => debounce(addToHistory, 500), [addToHistory]);

    useEffect(() => {
        return () => {
            debouncedAddToHistory.cancel();
        };
    }, [debouncedAddToHistory]);

    const add = useCallback(
        (transaction: Transaction, editor: Editor) => {
            if (!transaction.docChanged || isUndoRedoRef.current) {
                return;
            }

            debouncedAddToHistory(editor);
        },
        [debouncedAddToHistory]
    );

    const undo = useCallback(
        (editor: Editor) => {
            const currentPos = currentPositionRef.current;
            if (currentPos <= 0) {
                return;
            }

            const currentContent = historyListRef.current[currentPos];
            if (!currentContent) {
                return;
            }

            debouncedAddToHistory.cancel();

            const previousPosition = currentPos - 1;
            const previousContent = historyListRef.current[previousPosition];
            if (!previousContent) {
                return;
            }

            const currentApparatusIds = collectApparatusIds(currentContent?.content);
            const previousApparatusIds = collectApparatusIds(previousContent?.content);

            if (!haveSameApparatusSnapshot(currentApparatusIds, previousApparatusIds)) {
                return;
            }

            alignLemmaContent(previousContent?.content, currentContent?.content);

            isUndoRedoRef.current = true;
            editor.commands.setContent(previousContent, true, { preserveWhitespace: "full" });
            currentPositionRef.current = previousPosition;
            setTimeout(() => {
                isUndoRedoRef.current = false;
            }, 0);
        },
        [debouncedAddToHistory]
    );

    const redo = useCallback(
        (editor: Editor) => {
            const currentPos = currentPositionRef.current;
            const historyLength = historyListRef.current.length;

            if (currentPos >= historyLength - 1) {
                return;
            }

            debouncedAddToHistory.cancel();

            const nextPosition = currentPos + 1;
            const nextContent = historyListRef.current[nextPosition];
            const currentContent = historyListRef.current[currentPos];
            const currentApparatusIds = collectApparatusIds(currentContent?.content);
            const nextApparatusIds = collectApparatusIds(nextContent?.content);

            if (!haveSameApparatusSnapshot(currentApparatusIds, nextApparatusIds)) {
                return;
            }

            if (nextContent) {
                isUndoRedoRef.current = true;
                editor.commands.setContent(nextContent, true, { preserveWhitespace: "full" });
                currentPositionRef.current = nextPosition;
                setTimeout(() => {
                    isUndoRedoRef.current = false;
                }, 0);
            }
        },
        [debouncedAddToHistory]
    );

    const canUndo = useCallback(() => currentPositionRef.current > 0, []);
    const canRedo = useCallback(
        () => currentPositionRef.current < historyListRef.current.length - 1,
        []
    );

    return {
        add,
        undo,
        redo,
        canUndo,
        canRedo,
        get historyList() {
            return historyListRef.current;
        },
        get currentPosition() {
            return currentPositionRef.current;
        },
        apparatusId: apparatusIdRef.current,
    };
}

