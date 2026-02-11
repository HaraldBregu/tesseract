import { ForwardedRef, useCallback, useImperativeHandle, useState, useEffect, useRef } from "react";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";
import DragIndicator from "@/components/icons/DragIndicator";
import CloseBig from "@/components/icons/CloseBig";
import Expand_1 from "@/components/icons/Expand_1";
import Sync from "@/components/icons/Sync";
import PDFViewer from "@/components/PDFViewer";
import { useEditor } from "./hooks/use-editor";
import { setPrintPreviewVisible } from "./provider";
import { useMain } from "./hooks/use-main";

const Preview = forwardRef((
    _props: Record<string, never>,
    ref: ForwardedRef<unknown>
) => {
    const { t } = useTranslation();
    const [, dispatch] = useEditor();
    const main = useMain();
    const [printPreview, setPrintPreview] = useState<{ path: string | null; isLoaded: boolean; error: string | null }>({ 
        path: null, 
        isLoaded: false, 
        error: null 
    });
    
    useImperativeHandle(ref, () => {
        return {}
    }, []);

    const handleOnClickClose = useCallback(() => {
        dispatch(setPrintPreviewVisible(false))
    }, [dispatch]);

    const handleOnClickRefresh = useCallback(async () => {
        // Show loader immediately
        setPrintPreview({ path: null, isLoaded: false, error: null });
        
        const template = await window.doc.getTemplate();
        
        // Call savePdf to regenerate - state is managed in main process
        window.doc.savePdf({
            bibliography: template.layout.bibliography.visible ? 1 : 0,
            intro: template.layout.intro.visible ? 1 : 0,
            toc: template.layout.toc.visible ? 1 : 0,
            critical: 1
        }).catch((error) => {
            console.error('Error regenerating PDF:', error);
            // On error, fetch the error state from main process
            window.doc.getPrintPreview().then(setPrintPreview);
        });
    }, []);

    // Poll printPreview state from main process
    useEffect(() => {
        const fetchPrintPreview = async () => {
            try {
                const preview = await window.doc.getPrintPreview();
                setPrintPreview(preview);
            } catch (error) {
                console.error('Error fetching print preview state:', error);
                setPrintPreview({ path: null, isLoaded: true, error: 'Failed to load preview state' });
            }
        };

        // Initial fetch on mount
        fetchPrintPreview();

        // Listen for PDF generation events to refetch state
        // Only fetch if the event refers to the current tab
        const removeGeneratedListener = window.electron.ipcRenderer.on('pdf-generated', async (_event, _pdfPath: string, tabId: number) => {
            const currentTabId = await window.tabs.getSelectedTabId();
            if (tabId === currentTabId) {
                fetchPrintPreview();
            }
        });

        const removeErrorListener = window.electron.ipcRenderer.on('pdf-generation-error', async (_event, _errorMessage: string, tabId: number) => {
            const currentTabId = await window.tabs.getSelectedTabId();
            if (tabId === currentTabId) {
                fetchPrintPreview();
            }
        });

        const removeTabListener = window.electron.ipcRenderer.on('tab-selected', () => {
            fetchPrintPreview();
        });

        // Cleanup on unmount
        return () => {
            removeGeneratedListener();
            removeErrorListener();
            removeTabListener();
            // Reset state when preview panel is closed
            setPrintPreview({ path: null, isLoaded: false, error: null });
        };
    }, []);

    const pdfPath = printPreview.path;
    const isLoading = !printPreview.isLoaded;
    const error = printPreview.error;

    const handleOnClickExpand = useCallback(async () => {
        if (!pdfPath) {
            console.warn('No PDF path available for expanding');
            return;
        }

        try {
            // Use the new API to open the PDF file directly
            // This will trigger the full flow: onDocumentOpened -> toolbar event -> AppTabs -> new tab creation
            await window.doc.openDocumentAtPath(pdfPath);
        } catch (error) {
            console.error('Error opening PDF in new tab:', error);
        }
    }, [pdfPath]);

    // Handler for PDF viewer errors - update local state to show error in Preview component
    const handlePdfError = useCallback((errorMessage: string) => {
        console.error('PDFViewer error:', errorMessage);
        // Update local state to show error with button to regenerate
        setPrintPreview({ path: null, isLoaded: true, error: errorMessage });
    }, []);

    // Track container dimensions for auto-zoom
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className={cn(
            main.toolbarIsVisible && main.statusBarVisible
                ? "h-[calc(100vh-5.5rem)]" : main.statusBarVisible
                    ? "h-[calc(100vh-2.5rem)]" : main.toolbarIsVisible
                        ? "h-[calc(100vh-3rem)]" : "h-[100vh]"
        )}>
            <div className="flex flex-col h-full">
                <nav className={cn("h-8 px-2 flex items-center border-b border-grey-80 dark:border-grey-30 bg-white dark:bg-grey-20")}>
                    <div className='cursor-pointer'>
                        <DragIndicator intent='primary' variant='tonal' size='small' />
                    </div>
                    <span className="ml-2 text-xs font-medium text-grey-10 dark:text-grey-95">Preview</span>
                    <div className="ml-auto relative space-x-1">
                        <Button
                            intent="secondary"
                            variant="icon"
                            size="iconSm"
                            onClick={handleOnClickRefresh}
                            icon={<Sync intent='primary' variant='tonal' size='small' />}
                        />
                        <Button
                            intent="secondary"
                            variant="icon"
                            size="iconSm"
                            onClick={handleOnClickExpand}
                            disabled={!pdfPath || isLoading}
                            icon={<Expand_1 intent='primary' variant='tonal' size='small' />}
                        />
                        <Button
                            intent="secondary"
                            variant="icon"
                            size="iconSm"
                            onClick={handleOnClickClose}
                            icon={<CloseBig intent='primary' variant='tonal' size='small' />}
                        />
                    </div>
                </nav>

                <div ref={containerRef} className="flex-1 h-100 overflow-hidden bg-grey-95 dark:bg-grey-10">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-50 dark:border-primary-60 mx-auto mb-4"></div>
                                <p className="text-sm text-grey-50 dark:text-grey-80">{t('pdf.generating')}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-full p-4">
                            <div className="text-center max-w-sm">
                                <div className="mb-4 bg-amber-50 dark:bg-amber-950/30 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                    <svg className="w-8 h-8 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-grey-50 dark:text-grey-80 mb-5">
                                    {t('pdf.preview.notAvailable')}
                                </p>
                                <Button
                                    intent="secondary"
                                    variant="outline"
                                    size="small"
                                    onClick={handleOnClickRefresh}
                                >
                                    <Sync className="mr-2" />
                                    {t('pdf.regenerate') || 'Regenerate Preview'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && pdfPath && (
                        <PDFViewer
                            filePath={pdfPath}
                            onError={handlePdfError}
                            context="preview"
                        />
                    )}
                    {!isLoading && !error && !pdfPath && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-grey-50 dark:text-grey-80">{t('pdf.noPdfToDisplay')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
})

export default Preview;