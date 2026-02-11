import AppButton from "@/components/app/app-button"
import { AppDropdownMenu, AppDropdownMenuTrigger, AppDropdownMenuContent, AppDropdownMenuItem } from "@/components/app/app-dropdown-menu"
import Check from "@/components/icons/Check"
import Delete from "@/components/icons/Delete"
import Pencil from "@/components/icons/Pencil"
import { InputTags } from "@/components/input-tags"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, PlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

interface OptionalMetadataItemProps {
    title: string
    value: string
    onChange: (value: string) => void
    onDelete: () => void
    isCustom?: boolean
    type: string
}

export const OptionalMetadataItem = ({
    title,
    value,
    onChange,
    onDelete,
    type

}: OptionalMetadataItemProps) => {
    const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
    
    return (
        <div
            className="flex flex-row items-center min-h-[4rem] h-auto px-2">
            <Label
                htmlFor={"input_value"}
                className="text-[15px] font-semibold w-1/4"
            >
                {title}
            </Label>
            <div className="w-full">
                <Input
                    type={type}
                    id={"input_value"}
                    value={value || ''}
                    disabled={!isInEditMode}
                    onChange={(e) => onChange(e.target.value)}
                    className="bg-white dark:bg-gray-900 ms-[0.8rem] w-[85%] h-[32px] mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>

            {isInEditMode ? (
                <div className="flex flex-row items-center w-[1/4]">
                    <AppButton
                        variant="transparent"
                        size="icon"
                        onClick={() => {
                            setIsInEditMode(false);
                        }}
                    >
                        <Check size={22} />
                    </AppButton>
                </div>
            ) : (
                <div className="flex flex-row items-center w-[1/4]">
                    <AppButton
                        variant="transparent"
                        size="icon"
                        onClick={() => setIsInEditMode(true)}
                    >
                        <Pencil size={22} />
                    </AppButton>
                    <AppButton
                        variant="transparent"
                        size="icon"
                        color="destructive"
                        className="[&>svg]:fill-destructive-50"
                        onClick={onDelete}
                    >
                        <Delete size={22} />
                    </AppButton>
                </div>
            )}
        </div>
    );
};

interface AddOnMetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (metadata: AddOnMetadata) => void;
}

