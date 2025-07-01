import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Button from "./ui/button";
import Pencil from "./icons/Pencil";
import Delete from "./icons/Delete";
import Check from "./icons/Check";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { PlusIcon } from "lucide-react";
import { InputTags } from "./input-tags";

interface IAdditionalMetadata {
  item: DocumentMetadata;
  handlEditAdditionalMetadata: (meta: DocumentMetadata) => void;
  handleDeleteMetadata: (id: number, type: Typology) => void;
  handleEditMetadata: (item: DocumentMetadata) => void
}

interface IAddMetadataButton {
  setIsCriterionOptionalMetadata: Dispatch<SetStateAction<boolean>>;
  setIsCustomOptionalMetadata: Dispatch<SetStateAction<boolean>>;
}

interface IMetadataItem {
  title: string;
  value: string;
}

const MetadataItem = ({ title, value }: IMetadataItem) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white"> {title} </h3>
      <p className="text-[15px] text-gray-600 dark:text-white"> {value} </p>
    </div>
  );
};

const AdditionalMetadata = ({
  item,
  handlEditAdditionalMetadata,
  handleDeleteMetadata,
}: IAdditionalMetadata) => {
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(item.value || "");
  const [tags, setTags] = useState<string[]>(item.tags || []);


    const handleEditMode = (valueType:string | undefined)=>{
      console.log(valueType)
      document.activeElement instanceof HTMLElement && document.activeElement.blur();
        setIsInEditMode(true)
    }

useEffect(() => {
  setTags(item.tags || []);
}, []);

console.log(item.typology)
  return (
    <div key={item.id} className="flex flex-row items-center min-h-[4rem] h-auto">
      <Label
        htmlFor={item.title}
        className="text-[15px] font-semibold w-1/4"
      >
        {item.title}
      </Label>
      <div className="w-full">
        {item.valueType === "list" ? (
          <div
            className={`flex flex-wrap flex-row gap-2 `}>
            {item.tags &&  (

               <InputTags
                    type={'text'}
                    value={tags}
                    onChange={(newTags) => setTags(newTags)}
                    disabled={!isInEditMode}
                    className=" bg-transparent w-[85%] min-w-[10rem] h-auto min-h-[2rem] flex ml-[0.8rem]"
                    inputClassName={`${!isInEditMode && 'hidden'} ml-2`}
                    chipClassName={`!content-center inline-flex items-center rounded-full bg-secondary-95 !text-blue-800 text-sm font-medium ${!isInEditMode && '[&_button]:hidden'}`}

                />
            )}
          </div>
        ) : (
          <Input
            type="text"
            id={item.title || ""}
            value={inputValue}
            disabled={!isInEditMode}
            onChange={(e) => setInputValue(e.target.value)}
            className="ms-[0.8rem] w-[85%] h-[32px] mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        )}
      </div>

      {isInEditMode ? (
        <div className="flex flex-row items-center w-[1/4]">
          <Button
            variant="icon"
            size="icon"
            onClick={() => {
              handlEditAdditionalMetadata({
                    value: inputValue || '',
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    valueType: item.valueType,
                    tags: tags || [],
                    optional: item.optional,
                    typology: item.typology,
                  });
              setIsInEditMode(false);
            }}
          >
            <Check size={22} />
          </Button>
        </div>
      ) : (
        <div className="flex flex-row items-center w-[1/4]">
          <Button
            variant="icon"
            size="icon"
            onClick={() => handleEditMode(item?.valueType)}
          >
            <Pencil size={22} />
          </Button>

          <Button
            variant="icon"
            size="icon"
            color="destructive"
            className="[&>svg]:fill-destructive-50"
            onClick={() => handleDeleteMetadata(item.id, item.typology)}
          >
            <Delete size={22} />
          </Button>
        </div>
      )}
       
      
    </div>
  );
};

const AddMetadataButton = ({
  setIsCriterionOptionalMetadata,
  setIsCustomOptionalMetadata,
}: IAddMetadataButton) => {
  const handleChooseOptionalMetadata = () => {
    setIsCustomOptionalMetadata(false);
    setIsCriterionOptionalMetadata(true);
  };

  const handleCreateCustomMetadata = () => {
    setIsCriterionOptionalMetadata(false);
    setIsCustomOptionalMetadata(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="tonal"
          className="
                        flex items-center justify-center rounded-md h-[1.8rem]"
          leftIcon={
            <PlusIcon className="h-4 w-4 rounded-full border border-black text-secondary-50" />
          }
        >
          <span className="text-[13px]">Add metadata</span>
        </Button>
      </DropdownMenuTrigger>
       <DropdownMenuContent
        // Classi per il menu a tendina
        className="
                    w-70
                    p-1
                    bg-white rounded-md shadow-lg border border-gray-200 
                    dark:bg-gray-800 dark:border-gray-700
                "
        side="top"
        align="start"
      >
        <DropdownMenuItem
          onClick={handleChooseOptionalMetadata}
          className="
                        px-2 py-1.5 
                        text-gray-900 text-sm 
                        cursor-pointer rounded-sm 
                        hover:bg-gray-100 focus:bg-gray-100 
                        dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700
                    "
        >
          Choose from Criterion optional metadata
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCreateCustomMetadata}
          className="
                        px-2 py-1.5
                        text-gray-900 text-sm
                        cursor-pointer rounded-sm
                        hover:bg-gray-100 focus:bg-gray-100
                        dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700
                    "
        >
          Create custom metadata
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};



export default AdditionalMetadata;
export { AddMetadataButton, MetadataItem };
