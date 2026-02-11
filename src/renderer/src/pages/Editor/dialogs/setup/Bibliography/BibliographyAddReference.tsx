import AppButton from "@/components/app/app-button";
import { AppDialog, AppDialogContent, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog";
import { cn } from "@/lib/utils";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppSelect, AppSelectContent, AppSelectItem, AppSelectTrigger, AppSelectValue } from "@/components/app/app-select";
import List from "@/components/app/list";
import { REFERENCE_FIELD_VALIDATION_PATTERNS, REFERENCE_SOURCE_TYPES, SHOW_FIELDS_BASED_ON_SOURCE } from "@/utils/optionsEnums";
import AppLabel from "@/components/app/app-label";
import IconClose from "@/components/app/icons/IconClose";
import AppInput from "@/components/app/app-input";

interface CreateReferenceProps {
    reference: BibReference;
    handleAddBibRef: (reference: BibReference) => void;
    onCancel: () => void;
    isOpen: boolean;
}

const CreateReference: React.FC<CreateReferenceProps> = ({
    handleAddBibRef,
    onCancel,
    reference,
    isOpen
}) => {
    const { t } = useTranslation();


    const [fieldData, setFieldData] = useState<BibReference>(reference);
    const showFields = useMemo(() => SHOW_FIELDS_BASED_ON_SOURCE[fieldData.sourceType], [fieldData.sourceType]);
    const [errors, setErrors] = useState<Record<BIB_REFERENCE_FIELDS_EXCLUDED_SOURCE, string>>();
    const [hasError, setHasError] = useState<boolean>(false);

    const isDisabled = useMemo(() => JSON.stringify(reference) === JSON.stringify(fieldData), [fieldData, reference]);

    const handleBibReferenceTypeChange = useCallback((value: string) => setFieldData({
        ...fieldData,
        sourceType: value as BIB_REFERENCE_TYPES,
    }), []);

    const handleFieldValue = useCallback((fieldKey: string, value: string | string[]) => {
        setFieldData(prev => ({
            ...prev,
            [fieldKey]: value,
        }));
    }, []);

    useEffect(() => {
        const errors: Record<string, string> = {};
        let hasError = false;

        for (const element of showFields) {
            const { required: isRequired, pattern }: VALIDATION = REFERENCE_FIELD_VALIDATION_PATTERNS[element];
            const fieldKey: BIB_REFERENCE_FIELDS = element as BIB_REFERENCE_FIELDS;
            const fieldValue = fieldData[fieldKey];
            const regExp = new RegExp(pattern);
            if (isRequired && (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0))) {
                errors[fieldKey] = t(`bibliography.references.validations.${fieldKey}.required`, `##${fieldKey} is required##`);
            } else if (pattern && ((fieldValue !== '' && typeof fieldValue === "string" && !fieldValue.match(regExp)) ||
                (Array.isArray(fieldValue) && fieldValue.some(value => value !== '' && !value.match(regExp))))) {
                errors[fieldKey] = t(`bibliography.references.validations.${fieldKey}.pattern`, `##${fieldKey} has an invalid format`);
            } else {
                delete errors[fieldKey];
            }
            hasError = hasError || !!errors[element]?.length;
        }

        setErrors(hasError ? errors : undefined);
        setHasError(hasError);
    }, [fieldData, showFields]);


    const handleCreateReference = useCallback(() => {
        if (!hasError) {
            const refId = fieldData?.id || crypto.randomUUID();
            handleAddBibRef({
                ...fieldData,
                id: refId
            });
        }
    }, [fieldData, hasError]);

    return (
        <AppDialog
            open={isOpen}
            onOpenChange={onCancel}
        >
            <AppDialogContent className={cn("max-w-[600px] max-h-[585px]")}>
                <AppDialogHeader>
                    <div className="flex justify-between items-center">
                        <AppDialogTitle className={cn("text-md font-bold flex-1")}>
                            {t(`bibliography.references.${reference?.id ? 'edit' : 'create'}`, "##New Bibliographic Reference##")}
                        </AppDialogTitle>
                        <AppButton
                            variant="transparent"
                            size="icon-sm"
                            onClick={onCancel}
                            aria-label={t("dialog.close", "Close")}
                            className="ml-2">
                            <IconClose />
                        </AppButton>
                    </div>
                </AppDialogHeader>
                <AddReferenceDialogContent>
                    <ControlContainer
                        title={t('bibliography.references.fields.sourceType', '##Source Type##')}
                        htmlFor="sourceType">
                        <AppSelect value={fieldData.sourceType} onValueChange={handleBibReferenceTypeChange}>
                            <AppSelectTrigger id="sourceType" className="hover:bg-transparent active:bg-transparent focus-visible:ring-1 focus-visible:bg-transparent focus-visible:border-primary hover:text-grey-10 hover:dark:text-grey-90 focus-visible:text-grey-10 focus-visible:dark:text-grey-90">
                                <AppSelectValue />
                            </AppSelectTrigger>
                            <AppSelectContent>
                                <List
                                    data={REFERENCE_SOURCE_TYPES}
                                    renderItem={(item: ReferenceSourceType) => (
                                        <AppSelectItem
                                            key={item.value}
                                            value={item.value}
                                            className="hover:cursor-pointer"
                                        >
                                            {t(item.label)}
                                        </AppSelectItem>
                                    )}
                                />
                            </AppSelectContent>
                        </AppSelect>
                    </ControlContainer>
                    {showFields.includes("title") && (
                        <ControlContainer title={t("bibliography.references.fields.title", "##Title##")} htmlFor="title" key="title" error={t(errors?.title ?? '')}>
                            <AppInput
                                placeholder={t("bibliography.references.placeholders.title", "Enter title...")}
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.title}
                                onChange={(e) => handleFieldValue("title", e.target.value)}
                                id="title"
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("editor") && (
                        <ControlContainer title={t("bibliography.references.fields.editor", "##Editor##")} htmlFor="editor" key="editor" error={t(errors?.editor ?? '')}>
                            <AppInput
                                placeholder={t("bibliography.references.placeholders.editor", "Enter editor...")}
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.editor}
                                onChange={(e) => handleFieldValue("editor", e.target.value)}
                                id="editor"
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("author") && (
                        <ControlContainer title={t("bibliography.references.fields.author", "##Author##")} htmlFor="author" key="author" error={t(errors?.author ?? '')}>
                            <TagInput
                                value={fieldData.author}
                                placeholder={t("bibliography.references.placeholders.author", "Enter author name, press Enter...")}
                                onChange={(value) => handleFieldValue("author", value)}
                                htmlFor="author"
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("bookTitle") && (
                        <ControlContainer title={t("bibliography.references.fields.bookTitle", "##Book Title##")} htmlFor="bookTitle" key="bookTitle" error={t(errors?.bookTitle ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.bookTitle}
                                onChange={(e) => handleFieldValue("bookTitle", e.target.value)}
                                id="bookTitle"
                                placeholder={t("bibliography.references.placeholders.bookTitle", "Enter book title...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("series") && (
                        <ControlContainer title={t("bibliography.references.fields.series", "##Series##")} htmlFor="series" key="series" error={t(errors?.series ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.series}
                                onChange={(e) => handleFieldValue("series", e.target.value)}
                                id="series"
                                placeholder={t("bibliography.references.placeholders.series", "Enter series...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("seriesNumber") && (
                        <ControlContainer title={t("bibliography.references.fields.seriesNumber", "##Series Number##")} htmlFor="seriesNumber" key="seriesNumber" error={t(errors?.seriesNumber ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.seriesNumber}
                                onChange={(e) => handleFieldValue("seriesNumber", e.target.value)}
                                id="seriesNumber"
                                placeholder={t("bibliography.references.placeholders.seriesNumber", "Enter series number...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("volume") && (
                        <ControlContainer title={t("bibliography.references.fields.volume", "##Volume##")} htmlFor="volume" key="volume" error={t(errors?.volume ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.volume}
                                onChange={(e) => handleFieldValue("volume", e.target.value)}
                                id="volume"
                                placeholder={t("bibliography.references.placeholders.volume", "Enter volume...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("numberOfVolumes") && (
                        <ControlContainer title={t("bibliography.references.fields.numberOfVolumes", "##Number of Volumes##")} htmlFor="numberOfVolumes" key="numberOfVolumes" error={t(errors?.numberOfVolumes ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.numberOfVolumes}
                                onChange={(e) => handleFieldValue("numberOfVolumes", e.target.value)}
                                id="numberOfVolumes"
                                placeholder={t("bibliography.references.placeholders.numberOfVolumes", "Enter number of volumes...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("issue") && (
                        <ControlContainer title={t("bibliography.references.fields.issue", "##Issue##")} htmlFor="issue" key="issue" error={t(errors?.issue ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.issue}
                                onChange={(e) => handleFieldValue("issue", e.target.value)}
                                id="issue"
                                placeholder={t("bibliography.references.placeholders.issue", "Enter issue...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("doi") && (
                        <ControlContainer title={t("bibliography.references.fields.doi", "##DOI##")} htmlFor="doi" key="doi" error={t(errors?.doi ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.doi}
                                onChange={(e) => handleFieldValue("doi", e.target.value)}
                                id="doi"
                                placeholder={t("bibliography.references.placeholders.doi", "e.g. 10.1000/xyz123")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("place") && (
                        <ControlContainer title={t("bibliography.references.fields.place", "##Place##")} htmlFor="place" key="place" error={t(errors?.place ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.place}
                                onChange={(e) => handleFieldValue("place", e.target.value)}
                                id="place"
                                placeholder={t("bibliography.references.placeholders.place", "Enter place...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("publisher") && (
                        <ControlContainer title={t("bibliography.references.fields.publisher", "##Publisher##")} htmlFor="publisher" key="publisher" error={t(errors?.publisher ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.publisher}
                                onChange={(e) => handleFieldValue("publisher", e.target.value)}
                                id="publisher"
                                placeholder={t("bibliography.references.placeholders.publisher", "Enter publisher...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("date") && (
                        <ControlContainer title={t("bibliography.references.fields.date", "##Date##")} htmlFor="date" key="date" error={t(errors?.date ?? '')}>
                            <AppInput
                                type="text"
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.date}
                                onChange={(e) => handleFieldValue("date", e.target.value)}
                                id="date"
                                placeholder={t("bibliography.references.placeholders.date", "e.g. 2024-01-15")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("pages") && (
                        <ControlContainer title={t("bibliography.references.fields.pages", "##Pages##")} htmlFor="pages" key="pages" error={t(errors?.pages ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.pages}
                                onChange={(e) => handleFieldValue("pages", e.target.value)}
                                id="pages"
                                placeholder={t("bibliography.references.placeholders.pages", "e.g. 123-145")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("shortTitle") && (
                        <ControlContainer title={t("bibliography.references.fields.shortTitle", "##Short Title##")} htmlFor="shortTitle" key="shortTitle" error={t(errors?.shortTitle ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.shortTitle}
                                onChange={(e) => handleFieldValue("shortTitle", e.target.value)}
                                id="shortTitle"
                                placeholder={t("bibliography.references.placeholders.shortTitle", "Enter short title...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("url") && (
                        <ControlContainer title={t("bibliography.references.fields.url", "##URL##")} htmlFor="url" key="url" error={t(errors?.url ?? '')}>
                            <AppInput
                                type="url"
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.url}
                                onChange={(e) => handleFieldValue("url", e.target.value)}
                                id="url"
                                placeholder={t("bibliography.references.placeholders.url", "https://...")}
                            />
                        </ControlContainer>
                    )}

                    {showFields.includes("accessed") && (
                        <ControlContainer title={t("bibliography.references.fields.accessed", "##Accessed##")} htmlFor="accessed" key="accessed" error={t(errors?.accessed ?? '')}>
                            <AppInput
                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                value={fieldData.accessed}
                                onChange={(e) => handleFieldValue("accessed", e.target.value)}
                                id="accessed"
                                placeholder={t("bibliography.references.placeholders.accessed", "e.g. 2024-01-15")}
                            />
                        </ControlContainer>
                    )}
                </AddReferenceDialogContent>
                <AppDialogFooter className="sm:flex-row sm:justify-end gap-2">
                    <AppButton key="cancel" size="dialog-footer-xs" variant="secondary" onClick={onCancel}>{t('buttons.cancel')}</AppButton>
                    <AppButton key="save" size="dialog-footer-xs" variant="default" onClick={handleCreateReference} disabled={isDisabled || hasError}>
                        {t('buttons.save')}
                    </AppButton>
                </AppDialogFooter>
            </AppDialogContent>
        </AppDialog>
    )
}

const AddReferenceDialogContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col gap-3 max-h-[488px] overflow-y-auto p-4">
            {children}
        </div>
    )
})

interface ControlContainerProps {
    title: React.ReactNode,
    children: React.ReactNode,
    htmlFor: string,
    error?: string | null
}

const ControlContainer: React.FC<ControlContainerProps> = memo(({ title, children, htmlFor, error }) => {
    return (
        <div className="grid grid-cols-3 gap-6 align-middle">
            <AppLabel className="text-secondary-30 dark:text-secondary-foreground text-[13px] font-bold leading-[15px] px-2 flex items-center" htmlFor={htmlFor}>
                {title}
            </AppLabel>
            <div className="col-span-2 flex flex-col gap-1">
                {children}
                {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
        </div>
    )
});


type TagInputProps = {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    htmlFor?: string;
};

const TagInput: React.FC<TagInputProps> = ({
    value,
    onChange,
    placeholder = "",
    disabled = false,
    htmlFor = ''
}) => {
    const [inputValue, setInputValue] = useState("");

    const addTag = useCallback(
        (tag: string) => {
            const trimmed = tag.trim();
            if (trimmed && !value.includes(trimmed)) {
                onChange([...value, trimmed]);
            }
        },
        [onChange, value]
    );

    const removeTag = useCallback(
        (index: number) => {
            const newTags = [...value];
            newTags.splice(index, 1);
            onChange(newTags);
        },
        [onChange, value]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (inputValue) {
                addTag(inputValue);
                setInputValue("");
            }
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    return (
        <div
            className={`flex flex-wrap items-center gap-1 border rounded-xl px-3 py-2 min-h-[42px] bg-background focus-within:ring-2 focus-within:ring-ring transition-all ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {value.map((tag, idx) => (
                <AppButton
                    key={idx}
                    variant="secondary"
                    size="xs"
                    rounded="full"
                    className="border border-secondary-90 text-secondary-30 px-1 py-[2px] h-auto w-auto leading-none"
                    onClick={() => removeTag(idx)}
                    disabled={disabled}
                >
                    {tag}
                    <IconClose />
                </AppButton>
            ))}

            <AppInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm bg-transparent"
                disabled={disabled}
                id={htmlFor}
            />
        </div>
    );
}

export default CreateReference;