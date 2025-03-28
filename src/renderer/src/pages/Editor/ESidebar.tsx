import { AppTab, AppTabsList } from "@/components/ui/app-tabs-list";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import Bookmarks from "@/components/app-bookmarks";
import { useState } from "react";
import TableOfContents from "@/components/app-table-of-contents";
import Comments from "../Comments";

export function ESidebar({ ...props }) {

    const [tab, setTab] = useState<AppTab | null>(null);

    const tabs = [
        { value: "comments", label: "1" },
        { value: "bookmarks", label: "2" },
        { value: "tableOfContents", label: "3" },
    ]

    function handleTabChange(tab: AppTab) {
        setTab(tab);
    }

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <AppTabsList
                    tabs={tabs}
                    selectedTab={tab}
                    selectedIndex={2}
                    onTabChange={(tab) => handleTabChange(tab)}
                />
            </SidebarHeader>
            <SidebarContent>
                {tab?.value === "comments" && <Comments />}
                {tab?.value === "bookmarks" && <Bookmarks title="Bookmarks" items={[]} />}
                {tab?.value === "tableOfContents" && <TableOfContents />}
            </SidebarContent>
        </Sidebar>
    )
}