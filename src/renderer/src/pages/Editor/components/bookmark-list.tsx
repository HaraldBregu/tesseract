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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
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
import { format } from "date-fns";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";
import AppButton from "@/components/app/app-button";
import IconDropdown from "@/components/app/icons/IconDropdown";
import IconMore from "@/components/app/icons/IconMore";
import AnnotationCategoryInputTitle from "./annotation-category-input-title";
import AnnotationHeader from "./annotation-header";
import AnnotationSearchInput from "./annotation-search-input";
import { useAnnotationSearch } from "../../../hooks/use-annotation-search";
import IconBookmark from "@/components/app/icons/IconBookmark";

const TITLE_MIN_LENGTH = 1
const TITLE_MAX_LENGTH = 255
const DESCRIPTION_MAX_LENGTH = 255
const CATEGORY_TITLE_MIN_LENGTH = 1
const CATEGORY_TITLE_MAX_LENGTH = 255

export interface BookmarkListElement {
    scrollAndEditItem: (id: string, categoryId?: string) => void;
    scrollToBookmarkId: (id: string) => void;
}

interface BookmarkListProps {
    categories: BookmarkCategory[];
    items: Bookmark[];
    onCreateCategory: () => void;
    onUpdateCategory: (category: BookmarkCategory) => void;
    onDeleteCategory: (category: BookmarkCategory, bookmarks: Bookmark[], categories: BookmarkCategory[]) => void;
    onEditBookmark: (bookmark: Bookmark) => void;
    onDeleteBookmark: (bookmark: Bookmark) => void;
    onClickBookmark: (bookmark: Bookmark) => void;
    onMoveBookmarkToCategory: (bookmark: Bookmark, category: BookmarkCategory | null) => void;
}

