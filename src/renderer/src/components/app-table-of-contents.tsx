// import { ChartAreaInteractive } from "./chart-area-interactive";
// import { DataTable } from "./data-table";
// import { SectionCards } from "./section-cards";
// import { SiteHeader } from "./site-header";
// import { TreeItem, TreeView } from "./TreeView";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { TreeDataItem, TreeView } from "./tree-view";
import { useEffect } from "react";

const itemone: TreeDataItem = {
    id: "4",
    name: "Il pomeriggio del giudizio",
    children: []
}

import jsonData from './tree-view.json';
import Button from "./ui/button";

const data: TreeDataItem[] = [
    itemone,
    {
        id: "1",
        name: "Il giorno del giudizio",
        children: [
            {
                id: "11",
                name: "Name 11",
                children: []
            },
            {
                id: "12",
                name: "Name 12",
                children: [
                    {
                        id: "121",
                        name: "Name 12111",
                        children: []
                    },
                    {
                        id: "122",
                        name: "Name 122",
                        children: []
                    },
                    {
                        id: "123",
                        name: "Name 123",
                        children: []
                    }
                ]
            },
            {
                id: "13",
                name: "Name 13",
                children: []
            },
            {
                id: "14",
                name: "Name 14",
                children: []
            }
        ]
    },
    {
        id: "2",
        name: "La notte del giudizio",
        children: [
            {
                id: "22",
                name: "Name 22",
                children: []
            }
        ]
    },
    {
        id: "3",
        name: "Il pomeriggio del giudizio",
        children: []
    }
];

interface TableOfContentsProps {
    data?: TreeDataItem[];
}

export default function TableOfContents() {

    const handleEdit = (index: number) => {

    };

    const handleDelete = (index: number) => {

    };

    useEffect(() => {
        //console.log(jsonData.type);
        //console.log(jsonData.content);

      jsonData.content.map((item: any, index: number) => {
            if (item.type === "heading") {
                console.log(item);
                return {
                    id: index.toString(),
                    name: item.name,
                    children: []
                }
            }
        })

        // console.log(mappedData);
        /* const mappedData =
            jsonData.content.map((item: any): TreeDataItem => ({
                id: item.id,
                name: item.name,
                children: item.children ? item.children.map((child: any): TreeDataItem => ({
                    id: child.id,
                    name: child.name,
                    children: child.children?.map((grandchild: any): TreeDataItem => ({
                        id: grandchild.id,
                        name: grandchild.name,
                        children: []
                    })) || []
                })) : []
            })) */

    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-2 sticky top-0 z-10">
                <h4 className="text-xs font-medium">Table of Contents</h4>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
                <div className="mb-4">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-0">
                            <h5 className="text-sm font-bold">Table of Contents</h5>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEdit(0)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(0)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex justify-between items-center px-2 mt-2">
                        <div className="flex items-center gap-0">
                            <h5 className="text-sm font-bold">Introduction</h5>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEdit(0)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(0)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex flex-col hover:bg-gray-50 rounded-md mb-4">
                        <TreeView data={data} />
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-0">
                            <h5 className="text-sm font-bold">Bibliography</h5>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEdit(0)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(0)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}
