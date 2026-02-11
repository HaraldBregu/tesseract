import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dispatch, SetStateAction } from "react"
interface IPaperSize {
    label: string
    setPaperSizeData: Dispatch<SetStateAction<string>>
    paperSizeData: string
    placeholder?: string
    standardPageDimensions: StandardPageDimension[]
    setOpenCustomWidthHeight: Dispatch<SetStateAction<boolean>>
    setPaperSizeDataCustom: Dispatch<SetStateAction<{
        name: string;
        height: number;
        width: number;
    }>>

}

const PaperSize = ({
    label,
    setPaperSizeData,
    paperSizeData,
    placeholder,
    standardPageDimensions,
    setOpenCustomWidthHeight,
    setPaperSizeDataCustom,
}: IPaperSize) => {

    return (
        <div className="w-full">
            <Label className="font-600 text-[13px] leading-[15px] text-gray-900 dark:text-gray-100">{label}</Label>
            <Select onValueChange={(e) => {
                setPaperSizeDataCustom({ name: '', height: 0, width: 0 });
                if (e === 'custom') { setOpenCustomWidthHeight(true) }
                setPaperSizeData(e)
            }
            }
                defaultValue={paperSizeData}>
                <SelectTrigger className='w-full bg-grey-95 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'>
                    <SelectValue placeholder={placeholder}> {paperSizeData}</SelectValue>
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    {standardPageDimensions.map(({ name, width, height }) => (
                        <SelectItem key={name} value={name} className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                            {name} {name !== 'custom' && `${width} x ${height}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export default PaperSize