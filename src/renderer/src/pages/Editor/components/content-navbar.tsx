import AppButton from "@/components/app/app-button";
import {
    AppDropdownMenu,
    AppDropdownMenuContent,
    AppDropdownMenuItem,
    AppDropdownMenuSeparator,
    AppDropdownMenuTrigger,
} from "@/components/app/app-dropdown-menu";
import IconCheck from "@/components/app/icons/IconCheck";
import IconDragIndicator from "@/components/app/icons/IconDragIndicator";
import IconMore from "@/components/app/icons/IconMore";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { useTranslation } from "react-i18next";


type ContentNavBarProps = {
    disabledUpdateTableOfContents: boolean;
    disabledInsertBibliography: boolean;
    textNoteHighlighted: boolean;
    commentHighlighted: boolean;
    bookmarkHighlighted: boolean;
    onInsertBibliography: () => void;
    onUpdateTableOfContents: () => void;
    onToggleTextNoteHighlighted: () => void;
    onToggleCommentHighlighted: () => void;
    onToggleBookmarkHighlighted: () => void;
}

const ContentNavBar = ({
    disabledUpdateTableOfContents,
    disabledInsertBibliography,
    textNoteHighlighted,
    commentHighlighted,
    bookmarkHighlighted,
    onInsertBibliography,
    onUpdateTableOfContents,
    onToggleTextNoteHighlighted,
    onToggleCommentHighlighted,
    onToggleBookmarkHighlighted,
}: ContentNavBarProps) => {
    const { t } = useTranslation();
    return (
        <nav className={cn("sticky top-0 z-10 h-8 px-2 flex items-center justify-between dark:bg-grey-20")}>
            <AppButton
                variant="transparent"
                size="icon-xs">
                <IconDragIndicator />
            </AppButton>
            <span className="text-center text-xs font-medium">
                {t("menu.format.text.label")}
            </span>
            <div className="relative space-x-2">
                <AppDropdownMenu>
                    <AppDropdownMenuTrigger>
                        <AppButton
                            asChild
                            variant="transparent"
                            size="icon-xs">
                            <IconMore />
                        </AppButton>
                    </AppDropdownMenuTrigger>
                    <AppDropdownMenuContent align="end">
                        <AppDropdownMenuItem
                            onClick={onUpdateTableOfContents}
                            disabled={disabledUpdateTableOfContents}>
                            {t("textMenu.updateTableOfContents")}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuItem
                            onClick={onInsertBibliography}
                            disabled={disabledInsertBibliography}>
                            {t("textMenu.insertBibliography")}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuSeparator />
                        <AppDropdownMenuItem onClick={onToggleTextNoteHighlighted}>
                            <div className="w-4 h-4 flex items-center justify-center mr-2">{textNoteHighlighted ? <IconCheck /> : null}</div>
                            {t("textMenu.showNoteHighlights")}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuItem
                            onClick={onToggleCommentHighlighted}>
                            <div className="w-4 h-4 flex items-center justify-center mr-2"> {commentHighlighted ? <IconCheck /> : null}</div>
                            {t("textMenu.showCommentHighlights")}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuItem
                            onClick={onToggleBookmarkHighlighted}>
                            <div className="w-4 h-4 flex items-center justify-center mr-2">{bookmarkHighlighted ? <IconCheck /> : null}</div>
                            {t("textMenu.showBookmarksHighlights")}
                        </AppDropdownMenuItem>
                    </AppDropdownMenuContent>
                </AppDropdownMenu>
            </div>
        </nav>
    )
}

export default memo(ContentNavBar)