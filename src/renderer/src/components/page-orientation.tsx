import { CheckIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Label } from "./ui/label";
import Typography from "./Typography";
import { StandardPageDimensionsState } from "@/pages/editor/store/layout/layout.state";

interface IPageOrientation {
    label: string
    selectedOrientation: string
    setSelectedOrientation: Dispatch<SetStateAction<"horizontal" | "vertical">>
    standardPageDimensions: StandardPageDimensionsState[]
    paperSizeData: string
    paperSizeDataCustom: {
        name: string;
        height: number;
        width: number;
    }
}

const PageOrientation = ({ label, selectedOrientation, setSelectedOrientation, standardPageDimensions, paperSizeData, paperSizeDataCustom }: IPageOrientation) => {

    const handleSelectOrientation = (e: React.MouseEvent<HTMLDivElement>) => {
        const clickedElement = e.target as HTMLDivElement;
        setSelectedOrientation(clickedElement.id as "horizontal" | "vertical")
    };

    const findWeightXHeigth = (paperSizeDataCustom && paperSizeDataCustom.name === 'custom') ? paperSizeDataCustom : standardPageDimensions.find(({ name }) => (name === paperSizeData));

    return (
        <div className="flex flex-col gap-2">
            <Label className="font-400 text-[13px] leading-[15px] dark:text-grey-95">{label}</Label>
            <div className="flex flex-row w-full h-full gap-2">
                <div
                    id='vertical'
                    className={`${selectedOrientation === 'vertical'
                        ? 'border-primary border-2 dark:border-primary-80'
                        : 'border-grey-100 border dark:border-grey-70'
                        } flex w-[4rem] h-[5.5rem] justify-end items-end bg-white dark:bg-grey-20 hover:bg-grey-95 dark:hover:bg-grey-30 cursor-pointer transition-colors`}
                    onClick={(e) => handleSelectOrientation(e)}
                >
                    {selectedOrientation === 'vertical' && <CheckIcon className="p-1 text-primary dark:text-primary-80" />}
                </div>
                <div
                    id='horizontal'
                    className={`${selectedOrientation === 'horizontal'
                        ? 'border-primary border-2 dark:border-primary-80'
                        : 'border-grey-100 border dark:border-grey-70'
                        } flex w-[5.5rem] h-[3.5rem] self-end justify-end items-end bg-white dark:bg-grey-20 hover:bg-grey-95 dark:hover:bg-grey-30 cursor-pointer transition-colors`}
                    onClick={(e) => handleSelectOrientation(e)}
                >
                    {selectedOrientation === 'horizontal' && <CheckIcon className="p-1 text-primary dark:text-primary-80" />}
                </div>
            </div>
            {findWeightXHeigth && <Typography component="span" className="text-[13px] dark:text-grey-95">
                {selectedOrientation === "horizontal"
                    ? `${findWeightXHeigth.width} x ${findWeightXHeigth.height}`
                    : `${findWeightXHeigth.height} x ${findWeightXHeigth.width}`} cm
            </Typography>}
        </div>
    )
};

export default PageOrientation