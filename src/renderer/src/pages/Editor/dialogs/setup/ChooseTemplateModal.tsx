import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import TemplateSelection from "@/components/template-selection";
import { useDocumentAPI } from "@/hooks/use-electron";
import { FileTemplate } from "../../shared/types";
import { defaultFileTemplate } from "../../shared/constants";

export interface ChooseTemplateModalProps {
  canCancel?: boolean;
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  confirmModal?: ReactNode
}

const ChooseTemplateModal: React.FC<ChooseTemplateModalProps> = ({
  canCancel = true,
  open,
  onClose,
  onSelectTemplate,
  confirmModal
}) => {
  const { t } = useTranslation();
  const documentAPI = useDocumentAPI();
  const [fileTemplates, setFileTemplates] = useState<FileTemplate[]>([]);
  const [selectedFileTemplate, setSelectedFileTemplate] = useState<FileTemplate>(defaultFileTemplate);

  const fetchTemplates = useCallback(async () => {
    const templates = await documentAPI.getTemplates();
    const fileTemplates = templates.map(({ filename, template }: any) => ({
      filename,
      template,
    }));

    setFileTemplates([
      defaultFileTemplate,
      ...fileTemplates,
    ]);
  }, [documentAPI])

  useEffect(() => {
    fetchTemplates();
  }, [])

  const recentTemplates = useMemo(() => {
    const defaultTemplates = fileTemplates
      ?.filter(t => t.template.type === "DEFAULT") || [];

    const filtered = fileTemplates
      ?.filter((data) => data.template.type === "PROPRIETARY")
      .sort((a, b) => new Date(b.template.updatedDate).getTime() - new Date(a.template.updatedDate).getTime()) || [];

    return [
      ...defaultTemplates,
      ...filtered,
    ];
  }, [fileTemplates]);

  const publishersTemplates = useMemo(() => {
    const filtered = fileTemplates
      ?.filter((data) => data.template.type === "COMMUNITY")
      .sort((a, b) => new Date(b.template.updatedDate).getTime() - new Date(a.template.updatedDate).getTime()) || [];

    return filtered;
  }, [fileTemplates]);

  const handleTemplateSelect = useCallback((filename: string) => {
    const found = [
      ...recentTemplates,
      ...publishersTemplates,
    ].find(t => t.filename === filename);

    if (!found)
      return;

    setSelectedFileTemplate(found)
  }, [recentTemplates, publishersTemplates]);

  const handleContinue = useCallback(() => {
    if (!selectedFileTemplate)
      return;

    const { name, type, version, createdDate, updatedDate, layout, pageSetup, sort, styles, paratextual } = selectedFileTemplate.template;
    const newTemplate = {
      name,
      type,
      version,
      createdDate,
      updatedDate,
      layout,
      pageSetup,
      sort,
      styles,
      paratextual
    } satisfies Template;

    onSelectTemplate(newTemplate);
  }, [selectedFileTemplate]);

  const handleImport = useCallback(async () => {
    await documentAPI.importTemplate()
    await fetchTemplates()
  }, [documentAPI]);


  const onCloseHandler = useCallback(() => {
    if (!canCancel)
      return;
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={open}
      title={t("choose_template_dialog.title")}
      className="max-w-[880px] h-auto max-h-[90%] flex-1 flex flex-col"
      contentClassName="flex-1 overflow-y-auto"
      onOpenChange={onCloseHandler}
      onClose={onCloseHandler}
      showCloseIcon={true}
      actions={[
        <Button
          key="cancel"
          className="w-24"
          size="mini"
          intent="secondary"
          variant="tonal"
          disabled={!canCancel}
          onClick={onCloseHandler}>
          {t("choose_template_dialog.buttons.cancel")}
        </Button>,
        <Button
          key="import_template"
          className="w-32"
          size="mini"
          intent="primary"
          variant="tonal"
          onClick={handleImport}>
          {t("choose_template_dialog.buttons.import")}
        </Button>,
        <Button
          key="continue"
          className="w-24"
          size="mini"
          intent={"primary"}
          onClick={handleContinue}>
          {t("choose_template_dialog.buttons.continue")}
        </Button>,
      ]}
    >
      {confirmModal}
      <TemplateSelection
        value={selectedFileTemplate?.filename ?? recentTemplates[0]?.filename ?? ""}
        onChange={handleTemplateSelect}
      >
        <TemplateSelection.Category title={t("choose_template_dialog.sections.recent")}>
          {recentTemplates?.map(({ filename }) => (
            <div
              key={filename}
              onDoubleClick={() => {
                handleTemplateSelect(filename);
                handleContinue();
              }}>
              <TemplateSelection.Item
                id={filename}
                key={filename}
                name={filename?.split('.')[0]}
                value={filename}
                icon={filename?.split('.')[0].toLowerCase() === "blank" ? "blank" : "other"}
              />
            </div>
          ))}
        </TemplateSelection.Category>
        {/* <TemplateSelection.Category title={t("choose_template_dialog.sections.publishers")}>
          {publishersTemplates?.map(({ filename }) => (
            <TemplateSelection.Item
              id={filename}
              key={filename}
              name={filename}
              value={filename}
            />
          ))}
        </TemplateSelection.Category> */}
      </TemplateSelection>
    </Modal>
  );
};

export default ChooseTemplateModal;