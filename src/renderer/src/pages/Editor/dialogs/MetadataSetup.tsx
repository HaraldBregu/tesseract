import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";
import MetadataForm from "@/components/metadata-form";
import { initialMetadataFields } from "./PageSetupDialog/constants";
import { useDispatch } from "react-redux";
import { MetadataState, replaceAllMetadata } from "../store/metadata/metadata.slice";
import MetadataView from "@/components/metadata-view-data";

interface MetadataSetupProps {
  onClose: () => void;
  isOpen: boolean;
  onSave: (metadata: any) => void;
  metadata: Promise<DocumentMetadata[]>

}

export default function MetadataSetup({ onClose, isOpen, onSave, metadata }: MetadataSetupProps) {
  const { t } = useTranslation();

  const [isInEditMode, setIsEditMode] = useState<boolean>(false);
  //this state contains only fixed Metadata and its changes
  const [metadataFields, setMetadataFields] = useState<DocumentMetadata[]>([]);
  //this state contains only custom Metadata and its changes
  const [customMetadataField, setCustomMetadataField] = useState<DocumentMetadata[]>([]);
  //manage AddMetadataModalContent
  const [isCriterionOptionalMetadata, setIsCriterionOptionalMetadata] =
    useState<boolean>(false);
  //manage NewMetadataModalContent
  const [isCustomOptionalMetadata, setIsCustomOptionalMetadata] =
    useState<boolean>(false);
  //values of elements always show in Modal
  const [keywords, setKeywords] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [copyrightHolder, setCopyrightHolder] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  //const [template, setTemplate] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [temporaryOptionalMetadata, setTemporaryOptionalMetadata] = useState<DocumentMetadata[]>(metadataFields);
  
  //const templateData = useSelector(selectDocumentTemplate)

  const dispatch = useDispatch();


  const handleEdit = () => {
    setIsEditMode(true);
  };

  async function getMetadata() {
    try {
      const data: unknown = await metadata
      const value = data as MetadataState
      if(data!==null){
      setMetadataFields(value.metadata.filter(({ typology }) => typology === "fixed"));
      setCustomMetadataField(value.metadata.filter(({ typology }) => typology === "custom") || []);
       dispatch(
        replaceAllMetadata([
            ...value.metadata.filter(({ typology }) => typology === "fixed"), 
            ...value.metadata.filter(({ typology }) => typology === "custom") || []
          ],
      )
    );
      }else{
       setMetadataFields(initialMetadataFields.metadata.filter(({ typology }) => typology === "fixed"))
      }
    } catch (error) {
      console.error("Errore nel recuperare i metadata:", error);
    }
  } 

  const handleOnCancel=()=>{
      //setMetadataFields(temporaryOptionalMetadata)
      setIsEditMode(false)
  }

  //update states with json data
   useEffect(() => {
    getMetadata();
  },[metadata])


  const handleSave = () => {
    const newFormData: DocumentMetadata[] = metadataFields.map((item) => {
    switch (item.title.toLowerCase()) {
      case "title":
        return { ...item, value: title };
      case "subject":
        return { ...item, value: subject };
      case "author":
        return { ...item, value: author };
      case "copyrightholder":
        return { ...item, value: copyrightHolder };
      case 'language':
        return { ...item, value: language};
      case 'version':
        return { ...item, value: version};
      case 'keywords':
        return { ...item, value: keywords.join(','), tags: keywords };
      // case 'template':
      //   return { ...item, value: template};
      default:
        return item;
    }
  });

    
    setMetadataFields(newFormData);
    dispatch(
      replaceAllMetadata([
          ...newFormData, ...customMetadataField
        ],
      )
    );
    onSave({
      metadata: [
        ...newFormData, ...customMetadataField
      ],
    });
    setIsEditMode(false);
  };

  //create new custom metadata
  const handleCreateNewMetadata = (newMetadata: DocumentMetadata) => {
    if (newMetadata.title === "") {
      return;
    }
    setCustomMetadataField((prev) => [...prev, newMetadata]);
    setIsCustomOptionalMetadata(false);
  };

  //update form values
      useEffect(() => {
        setTitle(metadataFields.find((meta) => meta.title.toLowerCase() === 'title')?.value || '');
        setSubject(metadataFields.find((meta) => meta.title.toLowerCase() === 'subject')?.value || '');
        setAuthor(metadataFields.find((meta) => meta.title.toLowerCase() === 'author')?.value || '');
        setCopyrightHolder(metadataFields.find((meta) => meta.title.toLowerCase() === 'copyrightholder')?.value || '');
        setKeywords(metadataFields.find((meta) => meta.title.toLowerCase() === 'keywords')?.tags || []);
        setLanguage(metadataFields.find((meta) => meta.title.toLowerCase() === 'language')?.value || '');
        setVersion(metadataFields.find((meta) => meta.title.toLowerCase() === 'version')?.value || '');
    },[metadataFields]);

  return (
    <Modal
      isOpen={isOpen}
      title={t("metadata.title")}
      className="flex flex-col max-w-[55rem] flex h-[90%] flex-col !gap-0"
      contentClassName="!p-0 h-full overflow-y-auto"
      onOpenChange={() => {}}
      actions={
        !isInEditMode
          ? [
              <Button
                key="export-style"
                className="w-24"
                size="mini"
                intent="secondary"
                variant="tonal"
                onClick={() => onClose()}
              >
                {t("buttons.cancel")}
              </Button>,
              <Button
                key="done"
                className="w-24"
                size="mini"
                intent="primary"
                onClick={() => handleEdit()}
              >
                Edit
              </Button>,
            ]
          : [
              <Button
                key="export-style"
                className="w-24"
                size="mini"
                intent="primary"
                variant="tonal"
                onClick={() => handleOnCancel()}
              >
                {t("buttons.cancel")}
              </Button>,
              <Button
                key="save-edit"
                className="w-24"
                size="mini"
                intent="primary"
                onClick={handleSave}
              >
                {t("buttons.save")}
              </Button>,
            ]
      }
      headerClassName="!flex-1 h-[8vh]"
      footerClassName="!flex-1 items-center h-[8vh]"
    >
      {!isInEditMode ? (
        <div className="w-full h-full p-0 border-gray-300">
          <MetadataView
            createdDate={/* templateData.createdDate !==null ? templateData.createdDate : */ '-'}
            updatedDate={/* templateData.updatedDate !==null ? templateData.updatedDate :  */'-'}
            name={/* templateData.name !==null ? templateData.name : */ '-'}
            title={title}
            subject={subject}
            author={author}
            copyrightHolder={copyrightHolder}
            keywords={keywords}
            version={version}
          />
        </div>
      ) : (
        <div className="w-full p-0  border-gray-300">
          <MetadataForm
            createdDate={/* templateData.createdDate !==null ? templateData.createdDate : */ '-'}
            updatedDate={/* templateData.updatedDate !==null ? templateData.updatedDate :  */'-'}
            name={/* templateData.name !==null ? templateData.name : */ '-'}
            title={title}
            setTitle={setTitle}
            subject={subject}
            setSubject={setSubject}
            author={author}
            setAuthor={setAuthor}
            copyrightHolder={copyrightHolder}
            setCopyrightHolder={setCopyrightHolder}
            handleCreateNewMetadata={handleCreateNewMetadata}
            keywords={keywords}
            setKeywords={setKeywords}
            setMetadataFields={setMetadataFields}
            metadataFields={metadataFields}
            isCriterionOptionalMetadata={isCriterionOptionalMetadata}
            setIsCriterionOptionalMetadata={setIsCriterionOptionalMetadata}
            customMetadataField={customMetadataField ?? []}
            setIsCustomOptionalMetadata={setIsCustomOptionalMetadata}
            isCustomOptionalMetadata={isCustomOptionalMetadata}
            setCustomMetadataField={setCustomMetadataField}
            language={language}
            setLanguage={setLanguage}
            version={version}
            setVersion={setVersion}
            temporaryOptionalMetadata={temporaryOptionalMetadata}
            setTemporaryOptionalMetadata={setTemporaryOptionalMetadata}
          />
        </div>
      )}
    </Modal>
  );
}
