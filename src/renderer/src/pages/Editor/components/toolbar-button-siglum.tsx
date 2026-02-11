import AppButton from "@/components/app/app-button";
import IconSiglum from "@/components/app/icons/IconSiglum";
import List from "@/components/app/list";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { memo, useCallback } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import { cn } from "@/lib/utils";
import { AppDropdownMenu, AppDropdownMenuContent, AppDropdownMenuTrigger } from "@/components/app/app-dropdown-menu";


type ToolbarButtonSiglumProps = {
    title: string;
    list: Siglum[];
    disabled: boolean;
    onSetup?: () => void;
    onSelect?: (siglum: Siglum) => void;
}

export const ToolbarButtonSiglum = memo(({
    title,
    list,
    disabled,
    onSetup,
    onSelect,
}: ToolbarButtonSiglumProps) => {

    const getSiglumContent = useCallback((contentHtml: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const paragraph = tempDiv.querySelector('p');
        const inner = paragraph ? paragraph.innerHTML : '';
        return `<div style="height:60px;display:flex;align-items:center;">${inner}</div>`;
    }, []);

    return list.length === 0 ? (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant="toolbar"
                aria-label={title}
                size="icon"
                rounded="sm"
                onClick={onSetup}
                disabled={disabled}>
                <IconSiglum />
            </AppButton>
        </ToolbarButtonTooltip>
    ) : (
        <AppDropdownMenu modal={false}>
            <AppDropdownMenuTrigger
                disabled={disabled}
                className={cn(
                    "leading-none",
                    "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-10 dark:[&>svg]:hover:!bg-transparent",
                    "disabled:!bg-transparent hover:!bg-transparent dark:disabled:!bg-transparent dark:hover:!bg-transparent",
                )}>
                <ToolbarButtonTooltip
                    tooltip={title}
                    disabled={disabled}>
                    <AppButton
                        asChild
                        variant="toolbar"
                        size="icon"
                        rounded="sm"
                        disabled={disabled}>
                        <IconSiglum />
                    </AppButton>
                </ToolbarButtonTooltip>
            </AppDropdownMenuTrigger>
            <AppDropdownMenuContent className="min-w-40 max-h-[200px] overflow-y-auto">
                <List
                    data={list}
                    renderItem={(item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => onSelect?.(item)}>
                            <span dangerouslySetInnerHTML={{
                                __html: getSiglumContent(item.value.contentHtml)
                            }} />
                        </DropdownMenuItem>
                    )}
                />
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    )
})
