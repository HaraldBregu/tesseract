import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";
import DragHandle from "@/components/icons/DragHandle";
import Typogaphy from "@/components/Typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ColDetailsType,
  TElement,
} from "@/pages/editor/dialogs/setup/LayoutSetup/types";
import { settingsLayout } from "../constants";
import { useTranslation } from "react-i18next";
import { TooltipTrigger, TooltipContent, Tooltip } from "@radix-ui/react-tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppCheckbox from "@/components/app-checkbox";
import { AppSelect, AppSelectContent, AppSelectTrigger } from "@/components/app/app-select";
import IconPencil from "@/components/app/icons/IconPencil";
import AppButton from "@/components/app/app-button";
import IconCloseBig from "@/components/app/icons/IconCloseBig";
import IconCheck from "@/components/app/icons/IconCheck";
import AppInput from "@/components/app/app-input";

interface LayoutPartElementProps {
  details: TElement & {
    hasContent?: boolean;
  };
  onDelete: (index: number) => void;
  index: number;
  onChangeColumnNr: (i: number, details: TElement) => void;
  sectionTypes: { [key in ApparatusType]: ColDetailsType };
  dragHandler: (c: ReactNode) => ReactNode;
  curLayout?: string;
  curSection: string;
  setApparatusSectionTypes: Dispatch<SetStateAction<{
    item: string;
    disabled: boolean;
  }[]>>
  apparatusSectionTypes: {
    item: string;
    disabled: boolean;
  }[];
  setIncludedElements: (action: {
    type:
    | "textColumns"
    | "nrApparatus"
    | "apparatusColumns"
    | "apparatusDetails";
    posi: string;
    payload: number | TElement[];
  }) => void;
  apparatusElements: TElement[];
  apparatuses: DocumentApparatus[];
}

