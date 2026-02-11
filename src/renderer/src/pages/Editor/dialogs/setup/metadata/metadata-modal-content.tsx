import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import AppButton from '@/components/app/app-button';
import { AppDialog, AppDialogContent, AppDialogDescription, AppDialogFooter, AppDialogHeader, AppDialogTitle } from '@/components/app/app-dialog';
import MetadataOptionalCheckbox from './metadata-optional-checkbox';


const metadataItems = (t: TFunction): any[] => [
  {
    key: "persistentIdentifier",
    label: t("metadata.persistentIdentifier.label"),
    description: t("metadata.persistentIdentifier.description"),
  },
  {
    key: "manager",
    label: t("metadata.manager.label"),
    description: t("metadata.manager.description"),
  },
  {
    key: "company",
    label: t("metadata.company.label"),
    description: t("metadata.company.description"),
  },
  {
    key: "publisher",
    label: t("metadata.publisher.label"),
    description: t("metadata.publisher.description"),
  },
  {
    key: "licenseInformation",
    label: t("metadata.licenseInformation.label"),
    description: t("metadata.licenseInformation.description"),
  },
  {
    key: "category",
    label: t("metadata.category.label"),
    description: t("metadata.category.description"),
  },
  {
    key: "comments",
    label: t("metadata.comments.label"),
    description: t("metadata.comments.description"),
  },
  {
    key: "lastAuthor",
    label: t("metadata.lastAuthor.label"),
    description: t("metadata.lastAuthor.description"),
  },
  {
    key: "revisionNumber",
    label: t("metadata.revisionNumber.label"),
    description: t("metadata.revisionNumber.description"),
  },
  {
    key: "totalEditingTime",
    label: t("metadata.totalEditingTime.label"),
    description: t("metadata.totalEditingTime.description"),
  },
  {
    key: "lastPrintedDate",
    label: t("metadata.lastPrintedDate.label"),
    description: t("metadata.lastPrintedDate.description"),
  },
  {
    key: "contentStatus",
    label: t("metadata.contentStatus.label"),
    description: t("metadata.contentStatus.description"),
  },
  {
    key: "contentType",
    label: t("metadata.contentType.label"),
    description: t("metadata.contentType.description"),
  },
  {
    key: "wordCount",
    label: t("metadata.wordCount.label"),
    description: t("metadata.wordCount.description"),
  },
  {
    key: "characterCountWithSpaces",
    label: t("metadata.characterCountWithSpaces.label"),
    description: t("metadata.characterCountWithSpaces.description"),
  },
  {
    key: "characterCountNoSpaces",
    label: t("metadata.characterCountNoSpaces.label"),
    description: t("metadata.characterCountNoSpaces.description"),
  },
  {
    key: "lineCount",
    label: t("metadata.lineCount.label"),
    description: t("metadata.lineCount.description"),
  },
  {
    key: "paragraphCount",
    label: t("metadata.paragraphCount.label"),
    description: t("metadata.paragraphCount.description"),
  },
  {
    key: "pageCount",
    label: t("metadata.pageCount.label"),
    description: t("metadata.pageCount.description"),
  },
  {
    key: "customName",
    label: t("metadata.customName.label"),
    description: t("metadata.customName.description"),
  },
  {
    key: "valueType",
    label: t("metadata.valueType.label"),
    description: t("metadata.valueType.description"),
  },
  {
    key: "value",
    label: t("metadata.value.label"),
    description: t("metadata.value.description"),
  },
];
interface AddMetadataModalContentProps {
  isOpen: boolean;
  metadata: Metadata;
  onClose: () => void;
  onSave: (metadata: Metadata) => void;
}

