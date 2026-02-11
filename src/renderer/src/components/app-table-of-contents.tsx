import { TreeView } from "./tree-view";
import { useMemo, useState, useCallback, memo, useRef, forwardRef, useImperativeHandle } from "react";
import TextField from "./ui/textField";
import { useTranslation } from "react-i18next";
import DragHandle from './icons/DragHandle';
import { useElectron } from "@/hooks/use-electron";


interface TocContentDelimiterProps {
    text?: string;
    className?: string;
    onClick?: () => void;
}

const TocContentDelimiter = ({
    text = "",
    className = "",
    onClick,
}: TocContentDelimiterProps) => {
    return (
        <div className='flex flex-col items-center'>
            <div
                className={`
                    flex items-center w-[95%] border-b py-0
                    bg-gray-50 dark:bg-grey-20
                    border-grey-80 dark:border-grey-60
                    cursor-pointer
                    my-2 ${className}
                `}
                onClick={onClick}
            >
                <DragHandle className="mr-1" size={18} />
                <span className="text-[11px] font-semibold text-grey-50 dark:text-grey-60">{text}</span>
            </div>
        </div>
    );
};

export interface TableOfContentsElement {
    updateTocSettings: (template: Template, tocStructureCriticalText: TreeItem[], tocStructureIntroduction: TreeItem[], tocStructureBibliography: TreeItem[]) => void;
}

interface TableOfContentsProps {
    readonly onClickHeadingIndex?: (item: number, sectionType?: string) => void;
    readonly onScrollToSection?: (sectionId: string, position?: 'top' | 'bottom') => void;
}

