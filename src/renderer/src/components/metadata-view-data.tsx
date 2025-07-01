import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MetadataItem } from "@/components/metadata-components";
import { useSelector } from "react-redux";
import { metadataSelector } from "@/pages/editor/store/metadata/metadata.selector";

export interface ITemplateInfo{
  name: string;
  createdDate: string;
  updatedDate: string;
}
interface IMetadataView {
  title: string;
  subject: string;
  author: string;
  copyrightHolder: string;
  keywords: string[]
  createdDate: string
  updatedDate: string
  name:string
  version:string
}
const MetadataView = ({
  title,
  subject,
  author,
  copyrightHolder,
  keywords,
  createdDate,
  updatedDate,
  name,
  version,
}: IMetadataView) => {
  const { t } = useTranslation();
  const [metadataToView, setMetadataToView] = useState<DocumentMetadata[]>([]);
  const metadata = useSelector(metadataSelector)

   useEffect(()=>{
    setMetadataToView([...metadata.filter(({isChecked, typology})=>isChecked || typology==='custom' )])
  },[metadata])

  return (
    <div className="p-6 space-y-3">
      <MetadataItem title={t("metadata.license")} value="-" />
      <MetadataItem
        title={t("metadata.creationDate")}
        value={createdDate || "-"}
      />
      <MetadataItem
        title={t("metadata.lastSavedDate")}
        value={updatedDate || "-"}
      />
      <MetadataItem title={t("metadata.titleDoc")} value={title || "-"} />
      <MetadataItem title={t("metadata.subject")} value={subject || "-"} />
      <MetadataItem title={t("metadata.author")} value={author || "-"} />
      <MetadataItem
        title={t("metadata.copyrightHolder")}
        value={copyrightHolder || "-"}
      />
      <MetadataItem
        title={t("metadata.keywords")}
        value={keywords.length>0 ? keywords.join(', ') : '-'}
      />
      <MetadataItem title={t("metadata.status")} value="Draft" />
      <MetadataItem title={t("metadata.template")} value={name || "-"} />
      <MetadataItem title={t("metadata.language")} value="Latin" />
      <MetadataItem title={'Version'} value={version || '-'} />

 {metadataToView.length > 0 &&
  metadataToView.map((item) => {
    if (item.typology === 'custom') {
      if (item.valueType !== 'list') {
        return (
          <MetadataItem
            key={item.id}
            title={item.title}
            value={item.value || "-"}
          />
        );
      } else {
        return (
          <div className="flex flex-col" key={item.id}>
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">
              {item.title}
            </h3>
            {item.tags && <span>{item.tags.join(', ')}</span>}
          </div>
        );
      }
    } else if (item.typology === 'fixed') {
      return (
        <MetadataItem
          key={item.id}
          title={item.title}
          value={item.value || "-"}
        />
      );
    }
    return null;
  })}
    </div>
  );
};

export default MetadataView