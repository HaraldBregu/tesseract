import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


interface IMetadataView {
  metadata: Metadata
  preferences: Preferences
}

const MetadataView = ({
  metadata,
  preferences,
}: IMetadataView) => {
  const { t } = useTranslation();

  const [createdDateFormatted, setCreatedDateFormatted] = useState<string | null>(null);
  const [updatedDateFormatted, setUpdatedDateFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (!preferences) return;
    if (!preferences.dateFormat) return;
    if (!metadata) return;

    if (metadata.createdDate && metadata.createdDate.length > 0 && metadata.createdDate !== 'NaN') {
      const date = format(metadata.createdDate, preferences.dateFormat);
      setCreatedDateFormatted(date);
    } else {
      setCreatedDateFormatted('-');
    }

    if (metadata.updatedDate && metadata.updatedDate.length > 0 && metadata.updatedDate !== 'NaN') {
      const date = format(metadata.updatedDate, preferences.dateFormat);
      setUpdatedDateFormatted(date);
    } else {
      setUpdatedDateFormatted('-');
    }

  }, [preferences, metadata]);

  return (
    <div className="p-6 space-y-3">
      <MetadataItem title={t("metadata.license")} value={metadata.license} />
      {createdDateFormatted && <MetadataItem
        title={t("metadata.creationDate")}
        value={createdDateFormatted}
      />}
      {updatedDateFormatted && <MetadataItem
        title={t("metadata.lastSavedDate")}
        value={updatedDateFormatted}
      />}
      <MetadataItem title={t("metadata.titleDoc")} value={metadata.title} />
      <MetadataItem title={t("metadata.subject")} value={metadata.subject} />
      <MetadataItem title={t("metadata.author")} value={metadata.author} />
      <MetadataItem
        title={t("metadata.copyrightHolder")}
        value={metadata.copyrightHolder}
      />
      <MetadataItem
        title={t("metadata.keywords")}
        value={metadata.keywords && metadata.keywords?.length && metadata.keywords?.length > 0 ? metadata.keywords?.join(', ') || '-' : '-'}
      />
      <MetadataItem title={t("metadata.status")} value={metadata.status} />
      <MetadataItem title={t("metadata.template")} value={metadata.templateName} />
      <MetadataItem title={t("metadata.language")} value={metadata.language} />
      <MetadataItem title={'Version'} value={metadata.version} />

      {/* Optional Metadata */}

      {metadata.persistentIdentifier !== null && <MetadataItem
        title="Persistent Identifier"
        value={metadata.persistentIdentifier}
      />}
      {metadata.manager !== null && <MetadataItem
        title="Manager"
        value={metadata.manager}
      />}
      {metadata.company !== null && <MetadataItem
        title="Company"
        value={metadata.company}
      />}
      {metadata.publisher !== null && <MetadataItem
        title="Publisher"
        value={metadata.publisher}
      />}
      {metadata.licenseInformation !== null && <MetadataItem
        title="License Information"
        value={metadata.licenseInformation}
      />}
      {metadata.category !== null && <MetadataItem
        title="Category"
        value={metadata.category}
      />}
      {metadata.comments !== null && <MetadataItem
        title="Comments"
        value={metadata.comments}
      />}
      {metadata.lastAuthor !== null && <MetadataItem
        title="Last Author"
        value={metadata.lastAuthor}
      />}
      {metadata.revisionNumber !== null && <MetadataItem
        title="Revision Number"
        value={metadata.revisionNumber}
      />}
      {metadata.totalEditingTime !== null && <MetadataItem
        title="Total Editing Time"
        value={metadata.totalEditingTime}
      />}
      {metadata.lastPrintedDate !== null && <MetadataItem
        title="Last Printed Date"
        value={metadata.lastPrintedDate}
      />}
      {metadata.contentStatus !== null && <MetadataItem
        title="Content Status"
        value={metadata.contentStatus}
      />}
      {metadata.contentType !== null && <MetadataItem
        title="Content Type"
        value={metadata.contentType}
      />}
      {metadata?.valueType !== null && <MetadataItem
        title="Value Type"
        value={metadata.valueType}
      />}
      {metadata.value !== null && <MetadataItem
        title="Value"
        value={metadata.value}
      />}

      {/* Custom Metadata */}
      {metadata.others && metadata.others.map((item) => (
        <MetadataItem
          key={item.name}
          title={item.name}
          value={Array.isArray(item.value) ? item.value.join(', ') : item.value as string}
        />
      ))}
    </div>
  );
};

export default MetadataView


interface IMetadataItem {
  title: string;
  value: string;
}

const MetadataItem = ({ title, value }: IMetadataItem) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white"> {title} </h3>
      <p className="text-[15px] text-gray-600 dark:text-white"> {value || '-'} </p>
    </div>
  );
};