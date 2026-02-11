import Check from "@/components/icons/Check";
import Delete from "@/components/icons/Delete";
import Pencil from "@/components/icons/Pencil";
import { InputTags } from "@/components/input-tags";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, useState } from "react";
import { OptionalMetadataItem } from "./metadata-components";
import AppButton from "@/components/app/app-button";

interface ICostumMetadata {
    other: AddOnMetadata,
    index: number,
    setTempMetadata: Dispatch<SetStateAction<Metadata>>
    tempMetadata: Metadata
}

const CustomMetadata = ({ other, index, setTempMetadata, tempMetadata }: ICostumMetadata) => {
    const [tags, setTags] = useState<string[]>(other.value as string[])
    const [isInEditMode, setIsInEditMode] = useState<boolean>(false);

    const handleEditMode = () => {
      const newTempMetadata = tempMetadata.others.map((item) => {
            if (item.name === other.name) {
                return { ...item, value: tags };
            }
            return item;
        });
        setTempMetadata((prev) => ({
            ...prev,
            others: newTempMetadata
        }));

        setIsInEditMode(false);
    };

    const onDelete = () => {
        const newTempMetadata = tempMetadata.others.filter(({ name }) => name.toLowerCase() !== other.name.toLowerCase());
        setTempMetadata({
            ...tempMetadata,
            others: [...newTempMetadata]
        })
    }

    return (
        <div>

            {
                other.type==='list' ?
                    (<div
                        className={`flex flex-row items-center min-h-[4rem] h-auto px-2`}
                        key={index}
                    >
                        <Label className="text-[15px] font-semibold w-1/4" > {other.name} </Label>
                        < div className="w-full px-4" >
                            <InputTags
                                value={tags}
                                onChange={(e) => setTags(e)}
                                placeholder="Enter values, comma separated..."
                                disabled={!isInEditMode}
                                chipVariant={"secondary"}
                                className="bg-transparent w-[89%] h-auto min-h-[2rem] flex"
                                inputClassName={`${!isInEditMode && 'hidden'}`}
                            />
                        </div>

                        {
                            isInEditMode ? (
                                <div className="flex flex-row items-center w-[1/4]" >
                                    <AppButton
                                    variant="transparent"
                                        size="icon"
                                        onClick={() => handleEditMode()}
                                    >
                                        <Check size={22} />
                                    </AppButton>
                                </div>
                            ) : (
                                <div className="flex flex-row items-center w-[1/4]" >
                                    <AppButton
                                    variant="transparent"
                                        size="icon"
                                        onClick={() => setIsInEditMode(true)
                                        }
                                    >
                                        <Pencil size={22} />
                                    </AppButton>
                                    <AppButton
                                        variant="transparent"
                                        size="icon"
                                        className="[&>svg]:fill-destructive-50"
                                        onClick={onDelete}
                                    >
                                        <Delete size={22} />
                                    </AppButton>
                                </div>
                            )}
                    </div>
                    ) : 
                    <OptionalMetadataItem
                        key={other.name}
                        title={other.name}
                        value={other.value as string}
                        type={other.type}
                        onChange={(value) => {
                            setTempMetadata({
                                ...tempMetadata,
                                others: tempMetadata.others.map((item) => {
                                    if (item.name === other.name && value) {
                                        return { ...item, value };
                                    }
                                    return item;
                                })
                            })
                        }}
                        onDelete={onDelete}
                    />
            }
        </div>

    )

}

export default CustomMetadata;