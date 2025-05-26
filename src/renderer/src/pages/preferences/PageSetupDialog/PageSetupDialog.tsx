import Typography from "@components/Typography";
import { Accordion } from "@/components/ui/accordion";
import { Reducer, useEffect, useMemo, useReducer, useState } from "react";
import { SortableArea } from "@components/drag-drop-area";
import PageSetup from "./components/page-setup";
import { defaultLayout, sectionLayouts, settingsLayout } from "./constants";
import {
  selectLayoutSettings,
  selectLayoutStandardPageDimensions,
  selectLayoutAvailableApparatusTypes,
} from "../store/layout/layout.selector";
import { useTranslation } from "react-i18next";
import AppRadioGroup from "@/components/app-radiogroup";
import PageVisibilityElements from "./components/page-visibility-elements";
import LayoutShape from "./components/layout-shape";
import PageLayoutAccordion from "./components/page-layout-accordion";
import TextContentManagement from "./components/text-content-management";
import Button from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { updateSetupPageState } from "../store/layout/layout.sclice";
import { AvailableApparatusTypes } from "../store/layout/layout.state";
import Modal from "@/components/ui/modal";
import colors from "../../../../../../tailwindColors.json";
import LayoutShapeText from "./components/layout-shape-text";

interface PageSetupDialogProps {
  open: boolean;
  onClose: (data: Template | undefined) => void;
}

