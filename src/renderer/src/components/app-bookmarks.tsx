import { ChevronDown, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Button from "./ui/button";
import PlusSimple from "@/assets/reactIcons/PlusSimple";

interface BookmarkItem {
    title: string;
    subitems: Subitem[];
}

interface Subitem {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: string;
}

interface BookmarksProps {
    title: string;
    items: BookmarkItem[];
}

export default function AppBookmarks({ title, items }: BookmarksProps) {
    const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
/*
    const newItems = [
        {
            title: "Manoscritti",
            subitems: [
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
            ],
        },
        {
            title: "Manoscritti",
            subitems: [
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
            ],
        },
        {
            title: "Manoscritti",
            subitems: [
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
                {
                    title: "Apparatus 1",
                    citation: "Lorem ipsum dolor sit amet, consectetur adipiscing...",
                    description: "Manoscritti di Andrea The King",
                },
            ],
        },

    ]*/

    const toggleSection = (index: number) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleEdit = (index: number) => {
        console.log('Edit section:', index);
    };

    const handleDelete = (index: number) => {
        console.log('Delete section:', index);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-2 sticky top-0 z-10">
                <h4 className="text-xs font-medium">{title}</h4>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            intent="secondary"
                            variant="icon"
                            size="iconSm"
                            icon={<PlusSimple intent='primary' variant='tonal' size='small'/>}
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <span className="material-symbols-outlined mr-2">folder</span>
                            Add Folder
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <span className="material-symbols-outlined mr-2">bookmark</span>
                            Add Bookmark
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <span className="material-symbols-outlined mr-2">link</span>
                            Add Link
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
                {items.map((item, index) => (
                    <div key={index} className="mb-4">
                        <div
                            className="flex justify-between items-center px-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleSection(index)}
                        >
                            <div className="flex items-center gap-0">
                                
                                <Button
                                    size="icon"
                                    variant="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSection(index);
                                    }}
                                >
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${expandedSections[index] ? 'rotate-180' : ''
                                            }`}
                                    />
                                </Button>
                                <h5 className="text-sm font-bold">{item.title}</h5>
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
                                    <DropdownMenuItem onClick={() => handleEdit(index)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(index)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {expandedSections[index] && (
                            <div className="px-2 mt-4 mb-2">
                                {item.subitems.map((subitem, subIndex) => (
                                    <div key={subIndex} className="flex flex-col hover:bg-gray-50 rounded-md mb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-2">
                                                <span className="material-symbols-outlined text-gray-500 mt-1">bookmark</span>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{subitem.title}</span>
                                                    <span className="text-xs text-gray-500">Added on March 15, 2024</span>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="icon"
                                                        className="h-6 w-6"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => handleEdit(subIndex)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(subIndex)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="mx-2 mt-2 pl-4 border-l-4 border-blue-700 cursor-pointer">
                                            <p className="text-sm italic text-gray-600">
                                                {subitem.content}
                                            </p>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600">
                                                {subitem.author}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
