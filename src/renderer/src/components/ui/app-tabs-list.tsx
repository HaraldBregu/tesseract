import Comment from "../../components/icons/Comment";
import List from "@/components/icons/List";
import { memo } from "react";
import Button from "./button";
import Bookmark from "@/components/icons/Bookmark";

export interface AppTab {
    value: string;
    label: string;
}

interface AppTabsListProps {
    readonly tabs: AppTab[];
    readonly selectedTab: AppTab | null;
    readonly onTabChange?: (tab: AppTab) => void;
}

interface IconTabProps {
    readonly tabValue: string;
    readonly iconVariant: 'filled' | 'tonal';
    readonly size?: number;
}

// Mappa delle icone per migliorare la manutenibilità
const ICON_MAP = {
    comments: Comment,
    bookmarks: Bookmark,
    tableOfContents: List,
} as const;

// Componente separato per le icone (memoizzato per performance)
const IconTab = memo(({ tabValue, iconVariant, size = 20 }: IconTabProps) => {
    const IconComponent = ICON_MAP[tabValue as keyof typeof ICON_MAP];

    if (!IconComponent) {
        return null;
    }

    return (
        <IconComponent
            intent="secondary"
            variant={iconVariant}
            size={size}
        />
    );
});

IconTab.displayName = 'IconTab';

export function AppTabsList({
    tabs,
    selectedTab,
    onTabChange
}: AppTabsListProps) {

    function handleTabChange(tab: AppTab) {
        onTabChange?.(tab);
    }

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <div className="flex gap-5 w-full min-h-20 px-2">
            {tabs.map((tab) => {
                const buttonVariant = selectedTab?.value === tab.value ? "filled" : "icon";
                const iconVariant = selectedTab?.value === tab.value ? "filled" : "tonal";

                return (
                    <Button
                        key={tab.value}
                        className="flex-1"
                        intent="secondary"
                        variant={buttonVariant}
                        size="icon"
                        onClick={() => handleTabChange(tab)}
                    >
                        <IconTab
                            tabValue={tab.value}
                            iconVariant={iconVariant}
                        />
                    </Button>
                );
            })}
        </div>
    );
}
