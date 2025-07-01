import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import AddMetadataModalContent from "./criterion-optional-metadata";
import NewMetadataModalContent from "./new-metadata-modal-content";
import { useTranslation } from "react-i18next";
import Divider from "./ui/divider";
import AdditionalMetadata, { AddMetadataButton } from "./metadata-components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { InputTags } from "./input-tags";

export interface IFormData {
    metadata: DocumentMetadata[]
    keywords: string[];
}

type IStatusState = 'Draft' | 'B' | 'C';

interface IMetadataForm {
    keywords: string[];
    setKeywords: Dispatch<SetStateAction<string[]>>;
    setMetadataFields: Dispatch<SetStateAction<DocumentMetadata[]>>;
    metadataFields: DocumentMetadata[];
    setIsCriterionOptionalMetadata: Dispatch<SetStateAction<boolean>>;
    isCriterionOptionalMetadata: boolean;
    handleCreateNewMetadata: (newKeyword: any) => void;
    customMetadataField: DocumentMetadata[],
    setIsCustomOptionalMetadata: Dispatch<SetStateAction<boolean>>
    isCustomOptionalMetadata: boolean
    setCustomMetadataField: Dispatch<SetStateAction<DocumentMetadata[]>>
    title: string;
    setTitle: (title: string) => void;
    subject: string;
    setSubject: (subject: string) => void;
    author: string;
    setAuthor: (author: string) => void;
    copyrightHolder: string;
    setCopyrightHolder: (copyrightHolder: string) => void;
    language: string
    setLanguage: Dispatch<SetStateAction<string>>
    version:string
    setVersion:Dispatch<SetStateAction<string>>
    setTemporaryOptionalMetadata: Dispatch<SetStateAction<DocumentMetadata[]>>
    temporaryOptionalMetadata:DocumentMetadata[]
    createdDate: string
    updatedDate: string
    name:string
}