export function PageSetupDialog({ open, onClose }: PageSetupDialogProps) {
  const { setupDialogState, setupOption, sort } =
    useSelector(selectLayoutSettings);
  const standardPageDimensions = useSelector(
    selectLayoutStandardPageDimensions
  );
  const availableApparatusTypes = useSelector(
    selectLayoutAvailableApparatusTypes
  );
  const [orderedItms, setOrderedItms] = useState<SetupDialogStateKeys[]>(sort);
  const [curSection, setCurSection] = useState<string>("");
  const [optSetup, setOptSetup] = useState<SetupOptionType>(setupOption);
  const [includedElements, setIncludedElements] = useReducer<
    Reducer<
      SetupDialogStateType,
      { type: string; posi: string; payload: unknown }
    >
  >(
    (state, action) => ({
      ...state,
      [action.posi]: {
        ...state[action.posi],
        [action.type]: action.payload,
      },
    }),
    setupDialogState
  );

  const { template_type } = optSetup || {};
  const isReadonly = template_type === "Community";
  const [availableApparatusTypesState, setavailableApparatusTypesState] =
    useState<AvailableApparatusTypes>(availableApparatusTypes);

  const { layout: curLayout = defaultLayout, apparatusDetails } =
    includedElements?.[curSection] || {};

  const [textColDetails, ...apparatusColDetails] = useMemo(
    () => apparatusDetails || [],
    [apparatusDetails]
  );
  const layouts = sectionLayouts[curSection] || [];

  const dispatch = useDispatch();

  const { t } = useTranslation();

  const checkboxChangeHdlr = (posi, payload) =>
    setIncludedElements({ type: "visible", posi, payload });

  const cancelButnClickHdlr = () => onClose({template: {
        pageSetup: setupOption,
        sectionOrders: sort,
        layoutTemplate: setupDialogState,
      }});
  const saveBtnClickHdlr = () => {
    dispatch(
      updateSetupPageState({
        setupDialogState: includedElements,
        sort: orderedItms,
        setupOption: optSetup,
      })
    );
    onClose({template: {
        pageSetup: optSetup,
        sectionOrders: orderedItms,
        layoutTemplate: includedElements,
      }});
  };


  useEffect(() => {
    setavailableApparatusTypesState(settingsLayout[curLayout]);
  }, [curLayout]);

  return (
    <>
      <Modal
        title={t("pageSetup.title")}
        isOpen={open}
        onOpenChange={() => {}}
        className="!flex overflow-hidden !flex-col !gap-0 min-w-[1100px] h-auto max-h-[100%]"
        actions={[
          <Button
            key="cancel"
            className="w-24 items-center justify-center"
            size="mini"
            intent={"secondary"}
            variant={"tonal"}
            onClick={cancelButnClickHdlr}
          >
            {t("buttons.cancel")}
          </Button>,
          <Button
            key="save"
            className="w-24 items-center justify-center"
            size="mini"
            intent={"primary"}
            onClick={saveBtnClickHdlr}
            disabled={isReadonly}
          >
            {t("buttons.save")}
          </Button>,
        ]}
        contentClassName="h-full"
        headerClassName="!flex-1"
        footerClassName="!flex-1 items-center h-auto max-h-[20%]"
      >
        <div className="flex flex-2 flex-row justify-between bg-gray-100 overflow-y-hidden h-[680px] min-w-[1070px]">
          <div
            className="flex w-[259px] pt-5 pb-5 pl-[12px] pr-[12px] overflow-auto flex-col bg-white"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <div>
              <Typography component="h4" className="border-b pb-6">
                {t("pageSetup.component.configurationSubtitle")}
              </Typography>
            </div>
            <div className="flex flex-col">
              <Accordion type="single" collapsible>
                <PageVisibilityElements
                  orderedItms={sort}
                  includedElements={includedElements}
                  checkboxChangeHdlr={checkboxChangeHdlr}
                  readonly={isReadonly}
                />
                <PageSetup
                  exportSetup={setOptSetup}
                  initialSetup={setupOption}
                  readonly={isReadonly}
                  standardPageDimensions={standardPageDimensions}
                />
              </Accordion>
            </div>
          </div>
          <div className="flex w-[532px] justify-center p-5">
            <SortableArea<SetupDialogStateKeys>
              includedElements={includedElements}
              itemLs={orderedItms}
              readSorted={setOrderedItms}
              readonly={isReadonly}
              wrapper={(x) => (
                <Accordion
                  type="single"
                  className="!p-0 flex flex-col w-[393px] gap-2"
                  collapsible
                  onValueChange={(v) => setCurSection(v)}
                >
                  {x}
                </Accordion>
              )}
              item={(v, _, drag) =>
                includedElements[v].visible ? (
                  <PageLayoutAccordion
                    accordionDisabled={v === "toc"}
                    dragHandler={drag}
                    v={v}
                    title={t(`pageSetup.component.section.${v}`)}
                  >
                    <div className="bg-white w-[393px] p-2 lg:p-5 flex flex-row justify-start gap-4 border-t h-[475px]">
                      <AppRadioGroup
                        disabled={isReadonly}
                        items={layouts
                          .filter(({ visible }) => visible(apparatusColDetails))
                          .map(({ name }) => ({
                            value: name,
                            label: name,
                            icon: (
                              <LayoutShape
                                variant="small"
                                key={name}
                                layoutName={name}
                                isSelected={name === curLayout}
                                isReadonly={isReadonly}
                                className="w-[56px] h-[78px] lg:w-[56px] p-2"
                                apparatusDetails={apparatusColDetails || []}
                                textDetails={textColDetails || {}}
                              />
                            ),
                          }))}
                        onValueChange={(lt) =>
                          setIncludedElements({
                            type: "layout",
                            posi: curSection,
                            payload: lt,
                          })
                        }
                        className="flex flex-col items-end gap-2 items-center"
                        variant="icon"
                      />
                      {v === "critical" ? (
                        <LayoutShape
                          variant="big"
                          layoutName={curLayout}
                          apparatusDetails={apparatusColDetails || []}
                          textDetails={textColDetails || {}}
                          showDetails
                          className="!w-[281px] p-4 col-span-3 h-[398px]"
                        />
                      ) : (
                        <LayoutShapeText layout={curLayout} />
                      )}
                    </div>
                  </PageLayoutAccordion>
                ) : (
                  <div className="d-none" />
                )
              }
            />
          </div>
          {curSection &&
          curSection !== "intro" &&
          curSection !== "bibliography" ? (
            <div
              className="overflow-auto flex w-[280px] gap-3 pt-5 pb-5 pl-[12px] pr-[12px] flex-col bg-white"
              style={{ scrollbarWidth: "none" }}
            >
              <>
                <div>
                  <Typography component="h4" className="border-b pb-6">
                    {t(`pageSetup.component.section.${curSection}`)}
                  </Typography>
                </div>

                <TextContentManagement
                  readonly={isReadonly}
                  curSection={curSection}
                  curLayout={curLayout}
                  setIncludedElements={setIncludedElements}
                  apparatusDetails={apparatusDetails}
                  availableApparatusTypes={
                    availableApparatusTypesState[curSection].columnDetails
                  }
                  iconClassName="mt-[5px]"
                  textColor={`${colors.secondary.DEFAULT}`}
                />
              </>
            </div>
          ) : (
            <div className="flex w-[280px] pt-5 pb-5 pl-[12px] pr-[12px] flex-col bg-transparent" />
          )}
        </div>
      </Modal>
    </>
  );
}
