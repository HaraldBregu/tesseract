import Comment from "../../components/icons/Comment";
import List from "@/components/icons/List";
import { useEffect } from "react";
import Button from "./button";
import Bookmark from "@/components/icons/Bookmark";

export interface AppTab {
    value: string;
    label: string;
}

interface AppTabsListProps {
    tabs: AppTab[];
    selectedTab: AppTab | null;
    selectedIndex?: number;
    onTabChange?: (tab: AppTab) => void;
}

interface IconTabProps {
    tab: { value: string };
    iconVariant: string;
}

export function AppTabsList({ tabs, selectedTab, selectedIndex = 0, onTabChange }: AppTabsListProps) {

    function handleTabChange(tab: AppTab) {
        onTabChange?.(tab);
    }

    if (!tabs || tabs.length === 0) {
        return null;
    }

    if (!selectedIndex || selectedIndex >= tabs.length) {
        selectedIndex = 0;
    }

    useEffect(() => {
        onTabChange?.(tabs[selectedIndex]);
    }, []);

    const IconTab = ({ tab, iconVariant }: IconTabProps) => {
        if (tab?.value === "comments") {
            return <Comment intent='secondary' variant={iconVariant} size={20} />
        }
        if (tab?.value === "bookmarks") {
            return <Bookmark intent='secondary' variant={iconVariant} size={20} />
        }
        if (tab?.value === "tableOfContents") {
            return <List intent='secondary' variant={iconVariant} size={20} />
        }
        return null;
    }

    return (
        <>
            <div className="flex gap-5 w-full min-h-20 px-2">
                {tabs.map((tab) => {
                    const buttonVariant = selectedTab?.value === tab.value ? "filled" : "icon";
                    const iconVariant = selectedTab?.value === tab.value ? "filled" : "tonal";
                    return (
                        <Button
                            key={tab.value}
                            className="flex-1"
                            intent={"secondary"}
                            variant={buttonVariant}
                            size="icon"
                            onClick={() => handleTabChange(tab)}
                        >
                            <IconTab tab={tab} iconVariant={iconVariant} />
                        </Button>
                    )
                })}
            </div >
        </>
    )
}
