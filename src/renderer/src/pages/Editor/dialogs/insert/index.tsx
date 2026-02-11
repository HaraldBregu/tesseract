import { useCallback, useMemo } from "react";
import { useEditor } from "../../hooks/use-editor";
import { setAddSymbolVisible, setCitationInsertDialogVisible, setCustomSpacingDialogVisible, setInsertCustomReadingTypeDialogVisible, setInsertSiglumDialogVisible, setLinkConfigVisible, setResumeNumberingDialogVisible, setInsertReadingTypeDialogVisible } from "../../provider";
import AddSymbolDialog from "./AddSymbol";
import Siglum from "./Siglum";
import CustomSpacingModal from "../setup/CustomSpacing";
import ResumeNumberingModal from "./ResumeNumbering";
import Citation from "./Citation";
import ReadingTypeCustom from "./ReadingTypeCustom";
import ReadingType from "./ReadingType";
import Link from "./Link";

type InsertDialogsProps = {
    readingTypes: ReadingType[]
    onInsertSiglum: (siglum: Siglum) => void;
    onAddSymbol: (symbol: number) => void;
    onInsertCustomSpacing: (spacing: Spacing) => void;
    onResumeNumbering: (numberBullet: number) => void;
    onInsertCitation: (citationStyle: CITATION_STYLES, citation: BibReference) => void
    onInsertReadingTypeAdd: (readingType: ReadingTypeAdd) => void
    onInsertReadingTypeOm: (readingType: ReadingTypeOm) => void
    onInsertReadingTypeTr: (readingType: ReadingTypeTr) => void
    onInsertReadingTypeDel: (readingType: ReadingTypeDel) => void
    onInsertReadingTypeCustom: (readingType: string) => void
    onInsertLink: (link: string) => void
    onRemoveLink: () => void;
}

const InsertDialogs = ({
    readingTypes,
    onInsertSiglum,
    onAddSymbol,
    onInsertCustomSpacing,
    onResumeNumbering,
    onInsertCitation,
    onInsertReadingTypeAdd,
    onInsertReadingTypeOm,
    onInsertReadingTypeTr,
    onInsertReadingTypeDel,
    onInsertReadingTypeCustom,
    onInsertLink,
    onRemoveLink,
}: InsertDialogsProps) => {
    const [state, dispatch] = useEditor()

    const customSpacingDialogIsOpen = useMemo(() => state.customSpacingDialogVisible, [state.customSpacingDialogVisible])
    const resumeNumberingDialogIsOpen = useMemo(() => state.resumeNumberingDialogVisible, [state.resumeNumberingDialogVisible])
    const suggestedStartNumber = useMemo(() => state.suggestedStartNumber, [state.suggestedStartNumber])
    const citatoinInsertDialogVisible = useMemo(() => state.citationInsertDialogVisible, [state.citationInsertDialogVisible]);
    const currentLink = useMemo(() => state.toolbarState.link, [state.toolbarState.link]);
    const linkConfigVisible = useMemo(() => state.linkConfigVisible, [state.linkConfigVisible]);

    const handleInsertSiglum = useCallback((siglum: Siglum) => {
        onInsertSiglum(siglum)
    }, [onInsertSiglum, dispatch])

    const closeInsertCitationDialog = useCallback(() => {
        dispatch(setCitationInsertDialogVisible(false))
    }, [dispatch])

    return (
        <>
            {/* Add Symbol Dialog */}
            {state.addSymbolVisible && <AddSymbolDialog
                isOpen={state.addSymbolVisible}
                onCancel={() => dispatch(setAddSymbolVisible(false))}
                onApply={onAddSymbol}
            />}

            {/* Insert Siglum Dialog */}
            {state.insertSiglumDialogVisible && <Siglum
                open={state.insertSiglumDialogVisible}
                onCancel={() => dispatch(setInsertSiglumDialogVisible(false))}
                onInsertSiglum={handleInsertSiglum}
            />}

            {/* CUSTOM SPACING DIALOG */}
            {customSpacingDialogIsOpen && <CustomSpacingModal
                isOpen={customSpacingDialogIsOpen}
                onCancel={() => dispatch(setCustomSpacingDialogVisible(false))}
                onApply={onInsertCustomSpacing}
            />}

            {/* RESUME NUMBERING DIALOG */}
            {resumeNumberingDialogIsOpen && <ResumeNumberingModal
                isOpen={resumeNumberingDialogIsOpen}
                initialValue={suggestedStartNumber}
                onCancel={() => dispatch(setResumeNumberingDialogVisible(false))}
                onApply={onResumeNumbering}
            />}

            {/* CITATION INSERT DIALOG */}
            {citatoinInsertDialogVisible && <Citation
                open={citatoinInsertDialogVisible}
                onClose={closeInsertCitationDialog}
                onInsert={onInsertCitation}
            />}

            {/* INSERT CUSTOM READING TYPE DIALOG */}
            {state.insertCustomReadingTypeDialogVisible && <ReadingTypeCustom
                open={state.insertCustomReadingTypeDialogVisible}
                onCancel={() => dispatch(setInsertCustomReadingTypeDialogVisible(false))}
                onInsertReadingType={onInsertReadingTypeCustom}
            />}

            {/* INSERT READING TYPE DIALOG */}
            {state.insertReadingTypeDialogVisible && <ReadingType
                readingTypes={readingTypes}
                open={state.insertReadingTypeDialogVisible}
                onCancel={() => dispatch(setInsertReadingTypeDialogVisible(false))}
                onCustom={() => dispatch(setInsertCustomReadingTypeDialogVisible(true))}
                onSelectReadingTypeAdd={onInsertReadingTypeAdd}
                onSelectReadingTypeOm={onInsertReadingTypeOm}
                onSelectReadingTypeTr={onInsertReadingTypeTr}
                onSelectReadingTypeDel={onInsertReadingTypeDel}
            />}

            {/* LINK CONFIG DIALOG */}
            {linkConfigVisible && <Link
                isOpen={linkConfigVisible}
                onCancel={() => dispatch(setLinkConfigVisible(false))}
                onDone={onInsertLink}
                onRemove={onRemoveLink}
                currentLink={currentLink}
            />}

        </>
    )
}

export default InsertDialogs