const AddMetadataModalContent = ({
  isOpen,
  onClose,
  metadata,
  onSave,
}: AddMetadataModalContentProps) => {
  const { t } = useTranslation();
  const [tempMetadata, setTempMetadata] = useState<Metadata>(metadata);

  useEffect(() => {
    setTempMetadata(metadata)
  }, [metadata])

  const labelFromKey = useCallback((key: string) => {
    return metadataItems(t).find((item) => item.key === key)?.label || key;
  }, [t]);

  const descriptionFromKey = useCallback((key: string) => {
    return metadataItems(t).find((item) => item.key === key)?.description || "";
  }, [t]);

  const onInsert = useCallback(() => {
    onSave(tempMetadata)
    onClose();
  }, [onSave, onClose, tempMetadata]);

  return (
    <AppDialog
      open={isOpen}
      modal={false}>
      <AppDialogContent className="max-w-[880px] max-h-[90%] flex flex-col !gap-0 !m-2 !p-0 overflow-y-auto">
        <AppDialogHeader>
          <AppDialogTitle>
            {t("metadata.buttons.addMetadata")}
          </AppDialogTitle>
          <AppDialogDescription />
        </AppDialogHeader>
        <div className="space-y-4 overflow-y-auto px-6 py-4">
          <MetadataOptionalCheckbox
            label={labelFromKey('persistentIdentifier')}
            description={descriptionFromKey('persistentIdentifier')}
            checked={tempMetadata.persistentIdentifier !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                persistentIdentifier: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('manager')}
            description={descriptionFromKey('manager')}
            checked={tempMetadata.manager !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                manager: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('company')}
            description={descriptionFromKey('company')}
            checked={tempMetadata.company !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                company: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('publisher')}
            description={descriptionFromKey('publisher')}
            checked={tempMetadata.publisher !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                publisher: checked ? '' : null
              }))
            }}

          />
          <MetadataOptionalCheckbox
            label={labelFromKey('licenseInformation')}
            description={descriptionFromKey('licenseInformation')}
            checked={tempMetadata.licenseInformation !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                licenseInformation: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('category')}
            description={descriptionFromKey('category')}
            checked={tempMetadata.category !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                category: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('comments')}
            description={descriptionFromKey('comments')}
            checked={tempMetadata.comments !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                comments: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('lastAuthor')}
            description={descriptionFromKey('lastAuthor')}
            checked={tempMetadata.lastAuthor !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                lastAuthor: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('revisionNumber')}
            description={descriptionFromKey('revisionNumber')}
            checked={tempMetadata.revisionNumber !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                revisionNumber: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('totalEditingTime')}
            description={descriptionFromKey('totalEditingTime')}
            checked={tempMetadata.totalEditingTime !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                totalEditingTime: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('lastPrintedDate')}
            description={descriptionFromKey('lastPrintedDate')}
            checked={tempMetadata.lastPrintedDate !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                lastPrintedDate: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('contentStatus')}
            description={descriptionFromKey('contentStatus')}
            checked={tempMetadata.contentStatus !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                contentStatus: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('contentType')}
            description={descriptionFromKey('contentType')}
            checked={tempMetadata.contentType !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                contentType: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('wordCount')}
            description={descriptionFromKey('wordCount')}
            checked={tempMetadata.wordCount !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                wordCount: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('characterCountWithSpaces')}
            description={descriptionFromKey('characterCountWithSpaces')}
            checked={tempMetadata.characterCountWithSpaces !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                characterCountWithSpaces: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('characterCountNoSpaces')}
            description={descriptionFromKey('characterCountNoSpaces')}
            checked={tempMetadata.characterCountNoSpaces !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                characterCountNoSpaces: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('lineCount')}
            description={descriptionFromKey('lineCount')}
            checked={tempMetadata.lineCount !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                lineCount: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('paragraphCount')}
            description={descriptionFromKey('paragraphCount')}
            checked={tempMetadata.paragraphCount !== null}
            onChange={(checked) => {
              setTempMetadata((prev) => ({
                ...prev,
                paragraphCount: checked ? '' : null
              }))
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('pageCount')}
            description={descriptionFromKey('pageCount')}
            checked={tempMetadata.pageCount !== null}
            onChange={(checked) => {
              setTempMetadata({
                ...tempMetadata,
                pageCount: checked ? '' : null
              })
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('customName')}
            description={descriptionFromKey('customName')}
            checked={tempMetadata.customName !== null}
            onChange={(checked) => {
              setTempMetadata({
                ...tempMetadata,
                customName: checked ? '' : null
              })
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('valueType')}
            description={descriptionFromKey('valueType')}
            checked={tempMetadata.valueType !== null}
            onChange={(checked) => {
              setTempMetadata({
                ...tempMetadata,
                valueType: checked ? '' : null
              })
            }}
          />
          <MetadataOptionalCheckbox
            label={labelFromKey('value')}
            description={descriptionFromKey('value')}
            checked={tempMetadata.value !== null}
            onChange={(checked) => {
              setTempMetadata({
                ...tempMetadata,
                value: checked ? '' : null
              })
            }}
          />
        </div>
        <AppDialogFooter>
          <AppButton
            size="xs"
            shadow="none"
            className="w-24"
            onClick={onClose}
            variant={"secondary"}
          >
            {t("buttons.cancel")}
          </AppButton>
          <AppButton
            className="w-24"
            size="xs"
            shadow="none"
            onClick={onInsert}
            variant={"default"}
          >
            {t('buttons.insert')}
          </AppButton>
        </AppDialogFooter>

      </AppDialogContent>
    </AppDialog>
  );
};

export default AddMetadataModalContent;