const LayoutPartElement = ({
  details,
  curLayout,
  curSection,
  onDelete,
  index,
  onChangeColumnNr,
  dragHandler,
  setIncludedElements,
  apparatusElements,
  apparatusSectionTypes,
  setApparatusSectionTypes,
  apparatuses,
}: LayoutPartElementProps) => {
  const { t } = useTranslation();
  const [edit, setEdit] = useState<boolean>(false);
  const [dets, setDets] = useState<TElement & {
    hasContent?: boolean;
  }>(details);
  const [apparatusDetails, setApparatusDetails] = useState<TElement[]>(apparatusElements);

  const editEndHandler = (i, details) => {
    onChangeColumnNr(i, details);
    setEdit(false);
  };

  useEffect(() => {
    setApparatusDetails(apparatusElements);
  }, [apparatusElements]);

  const getArrayFromNumber = (num) => Array.from({ length: num }, (_, i) => i + 1);
  const changeTitleValue = (e) => {
    const findSameName = apparatusDetails.find(({ title }) => title === e.target.value);
    if (!findSameName) {
      setDets((prev) => ({ ...prev, title: e.target.value }));
    }
  };

  const sectionTypeLabel = (sectionType) => {
    switch (sectionType) {
      case "text":
        return "Text";
      case "CRITICAL":
        return "Critical";
      case "PAGE_NOTES":
        return "Page notes";
      case "SECTION_NOTES":
        return "Section notes";
      case "INNER_MARGIN":
        return "Inner margin";
      case "OUTER_MARGIN":
        return "Outer margin";
      default:
        return "Critical";
    }
  };

  const hasContent = useCallback(() => {
    const apparatus = apparatuses.find(({ id }) => id === dets.id)
    const content = apparatus?.content?.content ?? []
    return content.length > 0
  }, [apparatuses, dets.id])

  useEffect(() => {
    const outerMarginExists = apparatusDetails.find(({ sectionType }) => sectionType === 'OUTER_MARGIN')
    const innerMarginExists = apparatusDetails.find(({ sectionType }) => sectionType === 'INNER_MARGIN')
    const sectionNotesExists = apparatusDetails.find(({ sectionType }) => sectionType === 'SECTION_NOTES')
    const pageNotesExists = apparatusDetails.find(({ sectionType }) => sectionType === 'PAGE_NOTES')

    setApparatusSectionTypes((prev) =>
      prev.map((el) => {
        if (el.item === 'OUTER_MARGIN') {
          return { ...el, disabled: !!outerMarginExists };
        }
        if (el.item === 'INNER_MARGIN') {
          return { ...el, disabled: !!innerMarginExists };
        }
        if (el.item === 'SECTION_NOTES') {
          return { ...el, disabled: !!sectionNotesExists };
        }
        if (el.item === 'PAGE_NOTES') {
          return { ...el, disabled: !!pageNotesExists };
        }
        return el;
      })
    );
  }, [apparatusDetails]);

  const handleOnCheckedChange = useCallback((checked: boolean) => {
    const { id } = dets;
    setDets((prev) => ({
      ...prev,
      visible: checked,
      disabled: apparatusDetails.filter(({ visible }) => visible).length === 1
    }));
    setApparatusDetails((prev) => prev.map((app) => {
      return app.id === id ? { ...app, visible: checked, disabled: prev.filter(({ visible }) => visible).length === 1 } : { ...app }
    }));
  }, []);

  useEffect(() => {
    setIncludedElements({
      type: "apparatusDetails",
      posi: curSection,
      payload: apparatusDetails
    });
  }, [apparatusDetails]);


  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-1">

        {details.type !== 'text' ? (
          dragHandler(<DragHandle className="cursor-move" />)
        ) : (<div className="w-[24px] h-[24px]" />)}

        {(apparatusDetails.filter(({ visible }) => visible).length === 2 && dets.visible || dets.type === "text")
          ? <AppCheckbox
            className={"mt-2 h-5 w-5 data-[state=checked]:bg-grey-70 data-[state=checked]:border-grey-70 data-[state=checked]:text-grey-30"}
            checked={true}
            disabled={true}
            onCheckedChange={handleOnCheckedChange}
          />
          : <AppCheckbox
            className={"mt-2 h-5 w-5 "}
            checked={dets.visible}
            disabled={false}
            onCheckedChange={handleOnCheckedChange}
          />
        }
        <div className="flex flex-col">
          <div>
            {edit ? (
              <AppInput
                value={dets.title}
                onChange={changeTitleValue}
              />
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="w-[8rem]">
                      <Typogaphy component="p" className={`${dets.title.length > 15 && 'truncate'} text-left font-semibold dark:text-grey-90`}>
                        {dets.title}
                      </Typogaphy>
                    </div>
                  </TooltipTrigger>
                  {dets.title.length > 15 && <TooltipContent className="bg-white dark:bg-grey-10 p-2 z-100">
                    <p className="dark:text-grey-90"> {dets.title}</p>
                  </TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div>
            <Select
              disabled={!edit || hasContent()}
              value={dets.sectionType}
              onValueChange={(val: string) => {
                setDets((prev) => ({
                  ...prev,
                  columns: prev.type === 'apparatus' ? 1 : prev.columns, // Always 1 column for apparatus
                  sectionType: val as ApparatusType,
                }));
              }}
            >
              {details && details.type === "apparatus" && (
                <SelectTrigger
                  className="min-w-[140px]
                                    pl-[4px]
                                    pr-[2px]
                                    py-0
                                    h-auto
                                    border-none
                                    shadow-none
                                    focus:ring-0
                                    focus:ring-offset-0
                                "
                  aria-label="Select a value"
                >
                  <SelectValue placeholder="select column" />
                </SelectTrigger>
              )}
              <SelectContent className="rounded-xl">
                {apparatusSectionTypes.map((sectionType) => (
                  <SelectItem
                    className="
                                        hover:bg-primary
                                        hover:text-white
                                        active:bg-primary
                                        active:text-white
                                        focus-visible:bg-primary
                                        focus-visible:text-white
                                    "
                    value={sectionType.item}
                    key={sectionType.item}
                    disabled={(apparatusDetails.filter(({ sectionType }) => sectionType === 'CRITICAL').length === 1 && dets.sectionType === 'CRITICAL') ? true : sectionType.disabled}
                  >
                    {sectionTypeLabel(sectionType.item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {dets.type === "text" && (
              <AppSelect
                disabled={!edit}
                value={(dets?.columns || 1).toString()}
                onValueChange={(val) =>
                  setDets((prev) => ({ ...prev, columns: parseInt(val) }))
                }>
                <AppSelectTrigger
                  className="min-w-[140px] pl-[4px] pr-[2px] py-0 h-auto border-none shadow-none focus:ring-0 focus:ring-offset-0"
                  aria-label="Select a value">
                  <SelectValue placeholder="select column" />
                </AppSelectTrigger>
                <AppSelectContent className="rounded-xl">
                  {curLayout &&
                    settingsLayout[curLayout][curSection].columnDetails &&
                    settingsLayout[curLayout][curSection].columnDetails[
                    dets.sectionType
                    ] &&
                    getArrayFromNumber(
                      settingsLayout[curLayout][curSection].columnDetails[
                        dets.sectionType
                      ].columnNr || 1
                    ).map((_, i) => (
                      <SelectItem
                        className="hover:bg-primary hover:text-white active:bg-primary active:text-white focus-visible:bg-primary focus-visible:text-white"
                        value={(i + 1).toString()}
                        key={i + 1}>
                        {i + 1} {t("pageSetup.component.columns")}
                      </SelectItem>
                    ))}
                </AppSelectContent>
              </AppSelect>
            )}
            {dets.type === "apparatus" && (
              <div className="min-w-[140px] pl-[4px] pr-[2px] py-0 text-sm text-gray-600 dark:text-gray-400">
                1 {t("pageSetup.component.columns")}
              </div>
            )}
          </div>
        </div>
      </div>

      {edit && (
        <div className="flex items-start gap-1 sm:flex-wrap md:flex-wrap xl:flex-nowrap">
          <AppButton
            variant="button-icon"
            size="icon"
            onClick={() => editEndHandler(index, dets)}>
            <IconCheck />
          </AppButton>
        </div>
      )}

      {!edit && (
        <div className="flex items-start gap-1 flex-wrap ">
          <AppButton
            variant="button-icon"
            size="icon"
            onClick={() => setEdit(true)}>
            <IconPencil />
          </AppButton>

          {(apparatusDetails.length > 2 && index !== 0) && (
            <AppButton
              variant="button-icon-destructive"
              size="icon"
              disabled={(apparatusDetails.filter(({ sectionType }) => sectionType === 'CRITICAL').length === 1 && dets.sectionType === 'CRITICAL')}
              onClick={() => onDelete(index)}>
              <IconCloseBig />
            </AppButton>
          )}
        </div>
      )}
    </div>
  );
};

export default LayoutPartElement;