const TableOfContents = forwardRef<TableOfContentsElement, TableOfContentsProps>(({
    onClickHeadingIndex,
    onScrollToSection
}, ref) => {
    useImperativeHandle(ref, () => {
        return {
            updateTocSettings: (template: Template, tocStructureCriticalText: TreeItem[], tocStructureIntroduction: TreeItem[], tocStructureBibliography: TreeItem[]) => {
                setTocStructureCriticalText(tocStructureCriticalText);
                setTocStructureIntroduction(tocStructureIntroduction);
                setTocStructureBibliography(tocStructureBibliography);
                setTemplate(template);
                setTocSettings(template.paratextual.tocSettings);
                setTempTitle(template.paratextual.tocSettings.title ?? "");
            }
        }
    })
    const { t } = useTranslation();
    const electron = useElectron();
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState("");
    const [tocSettings, setTocSettings] = useState<TocSettings | null>(null);
    const [template, setTemplate] = useState<Template | null>(null);
    const [tocStructureCriticalText, setTocStructureCriticalText] = useState<TreeItem[]>([])
    const [tocStructureIntroduction, setTocStructureIntroduction] = useState<TreeItem[]>([])
    const [tocStructureBibliography, setTocStructureBibliography] = useState<TreeItem[]>([])
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isDoubleClickRef = useRef(false);

    const orderedVisibleSections = useMemo(() => {
        if (!template?.sort || !template) return [];
        return template.sort.filter((sectionKey: string) =>
            template?.layout[sectionKey]?.visible === true
        );
    }, [template?.sort, template]);

    const handleTocTitle = useCallback(() => {
        isDoubleClickRef.current = true;
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
        }
        setTempTitle(tocSettings?.title ?? "");
        setIsEditing(true);

        setTimeout(() => {
            isDoubleClickRef.current = false;
        }, 100);
    }, [tocSettings?.title]);

    const handleLinkClick = useCallback((id?: string, position?: 'top' | 'bottom') => {
        if (isDoubleClickRef.current) return;

        clickTimeoutRef.current = setTimeout(() => {
            if (!isDoubleClickRef.current) {
                onScrollToSection?.(id ?? "toc", position ?? "top");
            }
            clickTimeoutRef.current = null;
        }, 200);
    }, [onScrollToSection]);

    const saveTitle = useCallback(() => {
        electron.doc.setTocSettings({
            ...tocSettings,
            title: tempTitle
        } as TocSettings);
        setIsEditing(false);
    }, [tocSettings, tempTitle]);

    const memoizedTocStructureCriticalText = useMemo(() => {
        if (!orderedVisibleSections.includes('critical')) return null;
        return <TreeView
            data={tocStructureCriticalText}
            defaultOpen
            onTreeItemClicked={(item) => {
                onClickHeadingIndex?.(item.headingIndex, "maintext");
            }}
            indentLevels={tocSettings?.indentLevels}
        />
    }, [tocStructureCriticalText, tocSettings?.indentLevels, onClickHeadingIndex, orderedVisibleSections]);

    const memoizedTocStructureIntroduction = useMemo(() => {
        if (!orderedVisibleSections.includes('intro')) return null;
        return <TreeView
            data={tocStructureIntroduction}
            defaultOpen
            onTreeItemClicked={(item) => {
                onClickHeadingIndex?.(item.headingIndex, "introduction");
            }}
            indentLevels={tocSettings?.indentLevels}
        />
    }, [tocStructureIntroduction, tocSettings?.indentLevels, onClickHeadingIndex, orderedVisibleSections]);

    const memoizedTocStructureBibliography = useMemo(() => {
        if (!orderedVisibleSections.includes('bibliography')) return null;
        return <TreeView
            data={tocStructureBibliography}
            defaultOpen
            onTreeItemClicked={(item) => {
                onClickHeadingIndex?.(item.headingIndex, "bibliography");
            }}
            indentLevels={tocSettings?.indentLevels}
        />
    }, [tocStructureBibliography, tocSettings?.indentLevels, onClickHeadingIndex, orderedVisibleSections]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-2 sticky top-0 z-10">
                <h4 className="text-xs font-medium">{t('tableOfContents.sidepanelLabel')}</h4>
            </div>
            <div className="flex-1 overflow-y-auto pt-2 transition-all duration-200 ease-in-out">
                <div className="mb-4 py-4">
                    {orderedVisibleSections.map((sectionKey) => {
                        switch (sectionKey) {
                            case 'toc':
                                return (
                                    <div key="toc" className="flex justify-between items-center px-2 my-3 transition-opacity duration-150">
                                        <div className="flex items-center gap-0">
                                            {!isEditing ?
                                                <button
                                                    className="text-sm font-bold underline cursor-pointer transition-colors duration-150 bg-transparent border-none p-0 text-left"
                                                    onDoubleClick={() => handleTocTitle()}
                                                    onClick={() => handleLinkClick("toc", "top")}
                                                >
                                                    {tempTitle}
                                                </button> :
                                                <TextField
                                                    id="toc-title"
                                                    className="w-full"
                                                    value={tempTitle}
                                                    onChange={(e) => {
                                                        setTempTitle(e.target.value);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            saveTitle();
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        saveTitle();
                                                    }}
                                                    autoFocus
                                                    placeholder={t('tableOfContents.navigation.placeholder')}
                                                />
                                            }
                                        </div>
                                    </div>
                                );

                            case 'intro':
                                return (
                                    <div
                                        key="intro"
                                        className="flex flex-col hover:bg-gray-50 dark:hover:bg-grey-20 rounded-md mb-4 transition-colors duration-200">
                                        <TocContentDelimiter text={t('tableOfContents.sections.introduction.start')} onClick={() => handleLinkClick("introduction", "top")} />
                                        {memoizedTocStructureIntroduction}
                                        <TocContentDelimiter text={t('tableOfContents.sections.introduction.end')} onClick={() => handleLinkClick("introduction", "bottom")} />
                                    </div>
                                );

                            case 'critical':
                                return (
                                    <div
                                        key="critical"
                                        className="flex flex-col hover:bg-gray-50 dark:hover:bg-grey-20 rounded-md mb-4 transition-colors duration-200">
                                        <TocContentDelimiter text={t('tableOfContents.sections.criticalText.start')} onClick={() => handleLinkClick("maintext", "top")} />
                                        {memoizedTocStructureCriticalText}
                                        <TocContentDelimiter text={t('tableOfContents.sections.criticalText.end')} onClick={() => handleLinkClick("maintext", "bottom")} />
                                    </div>
                                );

                            case 'bibliography':
                                return (
                                    <div
                                        key="bibliography"
                                        className="flex flex-col hover:bg-gray-50 dark:hover:bg-grey-20 rounded-md mb-4 transition-colors duration-200">
                                        <TocContentDelimiter text={t('tableOfContents.sections.bibliography.start')} onClick={() => handleLinkClick("bibliography", "top")} />
                                        {memoizedTocStructureBibliography}
                                        <TocContentDelimiter text={t('tableOfContents.sections.bibliography.end')} onClick={() => handleLinkClick("bibliography", "bottom")} />
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })}
                </div>
            </div>
        </div>
    );
});

TableOfContents.displayName = 'TableOfContents';

export default memo(TableOfContents);

