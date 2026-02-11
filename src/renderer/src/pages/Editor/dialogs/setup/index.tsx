import { memo, useCallback, useEffect, useMemo } from "react"
import { useEditor } from "../../hooks/use-editor"
import {
    setBibliographyList,
    setBibliographySetupDialogVisible,
    setChangeTemplateModalVisible,
    setChooseTemplateModalVisible,
    setConfirmChangeTemplateModal,
    setCustomizeStatusBarVisible,
    setExportTeiSetupDialogVisible,
    setHeaderFooterSetupDialogVisible,
    setLayoutSetupDialogVisible,
    setLineNumberSetupDialogVisible,
    setMetadataSetupDialogVisible,
    setPageNumberSetupDialogVisible,
    setPageSetupOptDialogVisible,
    setPrintSetupDialogVisible,
    setReferenceFormat,
    setReferenceFormatVisible,
    setSaveTemplateDialogVisible,
    setSectionStyleSetupDialogVisible,
    setSiglumList,
    setSiglumSetupDialogVisible,
    setStyles,
    setTocSetupDialogVisible,
} from "../../provider"
import { Siglum } from "./Siglum"
import LineNumberSettings from "./LineNumberSettings"
import PageNumberSettings from "./PageNumberSettings"
import TocSettings from "./TocSettings"
import ReferencesFormatModal from "./ReferencesFormat/ReferenceFormatSetup"
import MetadataSetup from "./metadata/MetadataSetup"
import CustomizeStatusBar from "./CustomizeStatusBar"
import Styles from "./Styles"
import SaveAsTemplateModal from "./SaveAsTemplateModal"
import ChooseTemplateModal from "./ChooseTemplateModal"
import LayoutSetup from "./LayoutSetup/LayoutSetup"
import ChangeTemplateModal from "./ChangeTemplateModal"
import { BibliographySetup } from "./Bibliography/BibliographySetup"
import HeaderFooterSettings from "./HeaderFooterSettings"
import PrintSetup from "./PrintSetup"
import PageSetup from "./PageSetup"
import { useElectron } from "@/hooks/use-electron"
import ExportTeiSetup from "./ExportTeiSetup"

interface SetupDialogsProps {
    storeStatusBarConfig: (items: string[]) => void;
    onSaveTemplate: (value: any) => void;
    onSelectTemplate: (template: Template) => void;
    onSaveLayout: (deletedApparatusIds: string[], layout: Layout, pageSetup: SetupOptionType, sort: string[]) => void;
    onChangeTemplate: (selectedTemplate: any) => void;
    onSaveToc: (settings: TocSettings) => void;
    onApplyReferenceFormat: () => void;
    onSaveMetadata: (metadata: Metadata) => void;
    onSaveStyles: () => void;
}