export const CustomMetadataModal = ({
    isOpen,
    onClose,
    onCreate,
}: AddOnMetadataModalProps) => {
    const { t } = useTranslation();
    const [addOnMetadata, setAddOnMetadata] = useState<AddOnMetadata>({
        name: '',
        value: '',
        type: 'text'
    });

    const [valueType, setValueType] = useState<ListValueType>('text');

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddOnMetadata((prev) => ({
            ...prev,
            type: valueType,
            name: value,
        }));
    }

    const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddOnMetadata((prev) => ({
            ...prev,
            type: valueType,
            value: value,
        }));
    }

    const handleChangeNumberValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddOnMetadata((prev) => ({
            ...prev,
            type: valueType,
            value: value,
        }));
    }

    const handleOnCreate = () => {
        if (addOnMetadata.name.trim() === '') return
        onCreate(addOnMetadata)
        onClose()
    }

    const [values, setValues] = useState<string[]>([]);

    useEffect(() => {
        setAddOnMetadata((prev) => ({
            ...prev,
            type: valueType,
            value: values,
        }));
    }, [valueType, values])


    useEffect(() => {
        setAddOnMetadata({
            name: '',
            value: '',
            type: 'text'
        })
        setValueType('text');
    }, [isOpen])


    return (
        <Dialog
            open={isOpen}
            modal={false}
        >
            <DialogContent className="bg-grey-95 dark:bg-grey-10 max-w-[880px] max-h-[80%] overflow-y-auto flex flex-col !m-2 !p-0 [&>button]:hidden">
                <DialogHeader className={"border-b border-grey-80 dark:border-grey-50 p-3 max-h-12"}>
                    <div className='flex flex-row justify-start gap-4 items-center'>
                        <AppButton
                            variant="transparent"
                            size="icon"
                            onClick={onClose}>
                            <ArrowLeft className="h-[1.5rem] w-[1.5rem] text-grey-40" />
                        </AppButton>
                        <DialogTitle className={" text-center text-[14px] font-[700]"}>
                            {t("metadata.newMetadata")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className='p-4'>
                    <div className="px-4 space-y-6 flex-1 overflow-y-auto pb-[3rem]">
                        {/* Detail name */}
                        <div>
                            <Label htmlFor="detailName" className="text-sm font-medium">
                                {t("metadata.detailName")}
                            </Label>
                            <Input
                                required={true}
                                id="detailName"
                                type="text"
                                value={addOnMetadata?.name || ''}
                                onChange={handleChangeName}
                                placeholder="Color"
                                className="mt-1 block w-full"
                            />
                        </div>

                        {/* Value Field */}
                        <div>
                            <Label htmlFor="value" className="text-sm font-medium">
                                {t("metadata.valueCustom")}
                            </Label>
                            <div className="flex items-center mt-1 h-[3rem]">
                                <Select
                                    onValueChange={(value: ListValueType) => setValueType(value)}
                                    value={valueType}
                                    defaultValue="text">
                                    <SelectTrigger className="w-[7rem] h-full text-[13px] font-600 text-white px-2 py-3 flex-shrink-0 rounded-r-none border-3 bg-primary focus:ring-0 focus:ring-offset-0">
                                        <SelectValue> {valueType === 'text' ? `${t("metadata.itemText")}` : valueType.charAt(0).toUpperCase() + valueType.slice(1)} </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="list">{t("metadata.itemList")}</SelectItem>
                                        <SelectItem value="text">{t("metadata.itemText")}</SelectItem>
                                        <SelectItem value="number">{t("metadata.itemNumber")}</SelectItem>
                                        <SelectItem value="date">{t("metadata.itemDate")}</SelectItem>
                                    </SelectContent>
                                </Select>

                                {valueType === 'list' ? (
                                    <div className="flex flex-nowrap flex-row gap-2 w-full h-full">
                                        <InputTags
                                            value={values}
                                            onChange={(values) => {
                                                setValues(values)
                                            }}
                                            placeholder={t("metadata.placeholderCustom")}
                                            className="w-full flex flex-row flex-wrap rounded-l-none"
                                            inputClassName="mt-1 min-h-[1rem] w-full min-w-[10rem] border-0 !rounded-r-md sm:text-sm flex-1 h-full rounded-l-none "
                                            chipVariant={"secondary"}
                                        />
                                    </div>

                                ) : valueType === 'text' ? (
                                    <Input
                                        type="text"
                                        value={addOnMetadata.value as string}
                                        onChange={handleChangeValue}
                                        placeholder={t("metadata.placeholderText")}
                                        className="flex-grow rounded-l-none h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                ) : valueType === 'number' ? (
                                    <Input
                                        type="number"
                                        value={addOnMetadata.value as number}
                                        onChange={handleChangeNumberValue}
                                        placeholder={t("metadata.placeholderNumber")}
                                        className="flex-grow rounded-l-none h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                ) : valueType === 'date' ? (
                                    <Input
                                        type="date"
                                        value={addOnMetadata.value as string}
                                        onChange={handleChangeValue}
                                        placeholder={t("metadata.placeholderDate")}
                                        className="flex-grow rounded-l-none h-full"
                                    />
                                ) : null}
                            </div>

                            <p className="text-xs mt-2 h-2">
                                {valueType === 'list' && <><sup>*</sup>{t("metadata.exampleList")}</>}
                            </p>

                        </div>
                    </div>
                </div>

                <DialogFooter className={"border-t p-3  max-h-16"}>
                    <AppButton
                        size="xs"
                        shadow="none"
                        className="w-24"
                        variant="secondary"
                        onClick={onClose}
                    >
                        {t("buttons.cancel")}
                    </AppButton>
                    <AppButton
                        size="xs"
                        shadow="none"
                        className="w-24"
                        onClick={handleOnCreate}
                        variant={"default"}
                    >
                        {t('buttons.insert')}
                    </AppButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

type NewMetadataButtonProps = {
    className?: string;
    onSetOptional: (value: boolean) => void;
    onSetCustom: (value: boolean) => void;
}

export const AddMetadataButton = ({
    className,
    onSetOptional,
    onSetCustom,
}: NewMetadataButtonProps) => {
    const { t } = useTranslation();

    return (
        <div className={className}>
            <AppDropdownMenu modal={false}>
                <AppDropdownMenuTrigger>
                    <div
                        className="bg-background gap-2 px-2 shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 flex items-center justify-center rounded-md h-[1.8rem] border border-secondary "
                    >
                        <PlusIcon className="h-4 w-4 rounded-full border border-black text-secondary-50" />
                        <span className="text-[13px]">
                            {t("metadata.buttons.addMetadata")}</span>
                    </div>
                </AppDropdownMenuTrigger>
                <AppDropdownMenuContent
                    className="w-70 p-1 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    side="top"
                    align="start"
                >
                    <AppDropdownMenuItem
                        onClick={() => onSetOptional(true)}
                        className="px-2 py-1.5 text-gray-900 text-sm cursor-pointer rounded-sm hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    >
                        {t("metadata.buttons.optionalMetadata")}
                    </AppDropdownMenuItem>
                    <AppDropdownMenuItem
                        onClick={() => onSetCustom(true)}
                        className="px-2 py-1.5 text-gray-900 text-sm cursor-pointer rounded-sm hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    >
                        {t("metadata.buttons.customMetadata")}
                    </AppDropdownMenuItem>
                </AppDropdownMenuContent>
            </AppDropdownMenu>
        </div>
    );
};


