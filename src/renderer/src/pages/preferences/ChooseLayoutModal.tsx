import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import TemplateSelection from "@/components/template-selection";
import {
  DocumentTemplate,
} from "./store/preferences.slice";

interface ChooseTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: (template: DocumentTemplate) => void;
  onImportTemplate: () => void;
}

const ChooseLayoutModal: React.FC<ChooseTemplateModalProps> = ({
  open,
  onClose,
  onContinue,
}) => {

  const [templatesName, setTemplatesName] = useState<string[]>([]);
    const [jsonData, setJsonData] = useState<any>();

  const [templates, setTemplates] = useState<{
    publishersTemplates: DocumentTemplate[];
    recentTemplates: DocumentTemplate[];
  } | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);

  const { publishersTemplates } = templates ?? {};

  const { t } = useTranslation();

  console.log(selectedTemplate);
  useIpcRenderer(
    (ipc) => {
      ipc.send("request-templates-files");
      ipc.on("receive-templates-files", (_, data) => {
        setTemplatesName(data);
      });

      return () => {
        ipc.cleanup();
      };
    },
    [window.electron.ipcRenderer]
  );


  useIpcRenderer(
    (ipc) => {
      window.electron.ipcRenderer.on("template-selected", () => {
        window.electron.ipcRenderer.send("request-templates");
        window.electron.ipcRenderer.on("receive-templates", (_, data) => {
          setTemplates(data);
        });
      });

      return () => {
        ipc.cleanup();
      };
    },
    [window.electron.ipcRenderer]
  );

  const handleTemplateSelect = (id: string) => {

    window.electron.ipcRenderer.send("read-template-with-filename", id);
    window.electron.ipcRenderer.on("template-file-structure", (_, data)=>{
      setJsonData(JSON.parse(data));
    });
  };

  const handleClose = () => {
    onClose();
    setSelectedTemplate(null);
  };

  const handleContinue = () => {

   jsonData && onContinue(jsonData)
  };


  return (
    <Modal
      isOpen={open}
      title={t("choose_template_dialog.title")}
      className="max-w-[880px] h-auto max-h-[90%] flex-1 flex flex-col"
      contentClassName="flex-1 overflow-y-auto"
      onOpenChange={() => {}}
      actions={[
        <Button
          key="cancel"
          className="w-24"
          size="mini"
          intent="secondary"
          variant="tonal"
          onClick={handleClose}
        >
          {t("choose_template_dialog.buttons.cancel")}
        </Button>,
        <Button
          key="import_template"
          className="w-32"
          size="mini"
          intent="primary"
          variant="tonal"
          onClick={() => {
            window.electron.ipcRenderer.send("import-template");
          }}
        >
          {t("choose_template_dialog.buttons.import")}
        </Button>,
        <Button
          key="continue"
          className="w-24"
          size="mini"
          intent={"primary"}
          onClick={handleContinue}
        >
          {t("choose_template_dialog.buttons.continue")}
        </Button>,
      ]}
    >
      <TemplateSelection
        defaultValue={'Blank'}
        onChange={handleTemplateSelect}
      >
        <TemplateSelection.Category
          title={t("choose_template_dialog.sections.recent")}
        >
            {templatesName?.map(
            (props, key) => (
              (
                <TemplateSelection.Item
                id={props}
                  key={key}
                  name={props}
                  value={props}
                  icon={
                    props.toLowerCase() === "blank" ? "blank" : "carocci"
                  }
                />
              )
            )
          )}
        
        </TemplateSelection.Category>
        <TemplateSelection.Category
          title={t("choose_template_dialog.sections.publishers")}
          action={
            <a
              href="*"
              className="text-xs font-bold leading-4 tracking-normal text-right underline underline-offset-4 font-sans"
            >
              {t("choose_template_dialog.browse_link")}
            </a>
          }
        >
          {publishersTemplates?.map((props) => (
            <TemplateSelection.Item
              key={props.id}
              value={props.name}
              {...props}
            />
          ))}
        </TemplateSelection.Category>
      </TemplateSelection>
    </Modal>

  );
};

export default ChooseLayoutModal;