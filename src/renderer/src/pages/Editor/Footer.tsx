import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ForwardedRef, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react"
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";
import { useDocumentAPI, usePreferencesAPI } from "@/hooks/use-electron";
import AppSeparator from "@/components/app/app-separator";
import AppLabel from "@/components/app/app-label";
import { useEditor } from "./hooks/use-editor";

interface FooterProps {
    statusBarConfig: string[];
    zoom: string;
    onZoomChange: (value: string) => void
}

export interface FooterElement {
    setTitle: (title: string) => void;
    reloadData: () => void
}

const Footer = forwardRef(({
    statusBarConfig,
    zoom,
    onZoomChange
}: FooterProps, ref: ForwardedRef<FooterElement>) => {
    const { t } = useTranslation();
    const docAPI = useDocumentAPI();
    const preferencesAPI = usePreferencesAPI();
    const [preferences, setPreferences] = useState<Preferences | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [dateFormatted, setDateFormatted] = useState<string | null>(null);
    const [title, setTitle] = useState<string>('Main Text');
    const [state] = useEditor();
    const wordCount = useMemo(() => state.words, [state.words]);
    const characterCount = useMemo(() => state.characters, [state.characters]);

    useImperativeHandle(ref, () => ({
        setTitle,
        reloadData
    }));

    const reloadData = useCallback(() => {
        Promise.all([
            preferencesAPI.getPreferences(),
            docAPI.getMetadata(),
        ]).then(([
            preferences,
            metadata
        ]) => {
            setPreferences(preferences);
            setMetadata(metadata);
        });
    }, []);

    useEffect(() => {
        reloadData();
    }, []);

    useEffect(() => {
        if (!preferences) return;
        if (!preferences.dateFormat) return;
        if (!metadata) return;

        const updatedDate = metadata.updatedDate;
        const createdDate = metadata.createdDate;

        // Convert to date-fns compatible format
        // Replace uppercase 'A' with lowercase 'a' for AM/PM
        let dateFnsFormat = preferences.dateFormat.replace(/ A$/g, ' a').replace(/:ss A$/g, ':ss a');

        try {
            if (updatedDate && updatedDate.length > 0 && updatedDate !== 'NaN') {
                const date = format(updatedDate, dateFnsFormat);
                setDateFormatted(date);
            } else if (createdDate && createdDate.length > 0 && createdDate !== 'NaN') {
                const date = format(createdDate, dateFnsFormat);
                setDateFormatted(date);
            } else {
                setDateFormatted(null);
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            setDateFormatted(null);
        }

    }, [preferences, metadata]);

    useIpcRenderer((ipc) => {
        ipc.on('preferences-changed', () => {
            reloadData();
        });
        return () => ipc.cleanup();
    }, [window.electron.ipcRenderer]);

    const labelClass = 'text-[13px] text-grey-40 dark:text-grey-70';

    return (
        <EditorFooterLayout className={statusBarConfig.length > 1 ? '' : 'justify-end'}>
            {/* <ThemeToggle /> */}
            <div className={cn("flex flex-row gap-2", statusBarConfig.length === 1 ? 'hidden' : '')}>
                {title && title.length > 0 ? <AppLabel className={labelClass}>
                    {title}:
                </AppLabel> : null}
                {statusBarConfig.includes('wordCount') && <AppLabel className={labelClass}>
                    {wordCount} {t('customizeStatusBar.words')}
                </AppLabel>}
                {statusBarConfig.includes('characterCount') &&
                    <>
                        <AppSeparator orientation="vertical" />
                        <AppLabel className={labelClass}>
                            {characterCount} {t('customizeStatusBar.characters')}
                        </AppLabel>
                    </>
                }
                {statusBarConfig.includes('lastEditDate') && dateFormatted &&
                    <>
                        <AppSeparator orientation="vertical" />
                        <AppLabel className={labelClass}>
                            {t('customizeStatusBar.lastEditDate')}: {dateFormatted}
                        </AppLabel>
                    </>}
                {statusBarConfig.includes('author') && metadata &&
                    <>
                        <AppSeparator orientation="vertical" />
                        <AppLabel className={labelClass}>
                            {t('customizeStatusBar.author')}: {metadata.author}
                        </AppLabel>
                    </>
                }
            </div>
            {statusBarConfig.includes('zoom') && <MemoizedPageZoom zoom={zoom} onZoomChange={onZoomChange} />}
        </EditorFooterLayout>
    )
})
Footer.displayName = "Footer"
export default memo(Footer);

const EditorFooterLayout = memo(({
    children,
    className
}: { children: React.ReactNode, className: string }) => {
    return (
        <footer className="sticky bottom-0 z-40 flex h-10 shrink-0 items-center gap-2 border-t bg-grey-90 dark:bg-grey-20 border-grey-80 dark:border-grey-30 px-3">
            <div className={cn("flex justify-between w-full", className)}>
                {children}
            </div>
        </footer>
    )
})

const PageZoom: React.FC<{
    zoom: string,
    onZoomChange: (value: string) => void
}> = ({ zoom, onZoomChange }) => {
    return (
        <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
                <Select value={zoom} onValueChange={onZoomChange}>
                    <SelectTrigger className="h-6 w-auto">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 4 }, (_, i) => i * 10 + 20)
                            .map(val => (
                                <SelectItem key={val} value={`${val}`.toString()}>{val}%</SelectItem>
                            ))
                        }
                        {Array.from({ length: ((600 - 100) / 50) + 1 }, (_, i) => 100 + i * 50)
                            .filter(val => val > 0 && val <= 500)
                            .map(val => (
                                <SelectItem key={val} value={`${val}`.toString()}>{val}%</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
PageZoom.displayName = "PageZoom"
const MemoizedPageZoom = memo(PageZoom)