const BookmarkList = forwardRef(({
    categories,
    items,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onEditBookmark,
    onDeleteBookmark,
    onClickBookmark,
    onMoveBookmarkToCategory
}: BookmarkListProps,
    ref: ForwardedRef<BookmarkListElement>) => {

    const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null)

    useImperativeHandle(ref, () => {
        return {
            scrollAndEditItem: (id: string, categoryId?: string) => {
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                (async () => {
                    await delay(100);
                    setEditingBookmarkId(id);

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
            },
            scrollToBookmarkId: handleScrollToBookmarkId
        }
    })


    const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
    const [isEditingCategoryAtIndex, setIsEditingCategoryAtIndex] = useState<number | null>(null);
    const [categoryName, setCategoryName] = useState<string>("")
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number | null>(null)
    const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null)
    const [preferencesCharMaxLength, setPreferencesCharMaxLength] = useState<number>(20)
    const sidebarContentRef = useRef<HTMLDivElement | null>(null)

    const {
        searchQuery,
        setSearchQuery,
        searchInputRef,
        handleClearSearch,
        filteredItems
    } = useAnnotationSearch(
        items,
        (item) => [item.title, item.author, item.content, item.description || ""],
        sidebarContentRef
    );

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

    const toggleSection = useCallback((category: BookmarkCategory, index: number) => {
        if (isEditingCategoryAtIndex === index) return
        setExpandedCategoryIds(prev => {
            if (prev.includes(category.id)) {
                return prev.filter(id => id !== category.id)
            }
            return [...prev, category.id]
        })

    }, [])

    const { t } = useTranslation();

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

    const itemRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    useEffect(() => {
        const categoryId = selectedBookmark?.categoryId
        if (categoryId) {
            setExpandedCategoryIds(prev => {
                if (prev.includes(categoryId))
                    return prev

                return [...prev, categoryId]
            })
        }

        setTimeout(() => {
            const element = itemRefs.current[selectedBookmark?.id ?? ""];
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);

    }, [selectedBookmark])

    const handleMoveToCategory = useCallback((bookmark: Bookmark, category: BookmarkCategory | null) => {
        onMoveBookmarkToCategory(bookmark, category)

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            await delay(100);
            setExpandedCategoryIds(prev => {
                if (prev.includes(category?.id ?? ""))
                    return prev

                return [...prev, category?.id ?? ""]
            })
            await delay(300);
            const element = itemRefs.current[bookmark.id];
            window.scrollTo({
                top: element?.offsetTop,
                behavior: "smooth"
            })
        })();
    }, [])

    const handleOnEditBookmark = useCallback((item: Bookmark, title: string, description: string) => {
        setEditingBookmarkId(null)
        onEditBookmark({ ...item, title, description })
    }, [onClickBookmark])

    const handleOnClickBookmark = useCallback((item: Bookmark) => {
        onClickBookmark(item)
    }, [onClickBookmark])

    const handleOnPreferencesChanged = useCallback(() => {
        const getPreferences = async () => {
            const preferences = await window.preferences.getPreferences()
            setPreferencesCharMaxLength(parseInt(preferences.bookmarkPreviewLimit ?? "20"))
        }
        getPreferences()
    }, [window])

    useEffect(() => {
        handleOnPreferencesChanged()
    }, [])

    useIpcRenderer((ipc) => {
        ipc.on('preferences-changed', () => {
            handleOnPreferencesChanged()
        })
    })

    const handleOnUpdateCategory = useCallback((category: BookmarkCategory, title: string) => {
        setCategoryName(title)
        onUpdateCategory({ ...category, name: title })
        setIsEditingCategoryAtIndex(null)
    }, [])

    const handleScrollToBookmarkId = useCallback((id: string) => {
        setEditingBookmarkId(null);
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            const bookmark = items.find(item => item.id === id)
            if (!bookmark) return
            setSelectedBookmark(bookmark)

            await delay(100);

            const categoryId = bookmark?.categoryId

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

    return (
        <div className="flex flex-col h-full" ref={sidebarContentRef}>
            <AnnotationHeader
                title={t('bookmarks.title')}
                onAddCategory={onCreateCategory}
            />

            <AnnotationSearchInput
                ref={searchInputRef}
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={handleClearSearch}
                placeholder={t('bookmarks.search_placeholder')}
            />

            <div className="flex-1 overflow-y-auto pt-2 px-2">

                {/* {filteredItems.length === 0 && categories.length === 0 && <div className="flex flex-col items-center mt-10 text-grey-40/50 dark:text-grey-60/50">
                    <IconBookmark className="w-10 h-10 flex-shrink-0" />
                    <p className="text-sm">{t('bookmarks.no_results_found')}</p>
                </div>} */}

                {/* No results found message */}
                {searchQuery.trim() !== "" && filteredItems.length === 0 && (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-gray-500 dark:text-grey-60">
                            {t('bookmarks.no_results_found')}
                        </p>
                    </div>
                )}

                {/* Not categorized items */}
                {filteredItems.filter(data => !data.categoryId).map((item) => {
                    if (item.id === editingBookmarkId) {
                        return (
                            <BookmarkEditItem
                                key={item.id}
                                item={item}
                                onDone={handleOnEditBookmark}
                                maxContentLength={preferencesCharMaxLength}
                            />
                        )
                    } else {
                        return (
                            <BookmarkItem
                                key={item.id}
                                ref={(el: HTMLDivElement | null) => {
                                    if (el) {
                                        itemRefs.current[item.id] = el
                                    }
                                }}
                                item={item}
                                selected={selectedBookmark?.id === item.id}
                                categories={categories}
                                onClickContent={handleOnClickBookmark}
                                onEdit={() => setEditingBookmarkId(item.id)}
                                onDelete={() => onDeleteBookmark(item)}
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
                        <div className="mb-4"
                            key={index}>

                            {/* Editing category title */}
                            {isEditingCategoryAtIndex === index && (
                                <AnnotationCategoryInputTitle
                                    title={categoryName}
                                    placeholder={t('bookmarks.edit_mode.title_placeholder')}
                                    minLength={CATEGORY_TITLE_MIN_LENGTH}
                                    errorMessageMinLength={t('bookmarks.edit_mode.category_title_error_message_min_length', { length: CATEGORY_TITLE_MIN_LENGTH })}
                                    maxLength={CATEGORY_TITLE_MAX_LENGTH}
                                    errorMessageMaxLength={t('bookmarks.edit_mode.category_title_error_message_max_length', { length: CATEGORY_TITLE_MAX_LENGTH })}
                                    onDone={(title) => handleOnUpdateCategory(category, title)}
                                />
                            )}

                            {/* Category header */}
                            {isEditingCategoryAtIndex !== index && (
                                <div className="flex justify-between items-center first-letter cursor-pointer"
                                    onClick={() => toggleSection(category, index)}>
                                    <div
                                        className="flex items-center gap-0 flex-1 min-w-0"
                                        onClick={() => {
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <IconMore className="w-5 h-5 flex-shrink-0" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-30">
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                setIsEditingCategoryAtIndex(index)
                                                setCategoryName(categories[index].name)
                                            }}>
                                                {t('bookmarks.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                onDeleteCategory(category, filteredItems.filter(data => data.categoryId === category.id), categories)
                                            }} className="text-red-600">
                                                {t('bookmarks.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            {/* Category items */}
                            {expandedCategoryIds.includes(category.id) && filteredItems.filter(data => data.categoryId === category.id).map(item => {

                                if (item.id === editingBookmarkId) {
                                    return (
                                        <BookmarkEditItem
                                            key={item.id}
                                            item={item}
                                            onDone={handleOnEditBookmark}
                                            maxContentLength={preferencesCharMaxLength}
                                        />
                                    )
                                } else {
                                    return (
                                        <BookmarkItem
                                            key={item.id}
                                            ref={(el: HTMLDivElement | null) => {
                                                if (el) {
                                                    itemRefs.current[item.id] = el
                                                }
                                            }}
                                            item={item}
                                            selected={selectedBookmark?.id === item.id}
                                            categories={categories}
                                            onClickContent={handleOnClickBookmark}
                                            onEdit={() => setEditingBookmarkId(item.id)}
                                            onDelete={() => onDeleteBookmark(item)}
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

export default memo(BookmarkList);


// BookmarkContentItem
interface BookmarkContentItemProps {
    value: string;
    maxLength: number;
}
const BookmarkContentItem = forwardRef(({
    value,
    maxLength = 20,
    ...props
}: BookmarkContentItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    if (!value || value === "") return null;

    return (
        <div className="mx-1 mt-2 pl-4 border-l-4 border-blue-700 dark:border-primary-70 cursor-pointer" {...props} ref={ref}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <p className="text-sm italic text-gray-600 dark:text-grey-80 text-left break-all">
                            {value.length > maxLength ? value.slice(0, maxLength - 3) + '...' : value}
                        </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] break-words">
                        {value}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
})

// BookmarkDescriptionItem
interface BookmarkDescriptionItemProps {
    value: string;
    onEdit: () => void;
}
const BookmarkDescriptionItem = forwardRef(({
    value,
    onEdit
}: BookmarkDescriptionItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    const handleClick = useSingleAndDoubleClick(
        () => { },
        () => onEdit(),
        450
    );

    if (!value || value === "") return null;

    return (
        <div className="mt-4 text-xm mb-1 text-gray-600 dark:text-grey-80 cursor-pointer" onClick={handleClick} ref={ref}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <p className="text-left text-sm truncate whitespace-pre-line">
                            {value.length > 20 ? value.slice(0, 17) + '...' : value}
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

// BookmarkAuthorItem
interface BookmarkAuthorItemProps {
    value: string;
}
const BookmarkAuthorItem = forwardRef(({
    value,
    ...props
}: BookmarkAuthorItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
        <p className="text-sm text-gray-600 dark:text-grey-80 mt-2" {...props} ref={ref}>
            {value}
        </p>
    )
})

// BookmarkUpdatedDateItem
interface BookmarkUpdatedDateItemProps {
    value: string;
}
const BookmarkUpdatedDateItem = forwardRef(({
    value,
    ...props
}: BookmarkUpdatedDateItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
        <p className="text-xs text-gray-600 dark:text-grey-60" {...props} ref={ref}>
            {format(new Date(value), 'dd/MM/yyyy HH:mm')}
        </p>
    )
})

interface BookmarkItemProps {
    item: Bookmark;
    selected: boolean;
    onClickContent: (item: Bookmark) => void;
    onEdit: () => void;
    onDelete: () => void;
    categories: BookmarkCategory[];
    onMoveToCategory: (category: BookmarkCategory | null) => void;
    maxContentLength: number;
}
const BookmarkItem = forwardRef(({
    item,
    selected,
    onClickContent,
    onEdit,
    onDelete,
    categories,
    onMoveToCategory,
    maxContentLength = 20,
    ...props
}: BookmarkItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { t } = useTranslation();

    const handleClick = useSingleAndDoubleClick(
        () => { },
        () => onEdit(),
        450
    );

    return (
        <div
            ref={ref}
            className={cn(
                'flex flex-col hover:bg-[#E5E5E5] dark:hover:bg-grey-40 rounded-sm mb-4',
                selected && "bg-[#E5E5E5] dark:bg-grey-30"
            )}
            onClick={() => {
                onClickContent(item)
                handleClick()
            }}
            {...props}
        >
            <div className="flex justify-between items-center pl-0 cursor-pointer flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <IconBookmark className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate text-ellipsis">
                        {item.title.length > 20 ? item.title.slice(0, 17) + '...' : item.title}
                    </span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <IconMore className="w-5 h-5 flex-shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-30 dark:bg-grey-10">
                        <DropdownMenuItem onClick={() => onEdit()}>
                            {t('bookmarks.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete()} className="text-red-600 dark:text-red-400">
                            {t('bookmarks.delete')}
                        </DropdownMenuItem>
                        {categories.length > 0 && <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                {t('bookmarks.move')}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                    {item.categoryId && <DropdownMenuItem
                                        onClick={() => onMoveToCategory(null)}>
                                        <span>{t('bookmarks.uncategorised')}</span>
                                    </DropdownMenuItem>}
                                    {categories.filter(data => data.id !== item.categoryId).map((category, index) => (
                                        <DropdownMenuItem key={index} onClick={() => onMoveToCategory(category)}>
                                            <span>{category.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <BookmarkContentItem value={item.content} maxLength={maxContentLength} />
            <BookmarkDescriptionItem value={item.description ?? ""} onEdit={onEdit} />
            <BookmarkAuthorItem value={item.author} />
            <BookmarkUpdatedDateItem value={item.updatedAt} />
        </div>
    )
})

type BookmarkEditItemProps = {
    item: Bookmark;
    onDone: (item: Bookmark, title: string, description: string) => void;
    maxContentLength: number;
}
const BookmarkEditItem = forwardRef(({
    item,
    onDone,
    maxContentLength = 20,
}: BookmarkEditItemProps, _: ForwardedRef<HTMLFormElement>) => {
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { t } = useTranslation();

    const handleConfirm = useCallback((title: string, description: string) => {
        if (title.length >= 1) {
            onDone(item, title, description)
        }
    }, [])

    const handleKeyDownTitle = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Escape") {
            e.preventDefault()
            handleConfirm(item.title, item.description ?? "")
            form.reset();
        }
    }, [])

    const handleKeyDownDescription = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key == "Escape") {
            e.preventDefault()
            handleConfirm(item.title, item.description ?? "")
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
        title: z.string()
            .min(TITLE_MIN_LENGTH, {
                message: t('bookmarks.edit_mode.title_error_message_min_length', { length: TITLE_MIN_LENGTH })
            })
            .max(TITLE_MAX_LENGTH, {
                message: t('bookmarks.edit_mode.title_error_message_max_length', { length: TITLE_MAX_LENGTH })
            }),
        description: z.string()
            .max(DESCRIPTION_MAX_LENGTH, {
                message: t('bookmarks.edit_mode.description_error_message', { length: DESCRIPTION_MAX_LENGTH })
            })
            .optional(),
    })

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: item.title,
            description: item.description,
        },
    });

    const onSubmit = useCallback((data: any) => {
        handleConfirm(data.title, data.description)
        form.reset();
    }, [])

    useEffect(() => {
        const titleInput = formRef.current?.querySelector('input[name="title"]') as HTMLInputElement;
        if (titleInput) {
            titleInput.focus();
            titleInput.select();
        }
    }, []);

    return (
        <div
            className={cn(
                'flex flex-col hover:bg-[#E5E5E5] dark:hover:bg-grey-40 rounded-sm mb-4',
                'hover:bg-transparent')}>
            <Form {...form}>
                <form
                    ref={formRef}
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        onKeyDown={handleKeyDownTitle}
                                        className={cn(
                                            'rounded-sm',
                                            form.formState.errors.title && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        placeholder={t('bookmarks.edit_mode.title_placeholder')}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <BookmarkContentItem
                        value={item.content}
                        maxLength={maxContentLength}
                    />
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
                                        placeholder={t('bookmarks.edit_mode.description_placeholder')}
                                        {...field}
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
            <BookmarkAuthorItem value={item.author} />
            <BookmarkUpdatedDateItem value={item.updatedAt} />
        </div>
    )
})
