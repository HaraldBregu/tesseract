import AppLabel from "@/components/app/app-label"
import { Checkbox } from "@/components/ui/checkbox"
import { memo } from "react"


interface MetadataOptionalCheckboxProps {
    label: string,
    description: string,
    checked: boolean,
    onChange: (checked: boolean) => void
}

const MetadataOptionalCheckbox = ({
    label,
    description,
    checked,
    onChange
  }: MetadataOptionalCheckboxProps) => {
  
    return (
      <div
        className="flex flex-row items-center">
        <div className="w-[5%] flex-none">
          <Checkbox
            id={label}
            checked={checked}
            onCheckedChange={onChange}
            className='w-[24px] h-[24px] border-grey-50 border-2'
          />
        </div>
        <AppLabel
          htmlFor={label}
          className="w-[30%] flex-none text-[13px] font-[600] cursor-pointer"
        >
          {label}
        </AppLabel>
        <AppLabel
          htmlFor={label}
          className="flex-1 text-[13px] w-[65%] cursor-pointer"
        >
          {description}
        </AppLabel>
      </div>
    )
  }

  export default memo(MetadataOptionalCheckbox);