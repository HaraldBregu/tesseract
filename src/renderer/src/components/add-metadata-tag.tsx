import React from "react";
import { InputTags } from "./input-tags";

interface IAddMetadataTagProps {
    inputValue: string[];
    setInputValue: React.Dispatch<React.SetStateAction<string[]>>;

}



const AddMetadataTag: React.FC<IAddMetadataTagProps> = ({
    inputValue,
    setInputValue,
}) => {
    return (
        <div className="flex flex-nowrap flex-row gap-2 w-full">

            <InputTags
                value={inputValue}
                onChange={setInputValue}
                placeholder="Enter values, comma separated..."
                className="w-full flex flex-row flex-wrap"
                inputClassName="mt-1 min-h-[1rem] w-full min-w-[10rem] border !rounded-r-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1"
                chipClassName="!content-center inline-flex items-center rounded-full bg-secondary-95 !text-blue-800 text-sm font-medium"
        />
        </div>
    )
}

export default AddMetadataTag;