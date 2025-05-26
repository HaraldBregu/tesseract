import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";
import Modal from "@/components/ui/modal"
import Button from "@/components/ui/button";
import TemplateSelection from "@/components/template-selection";

interface SaveAsTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSaveTemplate: (templateName:string) => void;
}

const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  open,
  onClose,
  onSaveTemplate
}) => {
  const [templates, setTemplates] = useState<any>(null);
  const [templateName, setTemplateName] = useState("");

  const { publishersTemplates, recentTemplates } = templates ?? {};
  const { t } = useTranslation();

  useIpcRenderer((ipc) => {
    ipc.send('request-templates');
    ipc.on('receive-templates', (_, data) => void setTemplates(data))

    return () => {
      ipc.cleanup();
    }
  }, [window.electron.ipcRenderer]);

  return (
    <Modal
      isOpen={open}
      title={t('save_as_template_dialog.title')}
      className="max-w-[880px] h-auto max-h-[90%] flex-1 flex flex-col"
      contentClassName="flex-1 overflow-y-auto"
      onOpenChange={onClose}
      actions={[
        <Button
          key="cancel"
          className="w-24"
          size="mini"
          intent="secondary"
          variant="tonal"
          onClick={()=>{}}
        >
          {t('save_as_template_dialog.buttons.cancel')}
        </Button>,
        <Button
          key="continue"
          className="w-24"
          size="mini"
          intent={"primary"}
          onClick={() => onSaveTemplate(templateName)}
          disabled={!templateName}
        >

          {t('save_as_template_dialog.buttons.done')}
        </Button>
      ]}>
      <TemplateSelection defaultValue="new-template" onChange={() => { }} disabled={true}>
        <TemplateSelection.Category
          title={t('save_as_template_dialog.sections.publishers')}
        >
          {publishersTemplates?.map((props) =>
            <TemplateSelection.Item
              key={props.id}
              value={props.name}
              {...props} />)}
        </TemplateSelection.Category>
        <TemplateSelection.Category
          title={t('save_as_template_dialog.sections.myTemplates')}
        >
          <TemplateSelection.Item
            id="new-template"
            value="new-template"
            as={{ type: "input", onChange: (e) => setTemplateName(e.target.value), value: templateName }} />
          {recentTemplates?.filter(template => template.name.toLowerCase() !== 'blank').map((props) =>
            <TemplateSelection.Item
              key={props.id}
              value={props.name}
              {...props} />)}
        </TemplateSelection.Category>
      </TemplateSelection>
    </Modal>

  );
};

export default SaveAsTemplateModal;