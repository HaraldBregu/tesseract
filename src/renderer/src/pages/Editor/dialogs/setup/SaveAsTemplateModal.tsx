import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/modal"
import Button from "@/components/ui/button";
import TemplateSelection from "@/components/template-selection";
import { useDocumentAPI } from "@/hooks/use-electron";
import { FileTemplate } from "../../shared/types";
import { defaultFileTemplate } from "../../shared/constants";

interface SaveAsTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSaveTemplate: (templateName: string) => void;
}

const SaveAsTemplateModal = ({
  open,
  onClose,
  onSaveTemplate
}: SaveAsTemplateModalProps) => {
  const { t } = useTranslation();
  const documentAPI = useDocumentAPI();
  const [templates, setTemplates] = useState<FileTemplate[]>([]);
  const [templateName, setTemplateName] = useState<string>("");

  const fetchTemplates = useCallback(async () => {
    const templatesResponse = await documentAPI.getTemplates();
    const fileTemplates = templatesResponse
      .map(({ filename, template }: any) => ({
        filename,
        template,
      }));

    setTemplates([
      defaultFileTemplate,
      ...fileTemplates,
    ]);
  }, [documentAPI]);

  useEffect(() => {
    fetchTemplates()
  }, [])

  const recentTemplates = useMemo(() => {
    const defaultTemplates = templates
      ?.filter(t => t.template.type === "DEFAULT") || [];

    const filtered = templates
      ?.filter((data) => data.template.type === "PROPRIETARY")
      .sort((a, b) => new Date(b.template.updatedDate).getTime() - new Date(a.template.updatedDate).getTime()) || [];

    return [
      ...defaultTemplates,
      ...filtered,
    ];
  }, [templates]);

  return (
    <Modal
      isOpen={open}
      title={t('save_as_template_dialog.title')}
      className="max-w-[880px] h-auto max-h-[90%] flex-1 flex flex-col"
      contentClassName="flex-1 overflow-y-auto"
      showCloseIcon={true}
      onOpenChange={onClose}
      onClose={onClose}
      actions={[
        <Button
          key="cancel"
          className="w-24"
          size="mini"
          intent="secondary"
          variant="tonal"
          onClick={onClose}
        >
          {t('save_as_template_dialog.buttons.cancel')}
        </Button>,
        <Button
          key="continue"
          className="w-24"
          size="mini"
          intent={"primary"}
          onClick={() => onSaveTemplate(templateName)}
          disabled={!templateName}>
          {t('save_as_template_dialog.buttons.done')}
        </Button>
      ]}>
      <TemplateSelection defaultValue="new-template" onChange={() => { }} disabled={true}>
        <TemplateSelection.Category
          title={t('save_as_template_dialog.sections.myTemplates')}>
          <TemplateSelection.Item
            id="new"
            value=""
            as={{
              type: "input",
              value: templateName,
              onChange: (e) => setTemplateName(e.target.value),
            }} />
          {recentTemplates?.map(({ filename }) => <TemplateSelection.Item
            id={filename}
            key={filename}
            name={filename.split('.')[0]}
            value={filename} />)}
        </TemplateSelection.Category>
      </TemplateSelection>
    </Modal>
  );
};

export default SaveAsTemplateModal;