const MetadataForm = ({
    keywords,
    setKeywords,
    setMetadataFields,
    metadataFields,
    setIsCriterionOptionalMetadata,
    isCriterionOptionalMetadata,
    handleCreateNewMetadata,
    customMetadataField,
    setIsCustomOptionalMetadata,
    isCustomOptionalMetadata,
    setCustomMetadataField,
    title,
    setTitle,
    subject,
    setSubject,
    author,
    copyrightHolder,
    setAuthor,
    setCopyrightHolder,
    version,
    setVersion,
    language,
    setLanguage,
    setTemporaryOptionalMetadata,
    temporaryOptionalMetadata,
    createdDate,
    updatedDate,
    name
}: IMetadataForm) => {

    const { t } = useTranslation();
    const [status, setStatus] = useState<IStatusState>('Draft');
    const [tags, setTags] = useState<string[]>([]);

    const handlEditAdditionalMetadata = (item: DocumentMetadata)=>{
        if(item.typology==='fixed'){
             setMetadataFields((prevData) => {
            return prevData.map((meta) => {
               
                if (meta.id === item.id) {
                    return { ...item , isChecked:true};
                }
                return {...meta};
            });
        });
        }else{
            setCustomMetadataField((prev)=>{
                return prev.map((elem)=>{
                   if(elem.id===item.id){
                    return {...item}
                }
                return{...elem} 
                })  
            })
        }

           
    }


    const handleDeleteMetadata = (id:number, type:Typology) =>{
        if(type==='custom'){
            setCustomMetadataField((prev)=>prev.filter((item)=>id!==item.id))
        }else{
            setMetadataFields((prev)=>{
               return prev.map((el)=>{
                    if(el.id===id){
                         return {...el, isChecked:false}
                    }
                    return {...el}
                })
            })
        }
    }

    //Add metadata checked in criterion-optional-metadata 
    const handleAddMetadata = () => {
        setMetadataFields(temporaryOptionalMetadata);
        setIsCriterionOptionalMetadata(false);
    };


    
        const handleEditMetadata = (item: DocumentMetadata) => {
        setCustomMetadataField((prev)=>{
            return prev.map((elem)=>{
                if(elem.id===item.id){
                    return {...item}
                }
                return elem
            })
        })
    }

    useEffect(()=>{
        setTemporaryOptionalMetadata(metadataFields)
    },[metadataFields])

    return (
        <div className="pl-2 space-y-2 overflow-y-auto">
            <div className="flex flex-col w-full gap-2 p-2">
                {/* Fixed text fields */}
                <div className="flex flex-row items-center justify-between w-full">
                    <h3 className="text-[15px] font-semibold mb-1 w-1/4">{t("metadata.license")}</h3>
                    <p className="w-full self-start text-[15px]">-</p>
                </div>

                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-[15px] font-semibold mb-1 w-1/4 ">Creation date</h3>
                    <p className="self-start w-full text-[15px]">{createdDate || '-'}</p>
                </div>

                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-[15px] font-semibold mb-1 w-1/4">Last saved date</h3>
                    <p className="w-full self-start text-[15px]">{updatedDate || ''}</p>
                </div>

                {/* Title */}
                <div className="flex flex-row items-center justify-between w-full">
                    <Label htmlFor="title" className="text-[15px] font-semibold flex-1">
                        Title
                    </Label>
                    <Input
                            type="text"
                            id={'title'}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 h-[32px] w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1 min-w-[80%]"
                    />
                </div>

                {/* Subject */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="subject" className="text-[15px] font-semibold flex-1">
                        Subject
                    </Label>
                    <Textarea
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 block w-full h-[96px] border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 flex-1 focus:border-blue-500 sm:text-sm resize-y min-w-[80%]"
                    />
                    
                </div>

                {/* Author */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="author" className="text-[15px] font-semibold flex-1">
                        Author
                    </Label>
                      <Input
                            type="text"
                            id={'author'}
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="mt-1 h-[32px] w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1 min-w-[80%]"
                        />
                </div>

                {/* Copyright Holder */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="copyrightHolder" className="text-[15px] font-semibold flex-1">
                        Copyright Holder
                    </Label>
                        <Input
                            type="text"
                            id={'copyrightHolder'}
                            value={copyrightHolder}
                            onChange={(e) => setCopyrightHolder(e.target.value)}
                            className="mt-1 h-[32px] w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1 min-w-[80%]"
                        />
                </div>

                {/* Keywords */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="keywords" className="w-1/4 text-[15px] font-semibold flex-1">
                        Keywords
                    </Label>
                    <div className="flex flex-wrap gap-2 w-4/5">
                             <InputTags
                                    value={keywords}
                                    onChange={(newKeywords) => setKeywords(newKeywords)}
                                    className="w-full flex flex-row flex-nowrap"
                                    inputClassName=" h-auto min-h-[2rem] flex m-0"
                                    chipClassName="!content-center inline-flex items-center rounded-full bg-secondary-95 !text-blue-800 text-sm font-medium"
                                />

                    </div>
                </div>

                {/* Status */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="status" className="text-[15px] font-semibold w-1/4">
                        Status
                    </Label>
                      <Select onValueChange={(value: IStatusState) => setStatus(value)} value={status}>
                                    <SelectTrigger className="text-[13px] font-600 rounded-sm">
                                    <SelectValue> {status} </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                    
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                    </SelectContent>
                                </Select>


                </div>

                {/* Template */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="template" className="text-[15px] font-semibold w-1/4">
                        Template
                    </Label>
                        <div className="w-full">
                            <Input
                                type="text"
                                id={'template'}
                                value={name}
                                disabled={true}
                                className="w-1/2 h-[32px] mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                </div>

                {/* Language */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="language" className="text-[15px] font-semibold w-1/4">
                        Language
                    </Label>
                        <div className="w-full">
                            <Input
                                type="text"
                                id={'language'}
                                value={language}
                                onChange={(e)=>setLanguage(e.target.value)}
                                className="w-1/2 h-[32px] mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                </div>

                {/* Version */}
                <div className="flex flex-row items-center justify-between">
                    <Label htmlFor="version" className="text-[15px] font-semibold w-1/4">
                        Version
                    </Label>
                       <div className="w-full">
                            <Input
                                type="text"
                                id={'version'}
                                value={version}
                                onChange={(e)=>setVersion(e.target.value)}
                                className="w-1/2 h-[32px] mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                </div>
            </div>
            <Divider orientation="horizontal" className="bg-grey-80" />
            <div className="pl-2 space-y-2 flex flex-col">
                {metadataFields.filter((field) => field.isChecked).map((item) => (
                    <AdditionalMetadata handleEditMetadata={handleEditMetadata} key={item.id} item={item} handlEditAdditionalMetadata={handlEditAdditionalMetadata} handleDeleteMetadata={handleDeleteMetadata} />
                ))}
            </div>
            <div className="pl-2 space-y-2 flex flex-col">
                {customMetadataField.map((item) => (
                    <AdditionalMetadata handleEditMetadata={handleEditMetadata} key={item.id} item={item} handlEditAdditionalMetadata={handlEditAdditionalMetadata} handleDeleteMetadata={handleDeleteMetadata} />
                ))}
            </div>
            
            <div className="py-6 mb-4">
                <AddMetadataButton setIsCustomOptionalMetadata={setIsCustomOptionalMetadata} setIsCriterionOptionalMetadata={setIsCriterionOptionalMetadata} />
            </div>

            <AddMetadataModalContent
                handleAddMetadata={handleAddMetadata}
                isOpen={isCriterionOptionalMetadata}
                onClose={() => setIsCriterionOptionalMetadata(false)}
                setTemporaryOptionalMetadata={setTemporaryOptionalMetadata}
                temporaryOptionalMetadata={temporaryOptionalMetadata}
            />
            <NewMetadataModalContent
                tags={tags}
                setTags={setTags}
                handleCreateNewMetadata={handleCreateNewMetadata}
                isOpen={isCustomOptionalMetadata}
                onClose={() => setIsCustomOptionalMetadata(false)}
            />
        </div>
    );
};
export { MetadataForm as default };