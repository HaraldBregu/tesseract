import { memo, useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { t } from 'i18next';
import { useIpcRenderer } from '@/hooks/use-ipc-renderer';
import { fontSizes } from '@/utils/optionsEnums';
import ColorToggleGroup from "@/components/color-group-toggle";
import TextAlignToggle from "@/components/text-align-toggle";
import SortableStylesList from "@/components/sortable-styles-list";
import AppSeparator from '@/components/app/app-separator';
import AppButton from '@/components/app/app-button';
import { AppDialog, AppDialogContent, AppDialogHeader, AppDialogTitle, AppDialogDescription, AppDialogFooter } from '@/components/app/app-dialog';
import IconClose from '@/components/app/icons/IconClose';
import { cn } from '@/lib/utils';
import AppInput from '@/components/app/app-input';
import AppLabel from '@/components/app/app-label';
import { AppSelect, AppSelectContent, AppSelectItem, AppSelectTrigger, AppSelectValue } from '@/components/app/app-select';
import IconPlusCircle from '@/components/app/icons/IconPlusCircle';
import { useDocumentAPI } from '@/hooks/use-electron';
import List from '@/components/app/list';
import IconBold from '@/components/app/icons/IconBold';
import IconItalic from '@/components/app/icons/IconItalic';
import { DEAFAULT_STYLES } from '@/utils/utils';

type SelectStyleOption = {
  value: string;
  label: string;
}

type LocalStyle = Style & {
  label: string
}

interface StylesProps {
  readonly isOpen: boolean;
  readonly setIsOpen: (open: boolean) => void;
  readonly onSave: (sectionStyle: Style[]) => void;
}

function Styles({
  isOpen,
  setIsOpen,
  onSave,
}: StylesProps) {
  const document = useDocumentAPI();
  const [localStyles, setLocalStyles] = useState<LocalStyle[] | null>([]);
  const [style, setStyle] = useState<LocalStyle | null>(null);
  const [fontsFamily, setFontsFamily] = useState<string[]>([]);
  const [exportedStyles, setExportedStyles] = useState<string[] | null>(null);
  const [selectedExportedStyleName, setSelectedExportedStyleName] = useState<string>("");
  const originalNameRef = useRef<string | null>(null);

  useEffect(() => {
    const loadStyles = async () => {
      const styles = await document.getStyles(); // From current document
      const _localStyles = styles.map((style) => ({
        ...style,
        label: style.name,
      }));
      setLocalStyles(_localStyles);
      setStyle({ ..._localStyles[0] });
      originalNameRef.current = _localStyles[0].name;
    }

    loadStyles();
  }, []);

  const fetchExportedStyles = useCallback(async () => {
    const exported = await document.getStylesFileNames();
    setExportedStyles(exported);
  }, [document])

  const styles = useMemo(() => localStyles?.map((style) => ({
    ...style,
    label: style.name,
  })), [localStyles])

  useEffect(() => {
    fetchExportedStyles()
  }, [fetchExportedStyles])

  useIpcRenderer((ipc) => {
    ipc.send('request-system-fonts');
    ipc.on('receive-system-fonts', (_, fonts: string[]) => {
      setFontsFamily(fonts);
    });
    return () => {
      ipc.off('receive-system-fonts');
    }
  }, [globalThis.electron.ipcRenderer]);

  // Options for the styles select
  const stylesOptions = useMemo(() => {
    const styles = exportedStyles ?? [];
    // Default option
    const defaultOption = {
      value: '__default__',
      label: 'Default',
    } satisfies SelectStyleOption;

    // Custom styles options 
    const customOptions = styles.map((name) => ({
      value: name,
      label: name.split('.stl')[0]
    }))

    const options = [
      defaultOption,
      ...customOptions
    ] satisfies SelectStyleOption[];

    return options;
  }, [exportedStyles]);

  const selectStyleName = useCallback(async (name: string) => {
    const filenames = await document.getStylesFileNames();
    const filename = filenames.find(s => s === name);
    if (!filename) {
      setSelectedExportedStyleName('__default__');
      const defaultStyles = DEAFAULT_STYLES
        .map(style => ({
          ...style,
          label: style.name,
        }));
      setLocalStyles(defaultStyles);
      if (defaultStyles.length == 0)
        return;
      const firstStyle = defaultStyles[0];
      setStyle(firstStyle);
      originalNameRef.current = firstStyle.name;
      return;
    }

    setSelectedExportedStyleName(filename);

    const stylesFromFile = await document.getStylesFromFile(filename);
    if (!stylesFromFile) {
      return;
    }

    // Filter enabled styles and assign an id
    const enabledStyles = stylesFromFile
      .filter(s => s.enabled === true)
      .map(style => ({
        ...style,
        label: style.name,
      }));

    setLocalStyles(enabledStyles);
    if (enabledStyles.length > 0) {
      setStyle(enabledStyles[0]);
      originalNameRef.current = enabledStyles[0].name;
    }
  }, [exportedStyles, styles]);

  const fontFamilyOptions = useMemo(() => {
    const raw = fontsFamily.length === 0
      ? [style?.fontFamily, "Times New Roman"]
      : fontsFamily;

    const cleaned = (raw || [])
      .filter((ff): ff is string => !!ff && ff.trim().length > 0)
      .map(ff => ff.trim());

    return Array.from(new Set(cleaned)); // de-dup
  }, [fontsFamily, style?.fontFamily]);

  const handleStyleChange = useCallback((style) => {
    setStyle({
      align: undefined,
      marginBottom: undefined,
      marginTop: undefined,
      lineHeight: undefined,
      ...style
    });
    originalNameRef.current = style.name;
  }, [])

  const handleSave = useCallback(async () => {
    const updatedStyles = localStyles?.map(({ label, ...rest }) => rest) ?? [];
    onSave(updatedStyles);
    setIsOpen(false);
  }, [localStyles, setIsOpen, onSave]);

  const handleExport = useCallback(async () => {
    if (!localStyles)
      return;

    const styles = localStyles.map(({ label, ...data }) => data) as Style[];
    await document.exportStyles(styles);
    fetchExportedStyles()
  }, [fetchExportedStyles, localStyles, document])

  const handleImport = useCallback(async () => {
    const styleName = await document.importStyles();
    if (!styleName)
      return;

    await fetchExportedStyles();

    if (styleName) {
      setSelectedExportedStyleName(styleName);

      const styles = await document.getStylesFromFile(styleName);
      if (!styles)
        return;

      const filteredStyles = styles
        .filter(s => s.enabled === true)
        .map(style => ({
          ...style,
          label: style.name,
        }));

      setLocalStyles(filteredStyles);
      if (filteredStyles.length > 0) {
        setStyle(filteredStyles[0]);
        originalNameRef.current = filteredStyles[0].name;
      }
    }
  }, [fetchExportedStyles, document]);

  const handleAdd = useCallback(async () => {
    const baseName = "New Style";
    const existingNames = localStyles?.map(style => style.name) || [];

    let newName = baseName;
    let counter = 0;
    while (existingNames.includes(newName)) {
      counter++;
      newName = `${baseName} ${counter}`;
    }

    const newStyle = {
      id: crypto.randomUUID(),
      label: newName,
      level: undefined,
      type: "CUSTOM",
      enabled: true,
      name: newName,
      fontSize: "12pt",
      fontWeight: "normal",
      fontFamily: "Times New Roman",
      color: "#000000",
      align: "left",
      lineHeight: "1",
      marginTop: "0pt",
      marginBottom: "0pt",
      bold: false,
      italic: false,
      underline: false,
    } as LocalStyle;

    // Find index of selected element
    const selectedIndex = localStyles?.findIndex(s => s.id === style?.id) ?? -1;

    // If there's no selection or it's not found, append at the end
    // Otherwise, insert after the selected element
    const insertIndex = selectedIndex === -1 ? (localStyles?.length ?? 0) : selectedIndex + 1;

    const newList = [...(localStyles ?? [])];
    newList.splice(insertIndex, 0, newStyle);

    setLocalStyles(newList);
    handleStyleChange(newStyle);
  }, [handleStyleChange, localStyles, style?.id])

  const handleTitleBlur = useCallback(() => {
    const name = style?.name?.trim();
    const duplicate = localStyles?.find(s => s.name === name && s.id !== style?.id);

    if (!name || duplicate) {
      console.warn(`A style named "${name}" already exists.`);
      const fallback = originalNameRef.current;
      if (fallback) {
        const restored = { ...style, name: fallback, label: fallback } as LocalStyle;
        setStyle(restored);
        setLocalStyles(prev => (prev?.map(s => s.id === style?.id ? restored : s) || []));
      }
      return;
    }

    const updated = { ...style, label: name } as LocalStyle;
    originalNameRef.current = name;
    setStyle(updated);
    setLocalStyles(prev => prev?.map(s => s.id === style?.id ? updated : s) || []);
  }, [localStyles, style])

  const updateStyleProperty = useCallback((property: string, value: boolean | string) => {

    console.log("property", property, " value: ", value)

    const updatedStyle = { ...style, [property]: value } as LocalStyle;
    setStyle(updatedStyle);
    setLocalStyles((prevStyles) =>
      prevStyles?.map((s) => (s.id === style?.id ? updatedStyle : s)) || []
    );
  }, [style]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <AppDialog open={isOpen} onOpenChange={onClose} >
      <AppDialogContent className={cn("max-w-[900px]")}>
        <AppDialogHeader>
          <div className="flex justify-between items-center">
            <AppDialogTitle className={cn("text-md font-bold flex-1")}>
              {t("sections_styles_dialog.title")}
            </AppDialogTitle>
            <AppButton
              variant="transparent"
              size="icon-sm"
              onClick={onClose}
              aria-label={t("dialog.close", "Close")}
              className="ml-2">
              <IconClose />
            </AppButton>
          </div>
          <AppDialogDescription />
        </AppDialogHeader>
        <div className="flex flex-row h-[60vh]">
          <div className="w-[320px] border-r overflow-y-auto">
            <div className="flex flex-col h-full">
              <div className="flex justify-between my-5 px-2">
                <AppSelect
                  value={selectedExportedStyleName}
                  onValueChange={selectStyleName}>
                  <AppSelectTrigger
                    aria-label={t("sections_styles_dialog.styles_section.select_style")}
                    className={cn(
                      'pl-[4px] pr-[2px] hover:bg-primary hover:text-white active:bg-primary',
                      'active:text-white focus-visible:bg-primary focus-visible:text-white py-0',
                      'h-auto border-none shadow-none focus:ring-0 focus:ring-offset-0',
                      "max-w-[150px]",
                    )}>
                    <AppSelectValue placeholder={t("sections_styles_dialog.styles_section.select_style")} />
                  </AppSelectTrigger>
                  <AppSelectContent>
                    <List
                      data={stylesOptions}
                      renderItem={(item, index) => (
                        <Fragment key={`${item.value}-${index}`}>
                          {index > 0 && <AppSeparator className="text-xs font-normal" />}
                          <AppSelectItem
                            className={cn(
                              "hover:bg-primary hover:text-white active:bg-primary active:text-white focus-visible:bg-primary focus-visible:text-white",
                            )}
                            value={item.value}>
                            <span className="text-[13px]">{item.label}</span>
                          </AppSelectItem>
                        </Fragment>
                      )} />
                  </AppSelectContent>
                </AppSelect>
                <AppButton
                  variant="default"
                  size="xs"
                  onClick={handleImport}>
                  {t("sections_styles_dialog.styles_section.import_style")}
                </AppButton>
              </div>
              <div className="flex justify-end mb-1 px-2">
                <AppButton
                  variant="outline"
                  size="xs"
                  onClick={handleAdd}>
                  <IconPlusCircle />
                  {t("sections_styles_dialog.styles_section.add")}
                </AppButton>
              </div>
              <SortableStylesList
                styles={localStyles || []}
                selectedStyle={style}
                onStylesChange={(newFonts) => setLocalStyles(newFonts)}
                onStyleSelect={handleStyleChange}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-grey-10 flex flex-col gap-4">
            <AppLabel className="font-semibold mt-4">
              {t("sections_styles_dialog.name")}
            </AppLabel>
            <AppInput
              className="bg-white dark:bg-grey-10 p-4"
              value={style?.name || ""}
              onChange={(e) => updateStyleProperty("name", e.target.value)}
              onBlur={handleTitleBlur}
              autoFocus
            />
            <AppLabel className="text-lg font-bold">
              {t("sections_styles_dialog.typography_section.typography")}
            </AppLabel>
            <div className="flex gap-2 flex-wrap">
              <div>
                <AppLabel className="text-xs font-semibold">
                  {t("sections_styles_dialog.typography_section.font")}
                </AppLabel>
                <AppSelect
                  value={style?.fontFamily ?? "Times New Roman"}
                  onValueChange={(value) => updateStyleProperty("fontFamily", value)}>
                  <AppSelectTrigger className="bg-white dark:bg-grey-10 w-[11.5rem] shadow-none focus:ring-0 focus:ring-offset-0 font-[400] text-[13px]">
                    <AppSelectValue />
                  </AppSelectTrigger>
                  <AppSelectContent>
                    <List
                      data={fontFamilyOptions}
                      renderItem={(ff) => (
                        <AppSelectItem
                          value={ff ?? ""}
                          key={ff}>
                          <span style={{ fontFamily: ff }}>{ff}</span>
                        </AppSelectItem>
                      )} />
                  </AppSelectContent>
                </AppSelect>
              </div>
              <div>
                <AppLabel className="text-xs font-semibold">
                  {t("sections_styles_dialog.typography_section.size")}
                </AppLabel>
                <AppSelect
                  value={style?.fontSize.split('pt')[0] ?? ""}
                  onValueChange={(value) => updateStyleProperty("fontSize", value + "pt")}>
                  <AppSelectTrigger className="min-w-[80px] bg-white dark:bg-grey-10 shadow-none focus:ring-0 focus:ring-offset-0 font-[400] text-[13px]">
                    <AppSelectValue />
                  </AppSelectTrigger>
                  <AppSelectContent>
                    <List
                      data={fontSizes}
                      renderItem={(value, index) => (
                        <AppSelectItem
                          className="font-thin text-grey-10"
                          value={value.toString().split('pt')[0]}
                          key={`${value}-${index}`}>
                          <span> {value}</span>
                        </AppSelectItem>
                      )} />
                  </AppSelectContent>
                </AppSelect>
              </div>
              <div>
                <AppLabel className="text-xs font-semibold">
                  {t("sections_styles_dialog.typography_section.style")}
                </AppLabel>
                <div className="flex justify-between gap-1 rounded-md p-[5px] border bg-white dark:bg-grey-10">
                  <AppButton
                    asChild
                    variant={style?.bold ? "toolbar-selected" : "toolbar"}
                    size="icon"
                    rounded="sm"
                    onClick={() => {
                      updateStyleProperty("bold", !style?.bold)
                    }}>
                    <IconBold />
                  </AppButton>
                  <AppButton
                    asChild
                    variant={style?.italic ? "toolbar-selected" : "toolbar"}
                    size="icon"
                    rounded="sm"
                    onClick={() => {
                      updateStyleProperty("italic", !style?.italic)
                    }}>
                    <IconItalic />
                  </AppButton>
                </div>
              </div>
              <div>
                <AppLabel className="text-xs font-semibold">
                  {t("sections_styles_dialog.typography_section.align")}
                </AppLabel>
                <TextAlignToggle
                  value={style?.align ?? ""}
                  onChange={(value) => updateStyleProperty("align", value)}
                  disabled={!style?.align}
                />
              </div>
              <ColorToggleGroup
                value={style?.color ?? "#000000"}
                onChange={(value) => updateStyleProperty("color", value)} />
            </div>
            <AppSeparator />
            <AppLabel className="text-lg font-bold">
              {t("sections_styles_dialog.spacing_section.spacing")}
            </AppLabel>
            <div className="flex gap-2 flex-wrap justify-between">
              <div className="flex-1 min-w-14">
                <AppLabel className="text-xs font-semibold">
                  {t("sections_styles_dialog.spacing_section.line_spacing")}
                </AppLabel>
                <AppInput
                  className="bg-white dark:bg-grey-10 p-4"
                  value={style?.lineHeight && style.lineHeight !== undefined ? style.lineHeight.split('pt')[0] : ''}
                  disabled={style?.lineHeight === undefined}
                  type="number"
                  min={1}
                  step={0.1}
                  onChange={(e) => updateStyleProperty("lineHeight", e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-14">
                <AppLabel className="text-xs font-semibold">
                  {t("sections_styles_dialog.spacing_section.before_paragraph")}
                </AppLabel>
                <AppInput
                  className="bg-white dark:bg-grey-10 p-4"
                  value={style?.marginTop && style.marginTop !== undefined ? style.marginTop.split('pt')[0] : ''}
                  disabled={style?.marginTop === undefined}
                  type="number"
                  min={0}
                  step={1}
                  onChange={(e) => updateStyleProperty("marginTop", e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-14">
                <AppLabel className="text-xs font-semibold">
                  {t("sections_styles_dialog.spacing_section.after_paragraph")}
                </AppLabel>
                <AppInput
                  className="bg-white dark:bg-grey-10 p-4"
                  value={style?.marginBottom && style.marginBottom !== undefined ? style.marginBottom.split('pt')[0] : ''}
                  disabled={style?.marginBottom === undefined}
                  type="number"
                  min={0}
                  step={1}
                  onChange={(e) => updateStyleProperty("marginBottom", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <AppDialogFooter className="sm:flex-row sm:justify-end">
          <AppButton
            variant="secondary"
            size="dialog-footer-xs"
            onClick={onClose}>
            {t("sections_styles_dialog.cancel")}
          </AppButton>
          <AppButton
            variant="secondary"
            size="dialog-footer-xs"
            onClick={handleExport}>
            {t("sections_styles_dialog.export_style", "##Export##")}
          </AppButton>
          <AppButton
            variant="default"
            size="dialog-footer-xs"
            onClick={handleSave}>
            {t("sections_styles_dialog.done")}
          </AppButton>
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  )
}

export default memo(Styles);