import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import type { DocumentLoadEvent } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useTranslation } from 'react-i18next';

// Import worker from pdfjs-dist
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

interface PDFViewerProps {
    filePath: string;
    onError?: (error: string) => void;
    context?: 'preview' | 'viewer'; // 'preview' for print preview, 'viewer' for generic file viewing
}

const PDFViewer: React.FC<PDFViewerProps> = ({ filePath, onError, context = 'viewer' }) => {
    const { t } = useTranslation();
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize plugins
    const zoomPluginInstance = zoomPlugin();
    const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;

    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { CurrentPageInput, GoToNextPage, GoToPreviousPage, NumberOfPages } = pageNavigationPluginInstance;

    useEffect(() => {
        const loadPDF = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('PDFViewer: Loading PDF from:', filePath);

                const data = await window.doc.getFileAsDataUrl(filePath);

                if (data && typeof data === 'string' && data.startsWith('data:application/pdf;base64,')) {
                    // Convert base64 to Uint8Array
                    const base64Data = data.split(',')[1];
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    console.log('PDFViewer: PDF converted to Uint8Array, size:', bytes.length);
                    setPdfData(bytes);
                    setLoading(false);
                } else if (data && typeof data === 'object' && 'byteLength' in data) {
                    const arrayBuffer = data as ArrayBuffer;
                    const bytes = new Uint8Array(arrayBuffer);
                    console.log('PDFViewer: PDF converted to Uint8Array, size:', bytes.length);
                    setPdfData(bytes);
                    setLoading(false);
                } else {
                    throw new Error(t(context === 'preview' ? 'pdf.preview.invalidDataFormat' : 'pdf.viewer.invalidDataFormat'));
                }
            } catch (err) {
                console.error('PDFViewer: Error loading PDF:', err);
                // Check if error is specifically about file not found (expired temp file)
                const errorMessage = err instanceof Error ? err.message : t('pdf.unknownError');
                const isFileNotFound = errorMessage.includes('File not found');

                let errorMsg: string;
                if (context === 'preview') {
                    // Messages for print preview context - don't show file path to user
                    errorMsg = isFileNotFound
                        ? t('pdf.preview.notAvailable') || 'The print preview is no longer available. Please regenerate it.'
                        : t('pdf.preview.failedToLoad') || 'Failed to load print preview';
                } else {
                    // Messages for generic file viewer context
                    errorMsg = isFileNotFound
                        ? t('pdf.viewer.fileNotFound') || 'PDF file not found'
                        : `${t('pdf.viewer.failedToLoad') || 'Failed to load PDF'}: ${errorMessage}`;
                }

                setError(errorMsg);
                onError?.(errorMsg);
                setLoading(false);
            }
        };

        loadPDF();
    }, [filePath, onError, t, context]);

    const handleDocumentLoad = (e: DocumentLoadEvent) => {
        console.log('PDFViewer: Document loaded successfully, pages:', e.doc.numPages);
    };

    // Redirect external https:// links in annotation layer
    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link) {
                const hrefAttr = link.getAttribute('href') || '';
                if (hrefAttr.startsWith('https://')) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    window.electron.ipcRenderer.send('open-external-file', hrefAttr);
                }
            }
        };

        document.addEventListener('click', handleLinkClick, { capture: true });

        return () => {
            document.removeEventListener('click', handleLinkClick, { capture: true });
        };
    }, [pdfData]);

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full gap-5 p-5 text-center">
                <div className="text-base text-destructive-50 dark:text-destructive-80">
                    {error}
                </div>
            </div>
        );
    }

    if (loading || !pdfData) {
        return (
            <div className="flex flex-col justify-center items-center h-full gap-5 text-base text-grey-10 dark:text-grey-95">
                <div>{t('pdf.loading')}</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-grey-95 dark:bg-grey-10">
            <Worker workerUrl={pdfWorkerUrl}>
                {/* Custom Toolbar */}
                <div className="sticky top-0 z-10 p-2.5 border-b border-grey-80 dark:border-grey-30 bg-white dark:bg-grey-20">
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        {/* Navigation Controls */}
                        <div className="flex items-center gap-2.5">
                            <GoToPreviousPage>
                                {(props) => (
                                    <button
                                        onClick={props.onClick}
                                        disabled={props.isDisabled}
                                        className="px-2 py-1 text-sm font-bold bg-white dark:bg-grey-30 border border-grey-80 dark:border-grey-40 rounded hover:bg-grey-95 dark:hover:bg-grey-40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ‹
                                    </button>
                                )}
                            </GoToPreviousPage>

                            <div className="text-xs text-grey-50 dark:text-grey-80 whitespace-nowrap flex items-center gap-1">
                                <style>{`
                                    .rpv-page-navigation__current-page-input {
                                        width: 3rem !important;
                                        padding: 0.125rem 0.25rem !important;
                                        font-size: 0.75rem !important;
                                        text-align: center !important;
                                    }
                                `}</style>
                                Page <CurrentPageInput /> of <NumberOfPages />
                            </div>

                            <GoToNextPage>
                                {(props) => (
                                    <button
                                        onClick={props.onClick}
                                        disabled={props.isDisabled}
                                        className="px-2 py-1 text-sm font-bold bg-white dark:bg-grey-30 border border-grey-80 dark:border-grey-40 rounded hover:bg-grey-95 dark:hover:bg-grey-40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ›
                                    </button>
                                )}
                            </GoToNextPage>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2.5">
                            <div className="hidden lg:block h-4 w-px bg-grey-80 dark:bg-grey-40" />

                            <ZoomOut>
                                {(props) => (
                                    <button
                                        onClick={props.onClick}
                                        className="px-2 py-1 text-sm font-bold bg-white dark:bg-grey-30 border border-grey-80 dark:border-grey-40 rounded hover:bg-grey-95 dark:hover:bg-grey-40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Zoom Out"
                                    >
                                        −
                                    </button>
                                )}
                            </ZoomOut>

                            <CurrentScale>
                                {(props) => (
                                    <span className="text-xs text-grey-50 dark:text-grey-80 min-w-[2rem] text-center whitespace-nowrap">
                                        {Math.round(props.scale * 100)}%
                                    </span>
                                )}
                            </CurrentScale>

                            <ZoomIn>
                                {(props) => (
                                    <button
                                        onClick={props.onClick}
                                        className="px-2 py-1 text-sm font-bold bg-white dark:bg-grey-30 border border-grey-80 dark:border-grey-40 rounded hover:bg-grey-95 dark:hover:bg-grey-40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Zoom In"
                                    >
                                        +
                                    </button>
                                )}
                            </ZoomIn>
                        </div>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto">
                    <Viewer
                        fileUrl={pdfData}
                        onDocumentLoad={handleDocumentLoad}
                        plugins={[zoomPluginInstance, pageNavigationPluginInstance]}
                    />
                </div>
            </Worker>
        </div>
    );
};

export default PDFViewer;