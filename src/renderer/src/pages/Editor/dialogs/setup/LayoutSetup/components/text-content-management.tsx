import Typography from "@/components/Typography";
import { useTranslation } from "react-i18next";
import LayoutPartElement from "./layout-part-element";
import Button from "@/components/ui/button";
import { useCallback, useState } from "react";
import { useCounter } from "@/hooks/use-counter";
import { PlusCircle } from "lucide-react";
import {
  apparatusTypes,
  ColDetailsType,
  TElement,
} from "@/pages/editor/dialogs/setup/LayoutSetup/types";
import { cn } from "@/lib/utils";
import { MAX_APPARATUS_NUMBER, ALLOWED_APPARATUS_TYPES } from "../constants";
import ConfirmationModal from "@/components/confirmation-modal";
import { SortableArea } from "./drag-drop-area";

interface TextContentManagementProps {
  curSection: string;
  setIncludedElements: (action: {
    type:
    | "textColumns"
    | "nrApparatus"
    | "apparatusColumns"
    | "apparatusDetails";
    posi: string;
    payload: number | TElement[];
  }) => void;
  apparatusDetails: TElement[];
  readonly: boolean;
  availableApparatusTypes: { [key in ApparatusType]: ColDetailsType };
  iconClassName?: string;
  textColor?: string;
  curLayout?: string;
  includedElements: SetupDialogStateType
  apparatuses: DocumentApparatus[]
  onConfirmDeleteApparatusId: (id: string) => void
}

const TextContentManagement = ({
  curSection,
  curLayout,
  setIncludedElements,
  apparatusDetails,
  readonly,
  availableApparatusTypes,
  iconClassName,
  textColor,
  includedElements,
  apparatuses,
  onConfirmDeleteApparatusId,
}: TextContentManagementProps) => {
  const { t } = useTranslation();
  const [counter, setCounter] = useCounter(apparatusDetails.length);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [apparatusSectionTypes, setApparatusSectionTypes] = useState(apparatusTypes)

  const clickHandler = () => {
    // Find the first allowed apparatus type that hasn't been used yet
    // Allow multiple "critical", but only one of each other type
    const usedTypes = includedElements.critical.apparatusDetails
      .filter(app => app.sectionType !== "CRITICAL")
      .map(app => app.sectionType)
      .filter(type => ALLOWED_APPARATUS_TYPES.includes(type as any));
    const availableType = ALLOWED_APPARATUS_TYPES.find(type => type === "CRITICAL" || !usedTypes.includes(type));

    if (!availableType) {
      // If all types are used, still allow adding up to MAX_APPARATUS_NUMBER total
      // but cycle through the types
      const typeIndex = (includedElements.critical.apparatusDetails.length - 1) % ALLOWED_APPARATUS_TYPES.length;
      const cycledType = ALLOWED_APPARATUS_TYPES[typeIndex];

      const newElement: TElement = {
        id: crypto.randomUUID(),
        columns: 1, // Always 1 column for apparatus
        title: `Apparatus ${counter}`,
        sectionType: cycledType,
        type: "apparatus",
        disabled: false,
        visible: true,
      };
      setIncludedElements({
        type: "apparatusDetails",
        posi: curSection,
        payload: apparatusDetails.concat(newElement),
      });
    } else {
      const newElement: TElement = {
        id: crypto.randomUUID(),
        columns: 1, // Always 1 column for apparatus
        title: `Apparatus ${counter}`,
        sectionType: "CRITICAL",
        type: "apparatus",
        disabled: false,
        visible: true,
      };
      setIncludedElements({
        type: "apparatusDetails",
        posi: curSection,
        payload: apparatusDetails.concat(newElement),
      });
    }

    setCounter.increment();
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      const apparatusId = includedElements.critical.apparatusDetails[deleteIndex].id
      onConfirmDeleteApparatusId(apparatusId)

      setApparatusSectionTypes((prev) => {
        return prev.map((el) => {
          if (el.item === includedElements.critical.apparatusDetails[deleteIndex].sectionType) {
            return { ...el, disabled: false };
          }
          return el;
        });
      });
      setIncludedElements({
        type: "apparatusDetails",
        posi: curSection,
        payload: apparatusDetails.filter((_, i) => i !== deleteIndex),
      });
      setShowConfirmModal(false);
      setDeleteIndex(null);
    }
  };

  const defaultDetails: TElement = {
    id: "",
    title: "",
    columns: 1,
    sectionType: "CRITICAL",
    disabled: false,
    type: "apparatus",
    visible: false,
  };

  const detailsHasContent = useCallback((payload) => {
    const found = includedElements.critical.apparatusDetails.find((x) => x.id === payload);
    if (!found) return undefined;
    const hasContent = true
    // apparatusTypeWithText.some(
    //   (content) =>
    //     content.content.content.length > 1 &&
    //     found.title.toLowerCase() === content.title.toLowerCase()
    // );
    return {
      ...found,
      disabled: false,
      hasContent,
    };
  }, [includedElements.critical.apparatusDetails]);

  return (
    <div className="text-[13px] flex flex-col justify-between h-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Typography
            component="label"
            className={cn("ml-1 font-normal text-[13px]")}>
            {t(`pageSetup.component.sectionInclude`)}
          </Typography>
          <SortableArea<string>
            itemLs={includedElements.critical.apparatusDetails?.map((x) => x?.id)}
            readonly={readonly}
            wrapper={(els) => <div className="flex flex-col gap-2">{els}</div>}
            iconClassName={iconClassName}
            item={(payload, i, drag) => (
              <LayoutPartElement
                apparatuses={apparatuses}
                curLayout={curLayout}
                key={payload}
                index={i}
                setIncludedElements={setIncludedElements}
                apparatusElements={includedElements.critical.apparatusDetails}
                details={
                  detailsHasContent(payload) ?? defaultDetails
                }
                onDelete={() => handleDeleteClick(i)}
                onChangeColumnNr={(_, details) => {
                  setIncludedElements({
                    type: "apparatusDetails",
                    posi: curSection,
                    payload: apparatusDetails.map((el) => el.id === details.id ? details : el),
                  })
                }}
                sectionTypes={availableApparatusTypes}
                dragHandler={drag}
                curSection={curSection}
                apparatusSectionTypes={apparatusSectionTypes}
                setApparatusSectionTypes={setApparatusSectionTypes}
              />
            )}
            readSorted={(result) =>
              setIncludedElements({
                type: "apparatusDetails",
                posi: curSection,
                payload: result.map(id => apparatusDetails.find(x => x.id === id)).filter((x): x is TElement => x !== undefined)
              })
            }
          />

          {includedElements.critical.apparatusDetails.length < MAX_APPARATUS_NUMBER + 1 && (
            <div>
              <Button
                disabled={readonly}
                variant="outline"
                className="rounded-[6px] flex flex-row justify-between gap-1 items-center border-secondary"
                size="small"
                onClick={clickHandler}
              >
                <PlusCircle color={`${textColor}`} />
                <span
                  style={{ color: `${textColor}` }}
                  className="inline-flex flex-1 text-[13px]"
                >
                  {t("pageSetup.component.add")}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onConfirm={handleConfirmDelete}
        title={t("pageSetup.confirmationModal.title", { apparatus: deleteIndex && includedElements.critical.apparatusDetails[deleteIndex].title })}
        description={t("pageSetup.confirmationModal.description", { apparatus: deleteIndex && includedElements.critical.apparatusDetails[deleteIndex].title })}
        confirmButtonText={t("pageSetup.buttons.delete")}
        cancelButtonText={t("buttons.cancel")}
      />
    </div>
  );
};

export default TextContentManagement;
