import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
}
    from '@/components/ui/select';
import {
    ArrowLeft,
} from 'lucide-react';
import Button from './ui/button';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { v4 as uuidv4 } from 'uuid';
import { SelectValue } from '@radix-ui/react-select';
import AddMetadataTag from './add-metadata-tag';


interface IInitialValues {
    detailName: string,
    valueType: ListValueType,
    tags: string[],
}

interface NewMetadataModalContentProps {
    isOpen: boolean;
    onClose: () => void;
    handleCreateNewMetadata: (newKeyword:any) => void
    initialValues?: IInitialValues
    setTags: Dispatch<SetStateAction<string[]>>
    tags: string[]
}


const NewMetadataModalContent: React.FC<NewMetadataModalContentProps> = ({ isOpen, onClose, handleCreateNewMetadata, initialValues, setTags, tags }) => {

    const [detailName, setDetailName] = useState<string>('');
    const [valueType, setValueType] = useState<ListValueType>('text');
    const [inputValue, setInputValue] = useState<string>('');
    const { t } = useTranslation();

    useEffect(() => {
        if(initialValues){
            setDetailName(initialValues.detailName)
            setValueType(initialValues.valueType)
            setTags(initialValues.tags)
        }
    }, []);

    const resetFormAndClose = ()=>{
        setDetailName('');
        setValueType('text');
        setInputValue('');
        setTags([]);
        onClose();
    }

    return (

        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="bg-grey-95 dark:bg-grey-10 max-w-[880px] max-h-[80%] overflow-y-auto flex flex-col !m-2 !p-0 [&>button]:hidden">

                <DialogHeader className={"border-b border-grey-80 dark:border-grey-50 p-3 max-h-12 p-3 max-h-12"}>
                    <div className='flex flex-row justify-start gap-4 items-center'>
                        <Button
                            variant="icon"
                            size="icon"
                            onClick={() => resetFormAndClose()}
                        >
                            <ArrowLeft className="h-[1.5rem] w-[1.5rem] text-grey-40" />
                        </Button>
                        <DialogTitle className={" text-center text-[14px] font-[700]"}>
                            New Metadata
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className='p-4'>



                    <div className="px-4 space-y-6 flex-1 overflow-y-auto pb-[3rem]">
                        {/* Detail name */}
                        <div>
                            <Label htmlFor="detailName" className="text-sm font-medium">
                                Detail name
                            </Label>
                            <Input
                                id="detailName"
                                type="text"
                                value={detailName}
                                onChange={(e) => setDetailName(e.target.value)}
                                placeholder="Color"
                                className="mt-1 block w-full"
                            />
                        </div>

                        {/* Value Field */}
                        <div>
                            <Label htmlFor="value" className="text-sm font-medium">
                                Value
                            </Label>
                            <div className="flex items-center mt-1">
                                <Select onValueChange={(value: ListValueType) => setValueType(value)} value={valueType}>
                                    <SelectTrigger className="w-[6rem] h-auto text-[13px] font-600 text-white px-2 py-3 flex-shrink-0 rounded-r-none border-r-0 bg-primary">
                                    <SelectValue> {valueType.charAt(0).toUpperCase() + valueType.slice(1)} </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="list">List</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="date">Date</SelectItem>
                                    </SelectContent>
                                </Select>

                                {valueType === 'list' ? (
                                    <AddMetadataTag
                                        inputValue={tags}
                                        setInputValue={setTags}
                                    />
                                ) : (
                                    <Input
                                        type={valueType === 'number' ? 'number' : 'text'}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={`Ex. ${valueType === 'text' ? 'text value' : valueType === 'number' ? '123' : '2023-01-01'}`}
                                        className="flex-grow rounded-l-none"
                                    />
                                )}
                            </div>
                            {valueType === 'list' && (
                                <p className="text-xs mt-2"><sup>*</sup>Ex. red, yellow, blue</p>
                            )}
                        </div>
                    </div>

                </div>

                <DialogFooter className={"border-t p-3  max-h-16"}>
                    <Button
                        key="export-style"
                        className="w-24"
                        size="mini"
                        intent="primary"
                        variant="tonal"
                        onClick={() => resetFormAndClose()}
                    >
                        {t("buttons.cancel")}
                    </Button>
                    <Button
                        key="done"
                        className="w-24"
                        size="mini"
                        intent="primary"
                        onClick={()=>{
                            handleCreateNewMetadata({id: uuidv4(), title: detailName, valueType:valueType, description: inputValue, typology: 'custom',  ...(valueType === 'list' ? { tags: tags } : {value: inputValue})
                            });
                            resetFormAndClose()
    }}
>
    insert
</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewMetadataModalContent;