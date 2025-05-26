import PlusSimple from "@/components/icons/PlusSimple";
import UnfoldMore from "@/components/icons/UnfoldMore";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import DragIndicator from "@/components/icons/DragIndicator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import More from "@/components/icons/More";
import Check from "@/components/icons/Check";
import { useDispatch, useSelector } from "react-redux";
import {
    selectApparatuses,
    selectApparatusesTypes,
    selectCanEdit,
    selectDisabledRemainingApparatusesTypes,
    selectEnabledRemainingApparatusesTypes,
    selectVisibleApparatuses
} from "./store/editor.selector";
import {
    addApparatusAfterIndex,
    changeApparatusTitle,
    changeApparatusType,
    createApparatusesFromDocument,
    removeApparatus,
    setCanAddBookmark,
    toggleVisibilityApparatus,
    updateApparatuses
} from "./store/editor.slice";
import TextEditor, { EditorData, HTMLTextEditorElement } from "@/components/text-editor";
import { Input } from "@/components/ui/input";
import { rendererLogger } from "@/utils/logger";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";


const EditorApparatusLayout = ({
    children,
    className
}: {
    children: React.ReactNode,
    className?: string
}) => {
    return (
        <div className={cn("h-full overflow-y-auto", className)}>
            {children}
        </div>
    )
}

interface EditorApparatusProps {
}

