import {
    ForwardedRef,
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";
import useSingleAndDoubleClick from "@/hooks/use-single-double-click";
import { Textarea } from "../../../components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next";
import Comment from "@/components/icons/Comment";
import { format } from "date-fns";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";
import AnnotationCategoryInputTitle from "./annotation-category-input-title";
import AnnotationHeader from "./annotation-header";
import AnnotationSearchInput from "./annotation-search-input";
import { useAnnotationSearch } from "../../../hooks/use-annotation-search";
import IconComment from "@/components/app/icons/IconComment";
import AppButton from "@/components/app/app-button";
import IconMore from "@/components/app/icons/IconMore";
import IconDropdown from "@/components/app/icons/IconDropdown";
import {
    AppDropdownMenu,
    AppDropdownMenuContent,
    AppDropdownMenuItem,
    AppDropdownMenuPortal,
    AppDropdownMenuSub,
    AppDropdownMenuSubContent,
    AppDropdownMenuSubTrigger,
    AppDropdownMenuTrigger
} from "@/components/app/app-dropdown-menu";

const DESCRIPTION_MAX_LENGTH = 2000
const CATEGORY_TITLE_MIN_LENGTH = 1
const CATEGORY_TITLE_MAX_LENGTH = 255

export interface CommentListElement {
    scrollAndEditItem: (id: string, categoryId?: string) => void;
    scrollToCommentId: (id: string) => void;
}

interface CommentListProps {
    categories: CommentCategory[];
    items: AppComment[];
    onCreateCategory: () => void;
    onUpdateCategory: (category: CommentCategory) => void;
    onDeleteCategory: (category: CommentCategory, comments: AppComment[], categories: CommentCategory[]) => void;
    onEditComment: (comment: AppComment) => void;
    onDeleteComment: (comment: AppComment) => void;
    onClickComment: (comment: AppComment) => void;
    onMoveCommentToCategory: (comment: AppComment, category: CommentCategory | null) => void;
}

const CommentList = forwardRef(({
    categories,
    items,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onEditComment,
    onDeleteComment,
    onClickComment,
    onMoveCommentToCategory
}: CommentListProps,
    ref: ForwardedRef<CommentListElement>) => {

    const { t } = useTranslation();

    const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
    const [isEditingCategoryAtIndex, setIsEditingCategoryAtIndex] = useState<number | null>(null);
    const [categoryName, setCategoryName] = useState<string>("")
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number | null>(null)
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [preferencesCharMaxLength, setPreferencesCharMaxLength] = useState<number>(20)
    const [selectedComment, setSelectedComment] = useState<AppComment | null>(null)
    const sidebarContentRef = useRef<HTMLDivElement | null>(null)

    const itemRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const {
        searchQuery,
        setSearchQuery,
        searchInputRef,
        handleClearSearch,
        filteredItems
    } = useAnnotationSearch(
        items,
        (item) => [item.author, item.content, item.description || ""],
        sidebarContentRef
    );

    useImperativeHandle(ref, () => {
        return {
            scrollAndEditItem: handleScrollAndEditComment,
            scrollToCommentId: handleScrollToCommentId
        }
    }, [items])

    const categoriesWithResults = useMemo(() => {
        if (searchQuery.trim() === "") return [];
        return categories
            .filter(category => filteredItems.some(item => item.categoryId === category.id))
            .map(category => category.id);
    }, [searchQuery, filteredItems, categories]);

    useEffect(() => {
        if (searchQuery.trim() === "") return;

        const timeoutId = setTimeout(() => {
            setExpandedCategoryIds(categoriesWithResults);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [categoriesWithResults, searchQuery]);

    const toggleSection = useCallback((category: CommentCategory, index: number) => {
        if (isEditingCategoryAtIndex === index) return
        setExpandedCategoryIds(prev => {
            if (prev.includes(category.id)) {
                return prev.filter(id => id !== category.id)
            }
            return [...prev, category.id]
        })
    }, []);

    const handleOnClickComment = useCallback((comment: AppComment) => {
        setSelectedComment(comment)
        onClickComment(comment)
    }, [onClickComment, selectedComment])

    const handleCategoryClick = useSingleAndDoubleClick(
        () => {
            setCurrentCategoryIndex(null)
            setIsEditingCategoryAtIndex(null)
        },
        () => {
            if (currentCategoryIndex === null) return;
            //setCurrentCategoryIndex(currentCategoryIndex)
            setCategoryName(categories[currentCategoryIndex].name)
            setIsEditingCategoryAtIndex(currentCategoryIndex)
        },
        450
    );

    const handleOnPreferencesChanged = useCallback(() => {
        const getPreferences = async () => {
            const preferences = await window.preferences.getPreferences()
            setPreferencesCharMaxLength(parseInt(preferences.commentPreviewLimit ?? "20"))
        }
        getPreferences()
    }, [window])

    const handleScrollAndEditComment = useCallback((id: string, categoryId?: string) => {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            await delay(100);
            setEditingCommentId(id);

            await delay(100);
            if (categoryId) {
                setExpandedCategoryIds(prev => {
                    if (prev.includes(categoryId)) return prev;
                    return [...prev, categoryId];
                });
            }
            await delay(100);
            const element = itemRefs.current[id ?? ""];
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
        })();
    }, [itemRefs.current, expandedCategoryIds])

    const handleScrollToCommentId = useCallback((id: string) => {
        setEditingCommentId(null);
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            const comment = items.find(item => item.id === id)
            if (!comment) return
            setSelectedComment(comment)

            await delay(100);

            const categoryId = comment?.categoryId

            if (categoryId) {
                setExpandedCategoryIds(prev => {
                    if (prev.includes(categoryId))
                        return prev

                    return [...prev, categoryId]
                })
            }
            await delay(300);
            const element = itemRefs.current[id];
            element?.scrollIntoView({ behavior: "smooth", block: "center" })
        })();
    }, [itemRefs.current, expandedCategoryIds, items])

    useEffect(() => {
        handleOnPreferencesChanged()
    }, [window])

    useIpcRenderer((ipc) => {
        ipc.on('preferences-changed', () => {
            handleOnPreferencesChanged()
        })
    })

    const handleMoveToCategory = useCallback((comment: AppComment, category: CommentCategory | null) => {
        onMoveCommentToCategory(comment, category)
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            await delay(100);
            setExpandedCategoryIds(prev => {
                if (prev.includes(category?.id ?? ""))
                    return prev
                return [...prev, category?.id ?? ""]
            })
            await delay(300);
            const element = itemRefs.current[comment.id];
            window.scrollTo({
                top: element?.offsetTop,
                behavior: "smooth"
            })
        })();
    }, [itemRefs.current, onMoveCommentToCategory, expandedCategoryIds])

    const handleEditComment = useCallback((description: string, item: AppComment) => {
        setEditingCommentId(null)
        onEditComment({
            ...item,
            description
        })
    }, [onEditComment, editingCommentId])

    const handleOnUpdateCategory = useCallback((category: CommentCategory, title: string) => {
        setCategoryName(title)
        onUpdateCategory({ ...category, name: title })
        setIsEditingCategoryAtIndex(null)
    }, [categoryName, onUpdateCategory, isEditingCategoryAtIndex])

    return (
        <div className="flex flex-col h-full" ref={sidebarContentRef}>
            <AnnotationHeader
                title={t('comments.title')}
                onAddCategory={onCreateCategory}
            />

            <AnnotationSearchInput
                ref={searchInputRef}
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={handleClearSearch}
                placeholder={t('comments.search_placeholder')}
            />

            <div className="flex-1 overflow-y-auto pt-2 px-2">

                {/* {filteredItems.length === 0 && categories.length === 0 && <div className="flex flex-col items-center mt-10 text-grey-40/50 dark:text-grey-60/50">
                    <IconComment className="w-10 h-10 flex-shrink-0" />
                    <p className="text-sm">{t('comments.no_results_found')}</p>
                </div>} */}

                {/* No results found message */}
                {searchQuery.trim() !== "" && filteredItems.length === 0 && (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-gray-500 dark:text-grey-60">
                            {t('comments.no_results_found')}
                        </p>
                    </div>
                )}

                {/* Not categorized items */}
                {filteredItems.filter(data => !data.categoryId).map((item) => {
                    if (item.id === editingCommentId) {
                        return (
                            <CommentEditItem
                                key={item.id}
                                item={item}
                                onDone={(description) => handleEditComment(description, item)}
                                maxContentLength={preferencesCharMaxLength}
                            />
                        )
                    } else {
                        return (
                            <CommentItem
                                key={item.id}
                                ref={(el: HTMLDivElement | null) => {
                                    if (el) {
                                        itemRefs.current[item.id] = el
                                    }
                                }}
                                item={item}
                                selected={selectedComment?.id === item.id}
                                categories={categories}
                                onClickContent={() => handleOnClickComment(item)}
                                onEdit={() => setEditingCommentId(item.id)}
                                onDelete={() => onDeleteComment(item)}
                                onMoveToCategory={(category) => handleMoveToCategory(item, category)}
                                maxContentLength={preferencesCharMaxLength}
                            />
                        );
                    }
                })}

                {/* Categorized items */}
                {categories.map((category, index) => {
                    const categoryHasItems = filteredItems.some(item => item.categoryId === category.id);
                    if (!categoryHasItems && searchQuery.trim() !== "") return null;

                    return (
                        <div className="mb-4" key={index}>

                            {/* Editing category title */}
                            {isEditingCategoryAtIndex === index && (
                                <AnnotationCategoryInputTitle
                                    title={categoryName}
                                    placeholder={t('comments.edit_mode.title_placeholder')}
                                    minLength={CATEGORY_TITLE_MIN_LENGTH}
                                    errorMessageMinLength={t('comments.edit_mode.category_title_error_message_min_length', { length: CATEGORY_TITLE_MIN_LENGTH })}
                                    maxLength={CATEGORY_TITLE_MAX_LENGTH}
                                    errorMessageMaxLength={t('comments.edit_mode.category_title_error_message_max_length', { length: CATEGORY_TITLE_MAX_LENGTH })}
                                    onDone={(title) => handleOnUpdateCategory(category, title)}
                                />
                            )}

                            <div className="group flex justify-between items-center cursor-pointer"
                                onClick={() => toggleSection(category, index)}>
                                {isEditingCategoryAtIndex !== index && (
                                    <>
                                        <div className="flex items-center gap-0 flex-1 min-w-0" onClick={() => {
                                            setCurrentCategoryIndex(index)
                                            handleCategoryClick()
                                        }}>
                                            <AppButton
                                                variant="transparent"
                                                size="icon">
                                                <IconDropdown
                                                    className={cn(
                                                        "transition-transform",
                                                        `${expandedCategoryIds.includes(category.id) ? 'rotate-180' : ''}`
                                                    )}
                                                />
                                            </AppButton>
                                            <h5 className="text-sm font-bold cursor-pointer text-nowrap overflow-hidden truncate text-ellipsis">
                                                {category.name}
                                            </h5>
                                        </div>
                                        <AppDropdownMenu>
                                            <AppDropdownMenuTrigger>
                                                <IconMore className="w-5 h-5 flex-shrink-0" />
                                            </AppDropdownMenuTrigger>
                                            <AppDropdownMenuContent align="end" className="w-30">
                                                <AppDropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation()
                                                    setIsEditingCategoryAtIndex(index)
                                                    setCategoryName(categories[index].name)
                                                }}>
                                                    {t('comments.edit')}
                                                </AppDropdownMenuItem>
                                                <AppDropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDeleteCategory(category, filteredItems.filter(data => data.categoryId === category.id), categories)
                                                }} className="text-red-600">
                                                    {t('comments.delete')}
                                                </AppDropdownMenuItem>
                                            </AppDropdownMenuContent>
                                        </AppDropdownMenu>
                                    </>
                                )}
                            </div>
                            {expandedCategoryIds.includes(category.id) && filteredItems.filter(data => data.categoryId === category.id).map(item => {
                                if (item.id === editingCommentId) {
                                    return (
                                        <CommentEditItem
                                            key={item.id}
                                            item={item}
                                            onDone={(description) => {
                                                setEditingCommentId(null)
                                                onEditComment({ ...item, description })
                                            }}
                                            maxContentLength={preferencesCharMaxLength}
                                        />
                                    )
                                } else {
                                    return (
                                        <CommentItem
                                            key={item.id}
                                            ref={(el: HTMLDivElement | null) => {
                                                if (el) {
                                                    itemRefs.current[item.id] = el
                                                }
                                            }}
                                            item={item}
                                            selected={selectedComment?.id === item.id}
                                            categories={categories}
                                            onClickContent={() => handleOnClickComment(item)}
                                            onEdit={() => setEditingCommentId(item.id)}
                                            onDelete={() => onDeleteComment(item)}
                                            onMoveToCategory={(category) => handleMoveToCategory(item, category)}
                                            maxContentLength={preferencesCharMaxLength}
                                        />
                                    );
                                }
                            }
                            )}
                        </div>
                    );
                })}

            </div>
        </div>
    )
})

