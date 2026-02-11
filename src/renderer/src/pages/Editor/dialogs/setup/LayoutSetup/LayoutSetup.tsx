import Typography from "@components/Typography";
import { Accordion } from "@/components/ui/accordion";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import PageSetup from "./components/page-setup";
import { defaultLayout, sectionLayouts, settingsLayout, isLayoutSupported, standardPageDimensions, availableApparatusTypes } from "./constants";
import { useTranslation } from "react-i18next";
import AppRadioGroup from "@/components/app-radiogroup";
import PageVisibilityElements from "./components/page-visibility-elements";
import LayoutShape from "./components/layout-shape";
import PageLayoutAccordion from "./components/page-layout-accordion";
import TextContentManagement from "./components/text-content-management";
import Button from "@/components/ui/button";
import { AvailableApparatusTypes } from "./types";
import Modal from "@/components/ui/modal";
import colors from "../../../../../../../../tailwindColors.json";
import LayoutShapeText from "./components/layout-shape-text";
import { SortableArea } from "./components/drag-drop-area";

interface LayoutSetupProps {
  open: boolean;
  onClose: () => void;
  onSave: (deletedApparatusIds: string[], layout: Layout, pageSetup: SetupOptionType, sort: string[]) => void;
}

const LayoutSetup = ({
  open,
  onClose,
  onSave,
}: LayoutSetupProps) => {
  const { t } = useTranslation();
  const [curSection, setCurSection] = useState<string>("");
  const [layout, setLayout] = useState<Layout | null>(null)
  const [pageSetup, setPageSetup] = useState<SetupOptionType | null>(null)
  const [orderedItms, setOrderedItms] = useState<SetupDialogStateKeys[]>(['toc', 'intro', 'critical', 'bibliography'])
  const [apparatuses, setApparatuses] = useState<DocumentApparatus[]>([])
  const [deleteApparatusIds, setDeleteApparatusIds] = useState<string[]>([])

  useEffect(() => {
    const loadDocumentTemplate = async () => {
      const template = await window.doc.getTemplate()
      const layout = template.layout
      const pageSetup = template.pageSetup
      const sort = template.sort
      setLayout(layout)
      setPageSetup(pageSetup)
      setOrderedItms(sort as SetupDialogStateKeys[])
    }
    loadDocumentTemplate()

    const loadApparatuses = async () => {
      const apparatuses = await window.doc.getApparatuses()
      setApparatuses(apparatuses)
    }
    loadApparatuses()
  }, [])

  const isReadonly = false
  const [availableApparatusTypesState, setavailableApparatusTypesState] = useState<AvailableApparatusTypes>(availableApparatusTypes);
  const { layout: curLayout = defaultLayout, apparatusDetails } = layout?.[curSection] || {};
  const [textColDetails, ...apparatusColDetails] = useMemo(() => apparatusDetails || [], [apparatusDetails]);
  const layouts = sectionLayouts[curSection] || [];

  const onSaveHandler = useCallback(async () => {
    if (!layout || !pageSetup || !orderedItms) {
      return;
    }

    onSave(deleteApparatusIds, layout, pageSetup, orderedItms);
    onClose();
  }, [layout, pageSetup, orderedItms, deleteApparatusIds])

  useEffect(() => {
    setavailableApparatusTypesState(settingsLayout[curLayout]);
  }, [curLayout]);

  const handleSortedChange = useCallback((els: SetupDialogStateKeys[]) => {
    setOrderedItms(els)
  }, []);

  const visibilityData = useMemo(() => {
    if (!layout) {
      return null;
    }

    const toc = layout.toc
    const intro = layout.intro
    const critical = layout.critical
    const bibliography = layout.bibliography
    return [
      {
        key: "toc",
        value: toc.visible,
        required: toc.required,
      },
      {
        key: "intro",
        value: intro.visible,
        required: intro.required,
      },
      {
        key: "critical",
        value: critical.visible,
        required: critical.required,
      },
      {
        key: "bibliography",
        value: bibliography.visible,
        required: bibliography.required,
      },
    ]
  }, [layout])

  const onChangeVisibilityData = useCallback((data: {
    key: string,
    value: boolean,
    required: boolean,
  }[]) => {

    setLayout((prev) => {
      if (!prev) {
        return null;
      }

      return {
        ...prev,
        toc: {
          ...prev.toc,
          visible: data.find((el) => el.key === "toc")?.value || false,
        },
        intro: {
          ...prev.intro,
          visible: data.find((el) => el.key === "intro")?.value || false,
        },
        critical: {
          ...prev.critical,
          visible: data.find((el) => el.key === "critical")?.value || false,
        },
        bibliography: {
          ...prev.bibliography,
          visible: data.find((el) => el.key === "bibliography")?.value || false,
        },

      }
    })
  }, [])

  const onChangePageSetup = useCallback((setup: SetupOptionType) => {
    setPageSetup(setup)
  }, [])

  const onConfirmDeleteApparatusId = useCallback((id: string) => {
    setDeleteApparatusIds((prev) => [...prev, id])
  }, [])
  return (
    <Modal
      title={t("pageSetup.title")}
      showCloseIcon={true}
      isOpen={open}
      onClose={onClose}
      onOpenChange={() => { }}
      className="flex flex-col w-full xl:max-w-[70vw] max-w-[98vw] h-[98%] xl:h-[90%] overflow-hidden !gap-0"
      actions={[
        <Button
          key="cancel"
          className="w-24 items-center justify-center"
          size="mini"
          intent={"secondary"}
          variant={"tonal"}
          onClick={onClose}>
          {t("buttons.cancel")}
        </Button>,
        <Button
          key="save"
          className="w-24 items-center justify-center"
          size="mini"
          intent={"primary"}
          onClick={onSaveHandler}
          disabled={isReadonly}>
          {t("buttons.save")}
        </Button>,
      ]}
      contentClassName="!overflow-y-auto h-full !p-0"
      headerClassName="h-[8vh]"
      footerClassName="!flex-1 items-center h-[8vh]">
      <div className="flex flex-2 flex-row justify-between bg-gray-100 dark:bg-grey-20 overflow-y-hidden h-full min-w-[20vw]" >
        <div className="flex w-1/4 pt-5 pb-5 pl-[12px] pr-[12px] overflow-y-auto flex-col bg-white dark:bg-grey-10 h-full">
          <div>
            <Typography component="h4" className="border-b pb-6 dark:text-grey-90 dark:border-grey-40" >
              {t("pageSetup.component.configurationSubtitle")}
            </Typography>
          </div>
          <div className="flex flex-col" >
            <Accordion type="single" collapsible>
              {visibilityData && <PageVisibilityElements
                data={visibilityData}
                onChange={onChangeVisibilityData}
                readonly={isReadonly}
              />}
              {pageSetup && <PageSetup
                initialSetup={pageSetup}
                readonly={isReadonly}
                exportSetup={onChangePageSetup}
                standardPageDimensions={standardPageDimensions}
              />}
            </Accordion>
          </div>
        </div>
        <div className="flex w-5/12 justify-center p-5 overflow-y-auto">
          {layout && <SortableArea<SetupDialogStateKeys>
            includedElements={layout}
            itemLs={orderedItms}
            readSorted={handleSortedChange}
            readonly={isReadonly}
            wrapper={(x) => (
              <Accordion
                type="single"
                className="!p-0 flex flex-col w-full gap-2"
                collapsible
                onValueChange={setCurSection}>
                {x}
              </Accordion>
            )}
            item={(v, _, drag) => layout[v]?.visible ? (
              <PageLayoutAccordion
                accordionDisabled={v === "toc"}
                dragHandler={drag}
                v={v}
                title={t(`pageSetup.component.section.${v}`)}>
                <div className="bg-white dark:bg-grey-10 w-full p-2 lg:p-5 flex flex-row justify-center gap-4 border-t h-[63vh]">
                  <AppRadioGroup
                    disabled={isReadonly}
                    items={layouts
                      .filter(({ visible }) => visible(layout[v]?.apparatusDetails))
                      .filter(({ name }) => isLayoutSupported(name, curSection)) // Filter out unsupported layouts for current section
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
                            className="w-[3.5rem] h-[4.875rem] lg:w-[3.5rem] p-2"
                            apparatusDetails={apparatusColDetails}
                            textDetails={textColDetails || {}}
                          />
                        )
                      }))}
                    onValueChange={(lt) => {
                      setLayout((prev) => {
                        if (!prev) {
                          return null;
                        }

                        return {
                          ...prev,
                          [v]: {
                            ...prev[v],
                            layout: lt,
                          },
                        }
                      })
                    }}
                    className="flex flex-col gap-2 items-center !w-1/4"
                    variant="icon"
                  />
                  {v === "critical" ? (
                    <LayoutShape
                      variant="big"
                      layoutName={curLayout}
                      apparatusDetails={apparatusColDetails || []}
                      textDetails={textColDetails || {}}
                      showDetails
                      className="!w-full p-4 col-span-3 h-[90%]"
                    />
                  ) : (
                    <LayoutShapeText layout={curLayout} />
                  )}
                </div>
              </PageLayoutAccordion>
            ) : (
              <div className="d-none" />
            )}
          />}
        </div>
        {curSection &&
          curSection !== "intro" &&
          curSection !== "bibliography" ? (
          <div
            className="overflow-y-auto flex min-w-1/4 gap-3 pt-5 pb-5 pl-[12px] pr-[12px] flex-col bg-white dark:bg-grey-10">
            <div>
              <Typography component="h4" className="border-b pb-6 dark:text-grey-90 dark:border-grey-40">
                {t(`pageSetup.component.section.${curSection}`)}
              </Typography>
            </div>

            {layout && <TextContentManagement
              readonly={isReadonly}
              curSection={curSection}
              curLayout={curLayout}
              apparatuses={apparatuses}
              setIncludedElements={(data) => {
                setLayout((prev) => {
                  if (!prev) {
                    return null;
                  }

                  return {
                    ...prev,
                    [curSection]: {
                      ...prev[curSection],
                      apparatusDetails: data.payload,
                    },
                  }
                })
              }}
              apparatusDetails={apparatusDetails}
              availableApparatusTypes={availableApparatusTypesState[curSection].columnDetails}
              iconClassName="mt-[5px]"
              textColor={`${colors.secondary.DEFAULT} `}
              includedElements={layout}
              onConfirmDeleteApparatusId={onConfirmDeleteApparatusId}
            />}
          </div>
        ) : (
          <div className="flex w-1/4 pt-5 pb-5 pl-[12px] pr-[12px] flex-col bg-transparent dark:bg-transparent" />
        )}
      </div>
    </Modal>
  );
}

export default memo(LayoutSetup);
