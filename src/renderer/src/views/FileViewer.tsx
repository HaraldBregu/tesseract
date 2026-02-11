import { useIpcRenderer } from "@/hooks/use-ipc-renderer"
import { useState, useEffect, useRef } from "react"
import PDFViewer from "../components/PDFViewer"

export default function FileViewer() {
    const [filePath, setFilePath] = useState<string | null>(null)
    const [fileUrl, setFileUrl] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [fileType, setFileType] = useState<string | null>(null)

    const containerRef = useRef<HTMLDivElement>(null);

    useIpcRenderer((ipc) => {
        ipc.on('load-file-at-path', async (_: any, filepath: string) => {
            setFilePath(filepath)

            const extension = filepath.split('.').pop()?.toLowerCase();
            setFileType(extension || null);
        })
    })

    useEffect(() => {
        if (filePath && fileType && fileType !== 'pdf') {
            setLoading(true);
            setError(null);

            window.doc.getFileAsDataUrl(filePath)
                .then((dataUrl: string) => {
                    setFileUrl(dataUrl);
                    setLoading(false);
                })
                .catch((err: Error) => {
                    setError(err.message);
                    setLoading(false);
                });
        } else if (filePath && fileType === 'pdf') {
            setLoading(false);
            setError(null);
        }
    }, [filePath, fileType]);

    const handleLoad = () => {
    };

    const handleError = () => {
        setError('Failed to load file in iframe');
    };

    const handlePDFError = (error: string) => {
        setError(error);
    };

    if (fileType === 'pdf' && filePath) {
        return (
            <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col">
                {loading && (
                    <div className="flex justify-center items-center h-full text-base text-grey-10 dark:text-grey-95">
                        Loading PDF...
                    </div>
                )}

                {error && !loading && (
                    <div className="flex justify-center items-center h-full text-base text-destructive-50 dark:text-destructive-80">
                        Error: {error}
                    </div>
                )}

                {!loading && !error && (
                    <div ref={containerRef} className="flex-1 overflow-hidden h-full">
                        <PDFViewer
                            filePath={filePath}
                            onError={handlePDFError}
                            context="viewer"
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {loading && (
                <div className="flex justify-center items-center h-full text-base text-grey-10 dark:text-grey-95">
                    Loading file...
                </div>
            )}

            {error && !loading && (
                <div className="flex justify-center items-center h-full text-base text-destructive-50 dark:text-destructive-80">
                    Error: {error}
                </div>
            )}

            {fileUrl && !loading && !error && (
                <iframe
                    src={fileUrl}
                    className="flex-1 w-full border border-grey-80 dark:border-grey-30"
                    title="File Viewer"
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}
        </div>
    )
}