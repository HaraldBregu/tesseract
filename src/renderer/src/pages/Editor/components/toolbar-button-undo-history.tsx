import { ToolbarButtonTooltip } from "./toolbar-button-tooltip";
import { memo } from "react";
import {
    AppDropdownMenu,
    AppDropdownMenuTrigger,
    AppDropdownMenuContent,
    AppDropdownMenuLabel,
    AppDropdownMenuSeparator,
    AppDropdownMenuItem,
} from "@/components/app/app-dropdown-menu";
import { useTranslation } from "react-i18next";
import Undo from "@/components/icons/Undo";
import Dropdown from "@/components/icons/Dropdown";
import Button from "@/components/ui/button";

// Types
interface HistoryAction {
    id: string;
    type: string;
    timestamp: number;
    content: string;
    description: string;
}

interface ToolbarButtonUndoHistoryProps {
    title: string;
    tabIndex: number;
    history?: { recentActions: HistoryAction[] };
    canUndo: boolean;
    enabled: boolean;
    onUndo: (action: HistoryAction) => void;
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export const ToolbarButtonUndoHistory = memo(({
    title,
    history,
    tabIndex,
    canUndo,
    enabled,
    onUndo,
}: ToolbarButtonUndoHistoryProps) => {
    const { t } = useTranslation();
    const hasActions = history?.recentActions && history.recentActions.length > 0;
    const isDisabled = !enabled || !canUndo || !hasActions;

    return (
        <AppDropdownMenu>
            <ToolbarButtonTooltip tooltip={title}>
                <AppDropdownMenuTrigger asChild>
                    <Button
                        intent="secondary"
                        variant="outline"
                        size="mini"
                        aria-label="undo"
                        tabIndex={tabIndex}
                        className="border-none shadow-none gap-0 hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0 px-[0] py-[0]"
                        disabled={isDisabled}
                        leftIcon={<Undo inheritColor={true} intent='secondary' variant='tonal' size='small' />}
                        rightIcon={<Dropdown inheritColor={true} intent='secondary' variant='tonal' size='small' />}
                    />

                </AppDropdownMenuTrigger>
            </ToolbarButtonTooltip>
            <AppDropdownMenuContent className="w-64 !-top-6">
                <AppDropdownMenuLabel>
                    {t('editor.history')}
                </AppDropdownMenuLabel>
                <AppDropdownMenuSeparator />
                {hasActions ? (
                    history!.recentActions.map((action) => (
                        <AppDropdownMenuItem key={action.id} onClick={() => onUndo(action)}>
                            <div className="flex flex-col">
                                <span>{action.description}</span>
                                <span className="text-xs text-grey-60">{formatTime(action.timestamp)}</span>
                            </div>
                        </AppDropdownMenuItem>
                    ))
                ) : (
                    <div className="px-4 py-2 text-sm text-grey-60">{t('editor.noHistoryActions')}</div>
                )}
            </AppDropdownMenuContent>
        </AppDropdownMenu>
    );
});