const SetupDialogs = ({
    storeStatusBarConfig,
    onSaveTemplate,
    onSelectTemplate,
    onSaveLayout,
    onChangeTemplate,
    onSaveToc,
    onApplyReferenceFormat,
    onSaveMetadata,
    onSaveStyles,
}: SetupDialogsProps) => {
    const [state, dispatch] = useEditor()
    const electron = useElectron()

    const siglumSetupDialogVisible = useMemo(() => state.siglumSetupDialogVisible, [state.siglumSetupDialogVisible]);
    const lineNumberSetupDialogVisible = useMemo(() => state.lineNumberSetupDialogVisible, [state.lineNumberSetupDialogVisible]);
    const pageNumberSetupDialogVisible = useMemo(() => state.pageNumberSetupDialogVisible, [state.pageNumberSetupDialogVisible]);
    const headerFooterSetupDialogVisible = useMemo(() => state.headerFooterSetupDialogVisible, [state.headerFooterSetupDialogVisible]);
    const headerFooterInitialTab = useMemo(() => state.headerFooterInitialTab, [state.headerFooterInitialTab]);
    const pageSetupOptDialogVisible = useMemo(() => state.pageSetupOptDialogVisible, [state.pageSetupOptDialogVisible]);
    const tocSetupDialogVisible = useMemo(() => state.tocSetupDialogVisible, [state.tocSetupDialogVisible]);
    const sectionStyleSetupDialogVisible = useMemo(() => state.sectionStyleSetupDialogVisible, [state.sectionStyleSetupDialogVisible]);
    const referenceFormatVisible = useMemo(() => state.referenceFormatVisible, [state.referenceFormatVisible]);
    const metadataSetupDialogVisible = useMemo(() => state.metadataSetupDialogVisible, [state.metadataSetupDialogVisible]);
    const customizeStatusBarVisible = useMemo(() => state.customizeStatusBarVisible, [state.customizeStatusBarVisible]);
    const saveTemplateDialogVisible = useMemo(() => state.saveTemplateDialogVisible, [state.saveTemplateDialogVisible]);
    const chooseTemplateModalVisible = useMemo(() => state.chooseTemplateModalVisible, [state.chooseTemplateModalVisible]);
    const layoutSetupDialogVisible = useMemo(() => state.layoutSetupDialogVisible, [state.layoutSetupDialogVisible]);
    const changeTemplateModalVisible = useMemo(() => state.changeTemplateModalVisible, [state.changeTemplateModalVisible]);
    const bibliographySetupDialogVisible = useMemo(() => state.bibliographySetupDialogVisible, [state.bibliographySetupDialogVisible]);
    const printSetupDialogVisible = useMemo(() => state.printSetupDialogVisible, [state.printSetupDialogVisible]);
    const printOptions = useMemo(() => state.printOptions, [state.printOptions]);
    const exportTeiSetupDialogVisible = useMemo(() => state.exportTeiSetupDialogVisible, [state.exportTeiSetupDialogVisible]);
    const referenceFormat = useMemo(() => state.referenceFormat, [state.referenceFormat]);

    const handleReferenceFormatSave = useCallback(async (data: ReferencesFormat, apply?: boolean) => {
        await dispatch(setReferenceFormat(data));
        electron.doc.setReferencesFormat(data);
        dispatch(setReferenceFormatVisible(false));
        if (apply) {
            onApplyReferenceFormat();
        }
    }, []);

    useEffect(() => {
        electron.doc
            .getReferencesFormat()
            .then((referencesFormat) => {
                if (!referencesFormat) return
                dispatch(setReferenceFormat(referencesFormat))
            })
    }, [electron.doc])

    const handleExportSiglumList = useCallback(() => {
        if (!state.siglumList)
            return;
        electron.doc.exportSigla(state.siglumList)
    }, [electron.doc, state.siglumList]);

    const handlePageSetupSave = useCallback((pageSetup: SetupOptionType) => {
        electron.doc.setPageSetup(pageSetup)
    }, [electron.doc])

    const onHideCustomizeStatusBar = useCallback(() => dispatch(setCustomizeStatusBarVisible(false)), []);

    useEffect(() => {
        const getSiglumList = async () => {
            const _sigla = await electron.doc.getSiglumList()
            dispatch(setSiglumList(_sigla.map(data => ({
                ...data,
                id: crypto.randomUUID(),
            }))))
        }
        getSiglumList()

        const getBibliographyList = async () => {
            const _bibliographies = await electron.doc.getBibliographies()
            dispatch(setBibliographyList(_bibliographies.map(data => ({
                ...data,
                id: crypto.randomUUID(),
            }))))
        }
        getBibliographyList()
    }, [])

    const handleSiglumSetupClose = useCallback(() => {
        dispatch(setSiglumSetupDialogVisible(false))
    }, [dispatch])

    const handleBibliographySetupCancel = useCallback(() => {
        dispatch(setBibliographySetupDialogVisible(false))
    }, [dispatch]);

    const handlePrintSetupCancel = useCallback(() => {
        dispatch(setPrintSetupDialogVisible(false))
    }, [dispatch]);

    const handlePageNumberSettingsSave = useCallback((pageNumberSettings: PageNumberSettings) => {
        electron.doc.setPageNumberSettings(pageNumberSettings);
    }, [electron.doc]);

    const handleLineNumberSettingsSave = useCallback((lineNumberSettings: LineNumberSettings) => {
        electron.doc.setLineNumberSettings(lineNumberSettings);
        electron.menu.setLineNumberShowLines(lineNumberSettings.showLines);
    }, [electron.doc, electron.menu]);

    const handleSectionStyleSave = useCallback(async (sectionStyle: Style[]) => {
        await electron.doc.setStyles(sectionStyle);
        dispatch(setStyles(sectionStyle));
        onSaveStyles();
    }, [electron.doc, onSaveStyles, dispatch]);

    const handleExportTeiSetupCancel = useCallback(() => {
        dispatch(setExportTeiSetupDialogVisible(false))
    }, [dispatch]);

    const handleExportTei = useCallback(() => {
        window.doc.exportToTei();
        dispatch(setExportTeiSetupDialogVisible(false))
    }, [window.doc, dispatch]);

    return (
        <>
            {pageNumberSetupDialogVisible && <PageNumberSettings
                isOpen={pageNumberSetupDialogVisible}
                setIsOpen={(open) => dispatch(setPageNumberSetupDialogVisible(open))}
                onSave={handlePageNumberSettingsSave}
            />}

            {lineNumberSetupDialogVisible && <LineNumberSettings
                isOpen={lineNumberSetupDialogVisible}
                setIsOpen={(open) => dispatch(setLineNumberSetupDialogVisible(open))}
                onSave={handleLineNumberSettingsSave}
            />}

            {tocSetupDialogVisible && <TocSettings
                isOpen={tocSetupDialogVisible}
                setIsOpen={(open) => dispatch(setTocSetupDialogVisible(open))}
                onDone={onSaveToc}
            />}

            {pageSetupOptDialogVisible && <PageSetup
                isOpen={pageSetupOptDialogVisible}
                setIsOpen={(open) => dispatch(setPageSetupOptDialogVisible(open))}
                onSave={handlePageSetupSave}
            />}

            {/* HEADER & FOOTER SETUP DIALOG */}
            {headerFooterSetupDialogVisible && <HeaderFooterSettings
                isOpen={headerFooterSetupDialogVisible}
                setIsOpen={(open) => dispatch(setHeaderFooterSetupDialogVisible(open, headerFooterInitialTab))}
                initialTab={headerFooterInitialTab}
                onSave={(headerSettings, footerSettings) => {
                    electron.doc.setHeaderSettings(headerSettings)
                    electron.doc.setFooterSettings(footerSettings)
                }}
            />}

            {/* SECTION STYLE SETUP DIALOG */}
            {sectionStyleSetupDialogVisible && <Styles
                isOpen={sectionStyleSetupDialogVisible}
                setIsOpen={(open) => dispatch(setSectionStyleSetupDialogVisible(open))}
                onSave={handleSectionStyleSave}
            />}

            {/* SIGLUM SETUP DIALOG */}
            {siglumSetupDialogVisible && <Siglum
                open={siglumSetupDialogVisible}
                onCancel={handleSiglumSetupClose}
                onExportSiglumList={handleExportSiglumList}
            />}

            {/* References Format SETUP DIALOG */}
            {referenceFormatVisible && <ReferencesFormatModal
                initialConfigs={referenceFormat}
                isOpen={referenceFormatVisible}
                onCancel={() => dispatch(setReferenceFormatVisible(false))}
                onSave={handleReferenceFormatSave}
            />}

            {/* STATUS BAR CUSTOMIZATION SETUP DIALOG */}
            {customizeStatusBarVisible && <CustomizeStatusBar
                onCancel={onHideCustomizeStatusBar}
                isOpen={customizeStatusBarVisible}
                onSave={storeStatusBarConfig}
            />}

            {/* METADATA SETUP DIALOG */}
            {metadataSetupDialogVisible && <MetadataSetup
                isOpen={metadataSetupDialogVisible}
                onClose={() => dispatch(setMetadataSetupDialogVisible(false))}
                onSave={onSaveMetadata}
            />}

            {/* SAVE AS TEMPLATE DIALOG */}
            {saveTemplateDialogVisible && <SaveAsTemplateModal
                open={saveTemplateDialogVisible}
                onClose={() => dispatch(setSaveTemplateDialogVisible(false))}
                onSaveTemplate={onSaveTemplate}
            />}

            {/* CHOOSE TEMPLATE MODAL */}
            {chooseTemplateModalVisible && <ChooseTemplateModal
            canCancel={false}
                open={chooseTemplateModalVisible}
                onClose={() => dispatch(setChooseTemplateModalVisible(false))}
                onSelectTemplate={onSelectTemplate}
            />}

            {/* CHANGE TEMPLATE MODAL */}
            {changeTemplateModalVisible && <ChangeTemplateModal
                open={changeTemplateModalVisible}
                onClose={() => dispatch(setChangeTemplateModalVisible(false))}
                onSelectTemplate={onChangeTemplate}
                confirmModalProps={{
                    open: state.confirmChangeTemplateModal?.visible,
                    description: state.confirmChangeTemplateModal?.text,
                    onCancel: () => dispatch(setConfirmChangeTemplateModal({ visible: false, text: "", onConfirm: null })),
                    onSelectTemplate: () => state.confirmChangeTemplateModal?.onConfirm?.()
                }}
            />}

            {/* LAYOUT SETUP DIALOG */}
            {layoutSetupDialogVisible && <LayoutSetup
                open={layoutSetupDialogVisible}
                onClose={() => dispatch(setLayoutSetupDialogVisible(false))}
                onSave={onSaveLayout}
            />}

            {/* BIBLIOGRAPHY SETUP DIALOG */}
            {bibliographySetupDialogVisible && <BibliographySetup
                isOpen={bibliographySetupDialogVisible}
                onCancel={handleBibliographySetupCancel}
            />}

            {/* PRINT SETUP DIALOG */}
            {printSetupDialogVisible && <PrintSetup
                isOpen={printSetupDialogVisible}
                printOptions={printOptions}
                onCancel={handlePrintSetupCancel}
            />}

            {/* EXPORT TEI SETUP DIALOG */}
            {exportTeiSetupDialogVisible && <ExportTeiSetup
                isOpen={exportTeiSetupDialogVisible}
                onCancel={handleExportTeiSetupCancel}
                onExport={handleExportTei}
            />}
        </>
    )
}

export default memo(SetupDialogs)
