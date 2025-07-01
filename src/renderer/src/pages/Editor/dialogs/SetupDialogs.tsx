import { memo, useCallback, useEffect, useMemo } from "react"
import { useEditor } from "../hooks/useEditor"
import { addSiglumListFromFile, duplicateSiglumListFromFile, replaceSiglumListFromFile, setFontFamilySymbols, setFooterSetupDialogVisible, setHeaderSetupDialogVisible, setLineNumberSetupDialogVisible, setPageNumberSetupDialogVisible, setPageSetupOptDialogVisible, setReferenceFormat, setReferenceFormatVisible, setSiglumSetupDialogVisible, setTocSetupDialogVisible } from "../provider"
import { SiglumSetup } from "./SiglumSetup"
import { useTranslation } from "react-i18next"
import LineNumberSettings from "./LineNumberSettings"
import PageNumberSettings from "./PageNumberSettings"
import HeaderSettings from "./HeaderSettings"
import FooterSettings from "./FooterSettings"
import PageSetupOptionsModal from "./PageSetupOptionsModal"
import TocSettings from "./TocSettings"
import ReferencesFormatModal from "./ReferencesFormat"

export const SetupDialogs = () => {
    const { t } = useTranslation()
    const [state, dispatch] = useEditor()

    const siglumSetupDialogVisible = useMemo(() => state.siglumSetupDialogVisible, [state.siglumSetupDialogVisible]);
    const lineNumberSetupDialogVisible = useMemo(() => state.lineNumberSetupDialogVisible, [state.lineNumberSetupDialogVisible]);
    const pageNumberSetupDialogVisible = useMemo(() => state.pageNumberSetupDialogVisible, [state.pageNumberSetupDialogVisible]);
    const headerSetupDialogVisible = useMemo(() => state.headerSetupDialogVisible, [state.headerSetupDialogVisible]);
    const footerSetupDialogVisible = useMemo(() => state.footerSetupDialogVisible, [state.footerSetupDialogVisible]);
    const pageSetupOptDialogVisible = useMemo(() => state.pageSetupOptDialogVisible, [state.pageSetupOptDialogVisible]);
    const tocSetupDialogVisible = useMemo(() => state.tocSetupDialogVisible, [state.tocSetupDialogVisible]);
    const referenceFormatVisible = useMemo(() => state.referenceFormatVisible, [state.referenceFormatVisible]);

    const siglumList = useMemo(() => state.siglumList, [state.siglumList]);
    const fontFamilyList = useMemo(() => state.fontFamilyList, [state.fontFamilyList]);
    const fontFamilySymbols = useMemo(() => state.fontFamilySymbols, [state.fontFamilySymbols]);
    const referenceFormat = useMemo(() => state.referenceFormat, [state.referenceFormat]);

    const handleImportSiglum = useCallback(async () => {
        const importedSiglum = await window.doc.importSiglumList()

        const duplicateCount = importedSiglum.filter(item =>
            siglumList.some(siglum => siglum.siglum.value === item.siglum.value)
        ).length;

        if (duplicateCount === 0) {
            dispatch(addSiglumListFromFile(importedSiglum))
            return
        }

        const result = await window.system.showMessageBox(
            t("siglum.importDialog.title", { count: duplicateCount }),
            '',
            [
                t("siglum.importDialog.replace", "###Replace###"),
                t("siglum.importDialog.cancel", "###Cancel###"),
                t("siglum.importDialog.keepBoth", "###Keep Both###"),
            ]
        )

        if (result.response === 0)
            dispatch(replaceSiglumListFromFile(importedSiglum))
        else if (result.response === 2)
            dispatch(duplicateSiglumListFromFile(importedSiglum))

    }, [siglumList])

    const handleReferenceFormatSave = useCallback((data: ReferencesFormat) => {
        dispatch(setReferenceFormat(data))
        dispatch(setReferenceFormatVisible(false));
        window.doc.setReferencesFormat(data)
    }, []);

    useEffect(() => {
        window.doc
            .getReferencesFormat()
            .then((referencesFormat) => {
                if (!referencesFormat) return
                dispatch(setReferenceFormat(referencesFormat))
            })
    }, [window.doc])

    const handleExportSiglumList = useCallback(() => {
        window.doc.exportSiglumList(state.siglumList)
    }, [window.doc, state.siglumList])

    
    return (
        <>

            {/* TOC SETUP DIALOG */}
            {tocSetupDialogVisible && <TocSettings
                isOpen={tocSetupDialogVisible}
                setIsOpen={(open) => dispatch(setTocSetupDialogVisible(open))}
            />}

            {/* PAGE SETUP OPTIONS DIALOG */}
            {pageSetupOptDialogVisible && <PageSetupOptionsModal
                isOpen={pageSetupOptDialogVisible}
                setIsOpen={(open) => dispatch(setPageSetupOptDialogVisible(open))}
            />}

            {/* HEADER SETUP DIALOG */}
            {headerSetupDialogVisible && <HeaderSettings
                isOpen={headerSetupDialogVisible}
                setIsOpen={(open) => dispatch(setHeaderSetupDialogVisible(open))}
            />}

            {/* FOOTER SETUP DIALOG */}
            {footerSetupDialogVisible && <FooterSettings
                isOpen={footerSetupDialogVisible}
                setIsOpen={(open) => dispatch(setFooterSetupDialogVisible(open))}
            />}

            {/* PAGE NUMBER SETUP DIALOG */}
            {pageNumberSetupDialogVisible && <PageNumberSettings
                isOpen={pageNumberSetupDialogVisible}
                setIsOpen={(open) => dispatch(setPageNumberSetupDialogVisible(open))}
            />}

            {/* LINE NUMBER SETUP DIALOG */}
            {lineNumberSetupDialogVisible && <LineNumberSettings
                isOpen={lineNumberSetupDialogVisible}
                setIsOpen={(open) => dispatch(setLineNumberSetupDialogVisible(open))}
            />}

            {/* SIGLUM SETUP DIALOG */}
            {siglumSetupDialogVisible && <SiglumSetup
                open={siglumSetupDialogVisible}
                onOpenChange={(open) => dispatch(setSiglumSetupDialogVisible(open))}
                fontFamilyList={fontFamilyList}
                fontFamilySymbols={fontFamilySymbols}
                onSelectFontFamily={async (fontFamily) => {
                    const symbols = await window.system.getSymbols(fontFamily)
                    dispatch(setFontFamilySymbols(symbols))
                }}
                onImportSiglum={handleImportSiglum}
                onExportSiglumList={handleExportSiglumList}
            />}

            {/* References Format SETUP DIALOG */}
            {referenceFormatVisible && <ReferencesFormatModal
                initialConfigs={referenceFormat}
                isOpen={referenceFormatVisible}
                onCancel={() => dispatch(setReferenceFormatVisible(false))}
                handleSave={handleReferenceFormatSave}
            />
            }
        </>
    )
}

export default memo(SetupDialogs)