export default memo(CommentList);

interface CommentContentItemProps {
    value: string;
    maxContentLength: number;
    className?: string;
}

const CommentContentItem = memo(({
    value,
    maxContentLength,
    className,
    ...props
}: CommentContentItemProps) => {
    return (
        <div
            className={cn("mx-1 mt-2 pl-4 border-l-4 cursor-pointer", className)}
            {...props}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <p className="text-sm italic text-left break-all">
                            {value.length > maxContentLength ? value.slice(0, maxContentLength - 3) + '...' : value}
                        </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                        {value}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
})

interface CommentDescriptionItemProps {
    value: string;
    className?: string;
}

const CommentDescriptionItem = memo(({
    value,
    className,
    ...props
}: CommentDescriptionItemProps) => {
    return (
        <div
            className={cn(
                "mt-4 text-xm mb-1 cursor-pointer",
                className,
            )}
            {...props}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <p className="text-left text-sm truncate whitespace-pre-line">
                            {value.length > 150 ? value.slice(0, 147) + '...' : value}
                        </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                        {value}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
})

interface CommentItemProps {
    item: AppComment
    selected: boolean
    onClickContent: () => void
    onEdit: () => void
    onDelete: () => void
    categories: CommentCategory[]
    onMoveToCategory: (category: CommentCategory | null) => void
    maxContentLength: number
}
const CommentItem = memo(forwardRef(({
    item,
    selected,
    onClickContent,
    onEdit,
    onDelete,
    categories,
    onMoveToCategory,
    maxContentLength,
    ...props
}: CommentItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { t } = useTranslation();

    const handleClick = useSingleAndDoubleClick(
        () => { },
        () => { onEdit() },
        450
    );

    const handleOnClickContainer = useCallback(() => {
        onClickContent()
        handleClick()
    }, [])

    return (
        <div
            ref={ref}
            className={cn(
                'group',
                'flex flex-col rounded-sm mb-4',
                'hover:!text-white dark:text-grey-60 hover:!bg-[#0625AC] dark:hover:!bg-primary-70',
                selected && "bg-[#0625AC] hover:none dark:bg-primary-70 dark:hover:bg-primary-70 !text-white",
            )}
            onClick={handleOnClickContainer}
            {...props}>

            <div className="flex justify-between items-center pl-0 cursor-pointer flex-1 min-w-0">
                <div className={cn("flex items-center gap-2 flex-1 min-w-0")} >
                    <IconComment className="w-5 h-5 flex-shrink-0" />
                    <span className={cn("text-sm font-medium truncate text-ellipsis")}>
                        {item.author}
                        <p className="text-xs">
                            {format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                    </span>
                </div>

                <AppDropdownMenu>
                    <AppDropdownMenuTrigger>
                        <IconMore className="w-5 h-5 flex-shrink-0" />
                    </AppDropdownMenuTrigger>
                    <AppDropdownMenuContent align="end" className="w-30">
                        <AppDropdownMenuItem onClick={() => onEdit()}>
                            {t('comments.edit')}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuItem onClick={() => onDelete()} className="text-red-600">
                            {t('comments.delete')}
                        </AppDropdownMenuItem>
                        {categories.length > 0 && <AppDropdownMenuSub>
                            <AppDropdownMenuSubTrigger>
                                {t('comments.move')}
                            </AppDropdownMenuSubTrigger>
                            <AppDropdownMenuPortal>
                                <AppDropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                    {item.categoryId && <AppDropdownMenuItem onClick={() => onMoveToCategory(null)}>
                                        <span>{t('comments.uncategorised')}</span>
                                    </AppDropdownMenuItem>}
                                    {categories.filter(data => data.id !== item.categoryId).map((category, index) => (
                                        <AppDropdownMenuItem key={index} onClick={() => onMoveToCategory(category)}>
                                            <span>{category.name}</span>
                                        </AppDropdownMenuItem>
                                    ))}
                                </AppDropdownMenuSubContent>
                            </AppDropdownMenuPortal>
                        </AppDropdownMenuSub>}
                    </AppDropdownMenuContent>
                </AppDropdownMenu>
            </div>

            {/* Content */}
            {item.content && item.content !== "" && <CommentContentItem
                value={item.content}
                className={cn(
                    "border-blue-700 group-hover:!border-blue-700 hover:!border-white",
                    selected && "!border-white group-hover:!border-white",
                )}
                maxContentLength={maxContentLength}
            />}

            {/* Description */}
            {item.description && item.description !== "" && <CommentDescriptionItem
                value={item.description}
                className={cn(selected && "")}
            />}
        </div>
    )
}))

// CommentEditItem
interface CommentEditItemProps {
    item: AppComment;
    maxContentLength: number;
    onDone: (description: string) => void;
}
const CommentEditItem = forwardRef(({
    item,
    maxContentLength,
    onDone
}: CommentEditItemProps, _: ForwardedRef<HTMLFormElement>) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { t } = useTranslation();

    const handleKeyDownDescription = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key == "Escape") {
            e.preventDefault()
            onDone(item.description ?? "")
            form.reset();
        }
        else if (e.key === "Enter") {
            if (e.altKey || e.ctrlKey) {
                e.preventDefault()
                const cursorPosition = e.currentTarget.selectionStart
                const description = form.getValues("description")
                const newValue = description.substring(0, cursorPosition) + "\n" + description.substring(cursorPosition)
                form.setValue("description", newValue)

                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.selectionStart = cursorPosition + 1
                        textareaRef.current.selectionEnd = cursorPosition + 1
                    }
                }, 0)
            } else {
                e.preventDefault()
                form.handleSubmit(onSubmit)()
            }
        }
    }, [])

    const formSchema = z.object({
        description: z.string()
            .max(DESCRIPTION_MAX_LENGTH, {
                message: t('comments.edit_mode.description_error_message', { length: DESCRIPTION_MAX_LENGTH })
            })
            .optional(),
    })

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: item.description ?? "",
        },
    });

    function onSubmit(data: any) {
        onDone(data.description)
        form.reset();
    }

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const descriptionInput = formRef.current?.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
        if (descriptionInput) {
            descriptionInput.focus();
            descriptionInput.select();
        }
    }, []);

    return (
        <div className={cn(
            'flex flex-col rounded-sm mb-4',
            'hover:bg-transparent'
        )}
            onClick={() => { }}>
            <Form {...form}>
                <form
                    ref={formRef}
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Comment className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium truncate text-ellipsis">
                            {item.author}
                            <p className="text-xs text-gray-600">
                                {format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm')}
                            </p>
                        </span>
                    </div>
                    <CommentContentItem value={item.content} className={cn()} maxContentLength={maxContentLength} />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        className={cn(
                                            'rounded-sm',
                                            form.formState.errors.description && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        placeholder={t('comments.edit_mode.description_placeholder')} {...field}
                                        onKeyDown={handleKeyDownDescription}
                                        ref={textareaRef}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    )
})
