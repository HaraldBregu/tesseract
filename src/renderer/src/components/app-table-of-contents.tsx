import { TreeDataItem, TreeView } from "./tree-view";
import { useEffect, useState } from "react";
import TocContentDelimiter from "./toc-delimiter";
import TextField from "./ui/textField";
import { TocSettings } from "@/pages/editor/store/editor.slice";
import { useTranslation } from "react-i18next";
import { TreeItem } from "@/lib/tocTreeMapper";

interface TableOfContentsProps {
    tocStructure: TreeItem[];
    tocSettings: TocSettings;
    onUpdateTocSettings: (tocSettings: TocSettings) => void;
    onClickTreeItem?: (id: string) => void;
}

export default function TableOfContents({ tocStructure, tocSettings, onClickTreeItem, onUpdateTocSettings }: TableOfContentsProps) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(tocSettings.title ?? "");

    const [currentTocStructure, setCurrentTocStructure] = useState<TreeItem[] | null>(null);
    const [currentTocSettings, setCurrentTocSettings] = useState<TocSettings | null>(null);

    useEffect(() => {
        setCurrentTocStructure(tocStructure);
        setCurrentTocSettings(tocSettings);
    }, [tocStructure, tocSettings])

    const handleTreeItemClick = (item: TreeDataItem) => {
        if (onClickTreeItem && item.id) {
            onClickTreeItem(item.id);
        }
    };

    const handleTocTitle = () => {
        setTempTitle(tocSettings.title);
        setIsEditing(true);
    };

    const saveTitle = () => {
        onUpdateTocSettings({
            ...tocSettings,
            title: tempTitle
        });
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-2 sticky top-0 z-10">
                <h4 className="text-xs font-medium">{t('tableOfContents.sidepanelLabel')}</h4>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
                <div className="mb-4">
                    <div className="flex justify-between items-center px-2 mb-4">
                        {tocSettings.show && <div className="flex items-center gap-0">
                            {!isEditing ? <h5 className="text-sm font-bold" onDoubleClick={() => handleTocTitle()}>{tocSettings.title}</h5> :
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
                        </div>}
                    </div>
                    <div className="flex justify-between items-center px-2 mt-2 mb-2">
                        <div className="flex items-center gap-0">
                            <h5 className="text-sm font-bold">{t('tableOfContents.sections.introduction')}</h5>
                        </div>
                    </div>
                    <div className="flex flex-col hover:bg-gray-50 rounded-md mb-4">
                        <TocContentDelimiter text={t('tableOfContents.sections.criticalText.start')} />
                        {currentTocStructure && currentTocSettings && <TreeView
                            data={currentTocStructure}
                            defaultOpen
                            onItemClick={handleTreeItemClick}
                            indentLevels={currentTocSettings.indentLevels}
                        />}
                        <TocContentDelimiter text={t('tableOfContents.sections.criticalText.end')} />
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-0">
                            <h5 className="text-sm font-bold">{t('tableOfContents.sections.bibliography')}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