export const EditorApparatus = forwardRef((
    _: EditorApparatusProps,
    ref: ForwardedRef<unknown>
) => {
    useImperativeHandle(ref, () => {
        return {
            editorRefs: editorRefs.current
        }
    }, []);

    const dispatch = useDispatch()

    const apparatuses = useSelector(selectApparatuses)
    const visibleApparatuses = useSelector(selectVisibleApparatuses)
    const apparatusesTypes = useSelector(selectApparatusesTypes)
    const canEdit = useSelector(selectCanEdit)
    const enabledRemainingApparatusesTypes = useSelector(selectEnabledRemainingApparatusesTypes)
    const disabledRemainingApparatusesTypes = useSelector(selectDisabledRemainingApparatusesTypes)

    const [expandedApparatuses, setExpandedApparatuses] = useState<Apparatus[]>([])
    const [editingApparatus, setEditingApparatus] = useState<Apparatus | null>(null);
    const [apparatusesData, setApparatusesData] = useState<any[]>([])

    const inputRef = useRef<HTMLInputElement>(null);
    const editorRefs = useRef<{ [key: string]: HTMLTextEditorElement }>({});
    const [editorRef, setEditorRef] = useState<HTMLTextEditorElement>();

    const types = ['CRITICAL', 'PAGE_NOTES', 'SECTION_NOTES', 'INNER_MARGIN', 'OUTER_MARGIN']
    const apparatusTypeName = (type: Apparatus['type']) => {
        switch (type) {
            case 'CRITICAL':
                return 'Critical'
            case 'PAGE_NOTES':
                return 'Page Notes'
            case 'SECTION_NOTES':
                return 'Section Notes'
            case 'INNER_MARGIN':
                return 'Inner Margin'
            case 'OUTER_MARGIN':
                return 'Outer Margin'
        }
    }

    useIpcRenderer((ipc) => {
        ipc.on("view-apparatus", (_, data: any) => {
            dispatch(toggleVisibilityApparatus({
                id: data.id,
                visible: !data.visible
            }))
        })
    }, [window.electron.ipcRenderer])

    useEffect(() => {
        window.menu.disableReferencesMenuItems(disabledRemainingApparatusesTypes)
    }, [window.menu, disabledRemainingApparatusesTypes])

    useEffect(() => {
        const items = apparatuses.map((apparatus) => {
            return {
                id: apparatus.id,
                title: apparatus.title,
                visible: apparatus.visible,
            }
        })
        window.menu.updateViewApparatusesMenuItems(items)
    }, [apparatuses, window.menu])

    useEffect(() => {
        if (!apparatusesData) return;
        apparatusesData.forEach((data: any, index: number) => {
            const editor = editorRefs.current[apparatuses[index].id]
            editor.setJSON(data.content)
        })
    }, [apparatusesData])

    useEffect(() => {
        const taskId = rendererLogger.startTask("TextEditor", "Load apparatuses");
        async function loadApparatuses() {
            const apparatuses = await window.doc.getApparatuses()
            setApparatusesData(apparatuses)
            dispatch(createApparatusesFromDocument(apparatuses))
        }
        loadApparatuses()
        rendererLogger.endTask(taskId, "TextEditor", "Load apparatuses action completed");
    }, [window.doc.getApparatuses]);

    const updateTextHandler = useCallback((_: EditorData) => {
        const newApparatuses = apparatuses.map((apparatus) => {
            return {
                type: apparatus.type,
                title: apparatus.title,
                content: editorRefs.current[apparatus.id]?.getJSON()
            }
        })
        window.doc.setApparatuses(newApparatuses)
    }, [apparatuses, editorRefs])

    return (
        <EditorApparatusLayout>
            <Reorder.Group
                as="ul"
                axis="y"
                onReorder={(newTabs) => {
                    dispatch(updateApparatuses(newTabs))
                }}
                className={cn(
                    "flex flex-col w-full",
                    expandedApparatuses.length > 0 ? "h-full" : "h-auto"
                )}
                values={apparatuses}
            >
                <AnimatePresence>
                    {visibleApparatuses.map((item, index) => (
                        <Reorder.Item
                            id={item.title + item.type}
                            key={item.title + item.type}
                            value={item}
                            initial={{
                                opacity: 1,
                                x: 0
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                transition: {
                                    duration: 0.1,
                                    ease: 'easeInOut'
                                }
                            }}
                            exit={{
                                opacity: 0,
                                x: 20,
                                transition: {
                                    duration: 0.15
                                }
                            }}
                            whileDrag={{
                                transition: {
                                    ease: 'easeInOut'
                                }
                            }}
                            className={cn(
                                'bg-white',
                                item !== apparatuses[0] && 'border-t border-grey-70',
                                !expandedApparatuses.includes(item) && item === apparatuses[apparatuses.length - 1] && 'border-b border-grey-70',
                                'relative flex items-center overflow-hidden select-none',
                                "w-full",
                                expandedApparatuses.includes(item) ? "flex-1" : "flex-none"
                            )}>
                            <motion.div className='flex flex-col w-full h-full'>
                                <motion.nav
                                    className={cn("h-8 px-2 flex items-center justify-between")}>
                                    <motion.div className='cursor-grab active:cursor-grabbing'>
                                        <DragIndicator intent='primary' variant='tonal' size='small' />
                                    </motion.div>
                                    <motion.span className="text-center text-xs font-medium">
                                        {editingApparatus?.id === item.id
                                            ? (
                                                <Input
                                                    ref={inputRef}
                                                    autoFocus
                                                    className="w-full border-none focus-visible:ring-0 !text-center !text-xs !font-medium shadow-none"
                                                    value={editingApparatus.title}
                                                    onChange={(e) => {
                                                        setEditingApparatus({
                                                            ...editingApparatus,
                                                            title: e.target.value
                                                        })
                                                    }}
                                                    onBlur={(e) => {
                                                        setEditingApparatus({
                                                            ...editingApparatus,
                                                            title: e.target.value
                                                        })
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key == "Escape") {
                                                            e.preventDefault()
                                                            setEditingApparatus(null)
                                                        } else if (e.key === "Enter" && editingApparatus.title.length >= 1) {
                                                            setEditingApparatus(null)
                                                            dispatch(changeApparatusTitle({
                                                                id: editingApparatus.id,
                                                                title: editingApparatus.title
                                                            }))
                                                        }
                                                    }}
                                                />
                                            )
                                            : (
                                                <motion.span>
                                                    {item.title} ({apparatusTypeName(item.type)})
                                                </motion.span>
                                            )
                                        }
                                    </motion.span>
                                    <motion.div className="relative space-x-2">
                                        <motion.button
                                            onPointerDown={(event) => {
                                                event.stopPropagation()
                                            }}
                                            initial={false}
                                            animate={{
                                                backgroundColor: 'transparent'
                                            }}
                                            onClick={() => {
                                                const newExpandedApparatuses = expandedApparatuses.includes(item)
                                                    ? expandedApparatuses.filter(apparatus => apparatus.id !== item.id)
                                                    : [...expandedApparatuses, item]

                                                setExpandedApparatuses(newExpandedApparatuses)
                                            }}
                                            whileHover={{
                                                scale: 1.1,
                                                transition: { duration: 0.2 }
                                            }}
                                            children={<UnfoldMore className={cn("w-4 h-4")} />}
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <motion.button
                                                    onPointerDown={(event) => {
                                                        event.stopPropagation()
                                                        setEditorRef(editorRefs.current[item.id]);
                                                    }}
                                                    initial={false}
                                                    animate={{
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    whileHover={{
                                                        scale: 1.1,
                                                        transition: { duration: 0.2 }
                                                    }}
                                                    children={<More intent='primary' variant='tonal' size='small' />}
                                                />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        Change type
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {types.map((type: string) => (
                                                                <DropdownMenuItem
                                                                    key={type}
                                                                    disabled={
                                                                        Boolean(editorRef?.state?.text?.length)
                                                                        || (type === 'INNER_MARGIN' && apparatusesTypes.includes('INNER_MARGIN'))
                                                                        || (type === 'OUTER_MARGIN' && apparatusesTypes.includes('OUTER_MARGIN'))
                                                                    }
                                                                    onClick={() => {
                                                                        dispatch(changeApparatusType({
                                                                            id: item.id,
                                                                            type: type as Apparatus['type']
                                                                        }))
                                                                    }}>
                                                                    {item.type === type && <Check className="w-4 h-4" />}
                                                                    {apparatusTypeName(type as Apparatus['type'])}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                                                        (async () => {
                                                            await delay(100);
                                                            setEditingApparatus(item)
                                                            await delay(100);
                                                            inputRef.current?.focus()
                                                            inputRef.current?.select()
                                                        })();
                                                    }}>
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        const newExpandedApparatuses = expandedApparatuses.filter(apparatus => apparatus.id !== item.id)
                                                        setExpandedApparatuses(newExpandedApparatuses)
                                                    }}>
                                                    Hide
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        dispatch(removeApparatus(item))
                                                    }}>
                                                    Delete
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => { }}>
                                                    <Check className="w-4 h-4" />
                                                    Show Note highlights
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => { }}>
                                                    <Check className="w-4 h-4" />
                                                    Show Comment highlights
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => { }}>
                                                    <Check className="w-4 h-4" />
                                                    Show in print
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <motion.button
                                                    onPointerDown={(event) => {
                                                        event.stopPropagation()
                                                        setEditorRef(editorRefs.current[item.id]);
                                                    }}
                                                    initial={false}
                                                    animate={{
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    whileHover={{
                                                        scale: 1.1,
                                                        transition: { duration: 0.2 }
                                                    }}
                                                    children={<PlusSimple intent='primary' variant='tonal' size='small' />}
                                                />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {enabledRemainingApparatusesTypes.map((type: string) => (
                                                    <DropdownMenuItem
                                                        key={type}
                                                        onClick={() => {
                                                            dispatch(addApparatusAfterIndex({
                                                                type: type as Apparatus['type'],
                                                                index
                                                            }))
                                                        }}>
                                                        Add {apparatusTypeName(type as Apparatus['type'])}
                                                    </DropdownMenuItem>
                                                ))}
                                                {enabledRemainingApparatusesTypes.length > 0 && disabledRemainingApparatusesTypes.length > 0 && <DropdownMenuSeparator />}
                                                {disabledRemainingApparatusesTypes.map((type: string) => (
                                                    <DropdownMenuItem
                                                        key={type}
                                                        disabled>
                                                        {apparatusTypeName(type as Apparatus['type'])}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </motion.div>
                                </motion.nav>
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, visibility: 'hidden' }}
                                        animate={{
                                            height: expandedApparatuses.includes(item) ? "auto" : "0px",
                                            opacity: expandedApparatuses.includes(item) ? 1 : 0,
                                            visibility: expandedApparatuses.includes(item) ? 'visible' : 'hidden'
                                        }}
                                        exit={{
                                            height: 0,
                                            opacity: 0,
                                            visibility: 'hidden'
                                        }}
                                        className="overflow-hidden flex-1">
                                        <TextEditor
                                            className={cn(
                                                "flex-1 overflow-auto relative w-full",
                                                !expandedApparatuses.includes(item) && "h-0"
                                            )}
                                            ref={(el: HTMLTextEditorElement) => editorRefs.current[item.id] = el}
                                            onFocusEditor={() => {
                                                setEditorRef(editorRefs.current[item.id]);
                                                dispatch(setCanAddBookmark(false));
                                            }}
                                            canEdit={canEdit}
                                            onUpdate={(editor: EditorData) => {
                                                updateTextHandler(editor)
                                            }}

                                        // onEmphasisStateChange={(emphasisState) => {
                                        //     dispatch(setEmphasisState(emphasisState))
                                        // }}
                                        // onHistoryStateChange={(historyState) => {
                                        //     dispatch(setHistory(historyState))
                                        // }}
                                        // onChangeComments={(comments) => {
                                        //     dispatch(updateCommentList({ target: 'APPARATUS_TEXT', comments: comments }))
                                        // }}
                                        // onChangeComment={(data) => {
                                        //     dispatch(editCommentContent({ commentId: data.id, content: data.content }))
                                        // }}
                                        // onSelectionMarks={(selectionMarks) => {
                                        //     const commentMarksIds = selectionMarks.filter(mark => mark.type === 'comment')?.map(mark => mark?.attrs?.id)
                                        //     dispatch(selectCommentWithId(commentMarksIds[0]))
                                        //     if (commentMarksIds.length > 0) {
                                        //         dispatch(setSidebarOpen(true))
                                        //         dispatch(setSelectedSidebarTabIndex(0))
                                        //     }
                                        // }}
                                        // onCommentCreated={async (id, content) => {
                                        //     const userInfo = await window.system.getUserInfo() as unknown as UserInfo
                                        //     dispatch(addComment({
                                        //         id: id,
                                        //         content: content ?? '',
                                        //         target: targetRef.current,
                                        //         categoryId: commentCategoryIdRef.current,
                                        //         userInfo: userInfo.username
                                        //     }));
                                        //     dispatch(setSidebarOpen(true))
                                        //     dispatch(setSelectedSidebarTabIndex(0))
                                        //     onRegisterComment(id, commentCategoryIdRef.current)
                                        // }}
                                        // onCanUndo={(value) => {
                                        //     dispatch(setCanUndo(value));
                                        // }}
                                        // onCanRedo={(value) => {
                                        //     dispatch(setCanRedo(value));
                                        // }}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>
        </EditorApparatusLayout>
    )
})