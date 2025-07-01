// src/components/AddMetadataModalContent.tsx
import React, { Dispatch, SetStateAction } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { useTranslation } from 'react-i18next';




interface AddMetadataModalContentProps {
  isOpen: boolean;  
  onClose: () => void;
  handleAddMetadata: () => void;
  setTemporaryOptionalMetadata: Dispatch<SetStateAction<DocumentMetadata[]>>;
  temporaryOptionalMetadata: DocumentMetadata[];
}

const AddMetadataModalContent: React.FC<AddMetadataModalContentProps> = ({ isOpen, onClose, handleAddMetadata, setTemporaryOptionalMetadata, temporaryOptionalMetadata }) => {
    const { t } = useTranslation();

  const handleCheckboxChange = (id: number, checked: boolean) => {
    const updatedMetadataFields = temporaryOptionalMetadata.map((field) => {
      if (field.id === id) {
        return { ...field, isChecked: checked };
      }
      return field;
    });
    // Update the state which contains only the optional metadata with the new checked status
    setTemporaryOptionalMetadata(updatedMetadataFields);
  };

  return (
         <Modal
            isOpen={isOpen}
            title={'Add Metadata'}
            className="max-w-[880px] max-h-[90%] flex flex-col !gap-0 !m-2 !p-0"
            contentClassName="!p-0 max-h-[80%] overflow-y-auto"
            onOpenChange={() => { }}
            actions={[
                <Button
                    key="export-style"
                    className="w-24"
                    size="mini"
                    intent="primary"
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
                    onClick={()=>handleAddMetadata()}
                >
                    insert
                </Button>
            ]}>
        <div className="space-y-4 overflow-y-auto px-6 py-0">
          {temporaryOptionalMetadata.map((field) => (
            field.optional && <div key={field.id} className="flex flex-row items-center">
                
            <div  className="w-[5%] flex-none">
                <Checkbox
                    id={field.id.toString()}
                    checked={field.isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(field.id, Boolean(checked))}
                    className='w-[24px] h-[24px] border-grey-50 border-2'
                />
              </div>
                <Label
                  htmlFor={field.id.toString()}
                  className="w-[30%] flex-none text-[13px] font-[600]"
                >
                  {field.title}
                </Label>
                <p className="flex-1 text-[13px] w-[65%]">
                  {field.description}
                </p>
            </div>
          ))}
        </div>
   </Modal>
  );
};

export default AddMetadataModalContent;