import AppButton from "@/components/app/app-button";
import IconLink from "@/components/app/icons/IconLink";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { memo } from "react";
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import IconLinkAdd from "@/components/app/icons/IconLinkAdd";

type ToolbarButtonLinkProps = {
    linkTitle: string;
    editLinkLabel: string;
    removeLinkLabel: string;
    disabled: boolean;
    active: boolean;
    showAddLink?: () => void;
    removeLink?: () => void;
}

export const ToolbarButtonLink = memo(({
    linkTitle,
    editLinkLabel,
    removeLinkLabel,
    disabled,
    active,
    removeLink,
    showAddLink
}: ToolbarButtonLinkProps) => {
    return !active ? (
        <ToolbarButtonTooltip tooltip={linkTitle} disabled={disabled}>
            <AppButton
                asChild
                variant="toolbar"
                size="icon"
                rounded="sm"
                onClick={showAddLink}
                aria-label={linkTitle}
                aria-disabled={disabled}
                disabled={disabled}
            >
                <IconLinkAdd />
            </AppButton>
        </ToolbarButtonTooltip>
    ) : (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <ToolbarButtonTooltip tooltip={linkTitle} aria-disabled={disabled} disabled={disabled}>
                    <AppButton
                        asChild
                        variant="toolbar-selected"
                        size="icon"
                        rounded="sm"
                        aria-label={linkTitle}
                    >
                        <IconLink />
                    </AppButton>
                </ToolbarButtonTooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 max-h-[200px] overflow-y-auto">
                <DropdownMenuItem
                    onClick={showAddLink}
                >
                    {editLinkLabel}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={removeLink}>
                    {removeLinkLabel}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
})
