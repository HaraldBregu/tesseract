import AppButton from "@/components/app/app-button";
import IconPlusSimple from "@/components/app/icons/IconPlusSimple";
import { memo } from "react";

type AnnotationHeaderProps = {
    title: string;
    onAddCategory: () => void;
}

const AnnotationHeader = ({
    title,
    onAddCategory,
    ...props
}: AnnotationHeaderProps) => {

    return (
        <div className="flex justify-between items-center p-2 sticky top-0 z-10" {...props}>
            <h4 className="text-xs font-medium">
                {title}
            </h4>
            <AppButton
                variant="transparent"
                size="icon-xs"
                onClick={onAddCategory}>
                <IconPlusSimple />
            </AppButton>
        </div>
    )
}

export default memo(AnnotationHeader)