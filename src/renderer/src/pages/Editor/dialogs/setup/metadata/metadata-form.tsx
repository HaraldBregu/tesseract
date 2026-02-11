import { useCallback, useEffect, useState } from "react";
import { Textarea } from "../../../../../components/ui/textarea";
import { Label } from "../../../../../components/ui/label";
import AddMetadataModalContent from "./metadata-modal-content";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Input } from "../../../../../components/ui/input";
import { InputTags } from "../../../../../components/input-tags";
import CustomMetadata from "./custom-metadata";
import { OptionalMetadataItem, CustomMetadataModal, AddMetadataButton } from "./metadata-components";
import { format } from "date-fns";
import AppSeparator from "@/components/app/app-separator";


interface IMetadataForm {
    metadata: Metadata
    preferences: Preferences
    onChange: (metadata: Metadata) => void
}

const MetadataForm = ({
    metadata,
    preferences,
    onChange,
}: IMetadataForm) => {
    const { t } = useTranslation();
    const [tempMetadata, setTempMetadata] = useState<Metadata>(metadata);

    const [isCriterionOptionalMetadata, setIsCriterionOptionalMetadata] = useState(false);
    const [isCustomOptionalMetadata, setIsCustomOptionalMetadata] = useState(false);

    const [createdDateFormatted, setCreatedDateFormatted] = useState<string | null>(null);
    const [updatedDateFormatted, setUpdatedDateFormatted] = useState<string | null>(null);

    useEffect(() => {
        if (!preferences) return;
        if (!preferences.dateFormat) return;

        if (tempMetadata.createdDate && tempMetadata.createdDate.length > 0 && tempMetadata.createdDate !== 'NaN') {
            const date = format(tempMetadata.createdDate, preferences.dateFormat);
            setCreatedDateFormatted(date);
        } else {
            setCreatedDateFormatted('-');
        }

        if (tempMetadata.updatedDate && tempMetadata.updatedDate.length > 0 && tempMetadata.updatedDate !== 'NaN') {
            const date = format(metadata.updatedDate, preferences.dateFormat);
            setUpdatedDateFormatted(date);
        } else {
            setUpdatedDateFormatted('-');
        }

    }, [preferences, tempMetadata]);

    useEffect(() => {
        setTempMetadata({
            ...metadata,
        });
    }, []);

    const handleChangeMetadataTitle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempMetadata({
            ...tempMetadata,
            title: e.target.value,
        })
    }, [tempMetadata]);

    const handleChangeMetadataLicense = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempMetadata({
            ...tempMetadata,
            license: e.target.value,
        })
    }, [tempMetadata]);

    const handleChangeMetadataSubject = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTempMetadata({
            ...tempMetadata,
            subject: e.target.value,
        })
    }, [tempMetadata]);

    const handleChangeMetadataAuthor = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempMetadata({
            ...tempMetadata,
            author: e.target.value,
        })
    }, [tempMetadata]);

    const handleChangeMetadataCopyrightHolder = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempMetadata({
            ...tempMetadata,
            copyrightHolder: e.target.value,
        })
    }, [tempMetadata]);

    const handleChangeMetadataLanguage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempMetadata({
            ...tempMetadata,
            language: e.target.value,
        })
    }, [tempMetadata]);

    const handleChangeMetadataVersion = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempMetadata({
            ...tempMetadata,
            version: e.target.value,
        })
    }, [tempMetadata]);

    const handleChangeMetadataStatus = useCallback((status: MetadataStatus) => {
        setTempMetadata({
            ...tempMetadata,
            status,
        })
    }, [tempMetadata]);

    const onSaveMetadata = useCallback((metadata: Metadata) => {
        setTempMetadata((prev) => ({
            ...prev,
            ...metadata
        }))
    }, [tempMetadata]);

    useEffect(() => {
        onChange(tempMetadata)
    }, [tempMetadata])

    return (
        <div className="pl-2 space-y-2 overflow-y-auto py-4">
            <div className="flex flex-col w-full gap-2 p-2">

                {/* License */}
                <div className="flex flex-row items-center justify-between w-full">
                    <Label htmlFor="title" className="text-[15px] font-semibold flex-1">
                        {t("metadata.license")}
                    </Label>
                    <Input
                        type="text"
                        id={'license'}
                        value={tempMetadata.license}
                        placeholder={tempMetadata.license || 'Enter license'}
                        onChange={handleChangeMetadataLicense}
                        className="bg-white dark:bg-gray-900 mt-1 h-[32px] w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1 min-w-[80%]"
                    />
                </div>

                {/* Creation Date */}
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-[15px] font-semibold mb-1 w-1/4 ">{t("metadata.creationDate")}</h3>
                    <p className="self-start w-full text-[15px]">{createdDateFormatted}</p>
                </div>

                {/* Last Saved Date */}
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-[15px] font-semibold mb-1 w-1/4">{t("metadata.lastSavedDate")}</h3>
                    <p className="w-full self-start text-[15px]">{updatedDateFormatted}</p>
                </div>

                {/* Title */}
                <div className="flex flex-row items-center justify-between w-full">
                    <Label htmlFor="title" className="text-[15px] font-semibold flex-1">
                        {t("metadata.titleDoc")}
                    </Label>
                    <Input
                        type="text"
                        id={'title'}
                        value={tempMetadata.title}
                        placeholder={tempMetadata.title || 'Enter title'}
                        onChange={handleChangeMetadataTitle}
                        className="bg-white dark:bg-gray-900 mt-1 h-[32px] w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1 min-w-[80%]"
                    />
                </div>

                {/* Subject */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="subject" className="text-[15px] font-semibold flex-1">
                        {t("metadata.subject")}
                    </Label>
                    <Textarea
                        id="subject"
                        value={tempMetadata.subject}
                        placeholder={tempMetadata.subject || 'Enter subject'}
                        onChange={handleChangeMetadataSubject}
                        className="bg-white dark:bg-gray-900 mt-1 block w-full h-[96px] border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 flex-1 focus:border-blue-500 sm:text-sm resize-y min-w-[80%]"
                    />
                </div>

                {/* Author */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="author" className="text-[15px] font-semibold flex-1">
                        {t("metadata.author")}
                    </Label>
                    <Input
                        type="text"
                        id={'author'}
                        value={tempMetadata.author}
                        placeholder={tempMetadata.author || 'Enter author'}
                        onChange={handleChangeMetadataAuthor}
                        className="bg-white dark:bg-gray-900 mt-1 h-[32px] w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1 min-w-[80%]"
                    />
                </div>

                {/* Copyright Holder */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="copyrightHolder" className="text-[15px] font-semibold flex-1">
                        {t("metadata.copyrightHolder")}
                    </Label>
                    <Input
                        type="text"
                        id={'copyrightHolder'}
                        value={tempMetadata.copyrightHolder}
                        placeholder={tempMetadata.copyrightHolder || 'Enter copyright holder'}
                        onChange={handleChangeMetadataCopyrightHolder}
                        className="bg-white dark:bg-gray-900 mt-1 h-[32px] w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1 min-w-[80%]"
                    />
                </div>

                {/* Keywords */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="keywords" className="w-1/4 text-[15px] font-semibold flex-1">
                        {t("metadata.keywords")}
                    </Label>
                    <div className="flex flex-wrap gap-2 w-4/5">
                        <InputTags
                            id="keywords"
                            value={tempMetadata.keywords}
                            placeholder={t("metadata.keywordsPlaceholder")}
                            onChange={(newKeywords) => setTempMetadata({ ...tempMetadata, keywords: newKeywords as string[] })}
                            className="w-full flex flex-row flex-wrap "
                            inputClassName=" h-auto min-h-[2rem] flex m-0"
                            chipVariant={"secondary"}
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="status" className="text-[15px] font-semibold w-1/4">
                        {t("metadata.status")}
                    </Label>
                    <Select
                        onValueChange={handleChangeMetadataStatus}
                        value={tempMetadata.status || `${t("metadata.statusList.draft")}`}>
                        <SelectTrigger className="bg-white dark:bg-gray-900 text-[13px] font-600 rounded-sm">
                            <SelectValue> {tempMetadata.status || `${t("metadata.statusList.draft")}`} </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={t("metadata.statusList.draft")}>{t("metadata.statusList.draft")}</SelectItem>
                            <SelectItem value={t("metadata.statusList.inReview")}>{t("metadata.statusList.inReview")}</SelectItem>
                            <SelectItem value={t("metadata.statusList.final")}>{t("metadata.statusList.final")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Template */}
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-[15px] font-semibold mb-1 w-1/4 ">
                        {t("metadata.template")}
                    </h3>
                    <p className="self-start w-full text-[15px]">
                        {tempMetadata.templateName || '-'}
                    </p>
                </div>

                {/* Language */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="language" className="text-[15px] font-semibold w-1/4">
                        {t("metadata.language")}
                    </Label>
                    <div className="w-full">
                        <Input
                            type="text"
                            id={'language'}
                            value={tempMetadata.language}
                            placeholder={tempMetadata.language || 'Enter language'}
                            onChange={handleChangeMetadataLanguage}
                            className="bg-white dark:bg-gray-900 w-1/2 h-[32px] mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Version */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="version" className="text-[15px] font-semibold w-1/4">
                        {t("metadata.version")}
                    </Label>
                    <div className="w-full">
                        <Input
                            type="text"
                            id={'version'}
                            value={tempMetadata.version}
                            placeholder={tempMetadata.version || 'Enter version'}
                            onChange={handleChangeMetadataVersion}
                            className="bg-white dark:bg-gray-900 w-1/2 h-[32px] mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <AppSeparator />

                {/* Optional Metadata */}

                {tempMetadata.persistentIdentifier !== null && <OptionalMetadataItem
                    title="Persistent Identifier"
                    type='text'
                    value={tempMetadata.persistentIdentifier}
                    onChange={(persistentIdentifier) => { setTempMetadata({ ...tempMetadata, persistentIdentifier }) }}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, persistentIdentifier: null }) }}
                />}
                {tempMetadata.manager !== null && <OptionalMetadataItem
                    title="Manager"
                    type='text'
                    value={tempMetadata.manager}
                    onChange={(manager) => setTempMetadata({ ...tempMetadata, manager })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, manager: null }) }}
                />}
                {tempMetadata.company !== null && <OptionalMetadataItem
                    title="Company"
                    type='text'
                    value={tempMetadata.company}
                    onChange={(company) => setTempMetadata({ ...tempMetadata, company })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, company: null }) }}
                />}
                {tempMetadata.publisher !== null && <OptionalMetadataItem
                    title="Publisher"
                    type='text'
                    value={tempMetadata.publisher}
                    onChange={(publisher) => setTempMetadata({ ...tempMetadata, publisher })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, publisher: null }) }}
                />}
                {tempMetadata.licenseInformation !== null && <OptionalMetadataItem
                    title="License Information"
                    type='text'
                    value={tempMetadata.licenseInformation}
                    onChange={(licenseInformation) => setTempMetadata({ ...tempMetadata, licenseInformation })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, licenseInformation: null }) }}
                />}
                {tempMetadata.category !== null && <OptionalMetadataItem
                    title="Category"
                    type='text'
                    value={tempMetadata.category}
                    onChange={(category) => setTempMetadata({ ...tempMetadata, category })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, category: null }) }}
                />}
                {tempMetadata.comments !== null && <OptionalMetadataItem
                    title="Comments"
                    type='text'
                    value={tempMetadata.comments}
                    onChange={(comments) => setTempMetadata({ ...tempMetadata, comments })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, comments: null }) }}
                />}
                {tempMetadata.lastAuthor !== null && <OptionalMetadataItem
                    type='text'
                    title="Last Author"
                    value={tempMetadata.lastAuthor}
                    onChange={(lastAuthor) => setTempMetadata({ ...tempMetadata, lastAuthor })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, lastAuthor: null }) }}
                />}
                {tempMetadata.revisionNumber !== null && <OptionalMetadataItem
                    title="Revision Number"
                    type='text'
                    value={tempMetadata.revisionNumber}
                    onChange={(revisionNumber) => setTempMetadata({ ...tempMetadata, revisionNumber })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, revisionNumber: null }) }}
                />}
                {tempMetadata.totalEditingTime !== null && <OptionalMetadataItem
                    title="Total Editing Time"
                    type='text'
                    value={tempMetadata.totalEditingTime}
                    onChange={(totalEditingTime) => setTempMetadata({ ...tempMetadata, totalEditingTime })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, totalEditingTime: null }) }}
                />}
                {tempMetadata.lastPrintedDate !== null && <OptionalMetadataItem
                    title="Last Printed Date"
                    type='text'
                    value={tempMetadata.lastPrintedDate}
                    onChange={(lastPrintedDate) => setTempMetadata({ ...tempMetadata, lastPrintedDate })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, lastPrintedDate: null }) }}
                />}
                {tempMetadata.contentStatus !== null && <OptionalMetadataItem
                    title="Content Status"
                    type='text'
                    value={tempMetadata.contentStatus}
                    onChange={(contentStatus) => setTempMetadata({ ...tempMetadata, contentStatus })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, contentStatus: null }) }}
                />}
                {tempMetadata.contentType !== null && <OptionalMetadataItem
                    title="Content Type"
                    type='text'
                    value={tempMetadata.contentType}
                    onChange={(contentType) => setTempMetadata({ ...tempMetadata, contentType })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, contentType: null }) }}
                />}
                {tempMetadata.wordCount !== null && <OptionalMetadataItem
                    title="Word Count"
                    type='text'
                    value={tempMetadata.wordCount}
                    onChange={(wordCount) => setTempMetadata({ ...tempMetadata, wordCount })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, wordCount: null }) }}
                />}
                {tempMetadata.characterCountWithSpaces !== null && <OptionalMetadataItem
                    title="Character Count (with spaces)"
                    type='text'
                    value={tempMetadata.characterCountWithSpaces}
                    onChange={(characterCountWithSpaces) => setTempMetadata({ ...tempMetadata, characterCountWithSpaces })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, characterCountWithSpaces: null }) }}
                />}
                {tempMetadata.characterCountNoSpaces !== null && <OptionalMetadataItem
                    title="Character Count (no spaces)"
                    type='text'
                    value={tempMetadata.characterCountNoSpaces}
                    onChange={(characterCountNoSpaces) => setTempMetadata({ ...tempMetadata, characterCountNoSpaces })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, characterCountNoSpaces: null }) }}
                />}
                {tempMetadata.lineCount !== null && <OptionalMetadataItem
                    title="Line Count"
                    type='text'
                    value={tempMetadata.lineCount}
                    onChange={(lineCount) => setTempMetadata({ ...tempMetadata, lineCount })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, lineCount: null }) }}
                />}
                {tempMetadata.paragraphCount !== null && <OptionalMetadataItem
                    title="Paragraph Count"
                    type='text'
                    value={tempMetadata.paragraphCount}
                    onChange={(paragraphCount) => setTempMetadata({ ...tempMetadata, paragraphCount })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, paragraphCount: null }) }}
                />}
                {tempMetadata.pageCount !== null && <OptionalMetadataItem
                    title="Page Count"
                    type='text'
                    value={tempMetadata.pageCount}
                    onChange={(pageCount) => setTempMetadata({ ...tempMetadata, pageCount })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, pageCount: null }) }}
                />}
                {tempMetadata.customName !== null && <OptionalMetadataItem
                    title="Custom Name"
                    type='text'
                    value={tempMetadata.customName}
                    onChange={(customName) => setTempMetadata({ ...tempMetadata, customName })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, customName: null }) }}
                />}
                {tempMetadata.valueType !== null && <OptionalMetadataItem
                    title="Value Type"
                    type='text'
                    value={tempMetadata.valueType}
                    onChange={(valueType) => setTempMetadata({ ...tempMetadata, valueType })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, valueType: null }) }}
                />}
                {tempMetadata.value !== null && <OptionalMetadataItem
                    title="Value"
                    type='text'
                    value={tempMetadata.value}
                    onChange={(value) => setTempMetadata({ ...tempMetadata, value })}
                    onDelete={() => { setTempMetadata({ ...tempMetadata, value: null }) }}
                />}

                {tempMetadata.others.length > 0 && <AppSeparator />}

                {/* Custom Optional Metadata */}
                {tempMetadata.others.map((other: AddOnMetadata, index) => (
                    <CustomMetadata
                        key={other.name}
                        other={other}
                        index={index}
                        setTempMetadata={setTempMetadata}
                        tempMetadata={tempMetadata}
                    />
                ))}

                {/* Criterion Optional Metadata */}
                <AddMetadataModalContent
                    isOpen={isCriterionOptionalMetadata}
                    onClose={() => setIsCriterionOptionalMetadata(false)}
                    metadata={tempMetadata}
                    onSave={onSaveMetadata}
                />

                <CustomMetadataModal
                    isOpen={isCustomOptionalMetadata}
                    onClose={() => setIsCustomOptionalMetadata(false)}
                    onCreate={(customMetadata) => {
                        setTempMetadata((prev) => ({
                            ...prev,
                            others: [
                                ...(prev.others || []),
                                customMetadata,
                            ]
                        }))
                    }}
                />
            </div>

            <AddMetadataButton
                className="y-6 mb-4 mx-2"
                onSetOptional={setIsCriterionOptionalMetadata}
                onSetCustom={setIsCustomOptionalMetadata}
            />
        </div>
    );
};
export { MetadataForm as default };



