import { useCallback, useState } from "react";
import {
    Command,
    CommandList,
    CommandItem,
    CommandGroup,
} from "@/components/ui/command";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import AppButton from "@/components/app/app-button";
import { Input } from "./ui/input";
import IconClose from "./app/icons/IconClose";
import { cn } from "@/lib/utils";

interface ComboboxFindProps {
    leftIcon?: React.ReactNode;
    selectOptions: string[];
    totalWWordFound?: number;
    wordNumber?: number;
    setInput: (value: string) => void;
    input: string;
    placeholder?: string;
    dropdownContainerClassNames?: string;
    triggerSearch?: () => void;
}

export const Combobox = ({
    leftIcon,
    selectOptions,
    totalWWordFound,
    wordNumber,
    setInput,
    input,
    placeholder,
    dropdownContainerClassNames,
    triggerSearch,
}: ComboboxFindProps) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleToggle = useCallback(() => {
        setOpen(!open && selectOptions.length > 0);
    }, [open, selectOptions]);

    return (
        <div className="flex flex-row items-center gap-2 border rounded-md px-2 w-full">

            <Popover open={open} onOpenChange={handleToggle}>
                <PopoverTrigger asChild>
                        <AppButton
                            variant="transparent"
                            size="icon-xs"
                            className="p-0 w-auto flex items-center justify-center gap-0"
                            onClick={handleToggle}
                            >
                                <>
                            {leftIcon}
                            <ChevronDown />
                    </>
                        </AppButton>
                </PopoverTrigger>
                <PopoverContent className={cn("w-[200px] p-0 max-h-[70vh] ml-2 overflow-auto", dropdownContainerClassNames)}>
                    <Command>
                        <CommandList className="max-h-auto overflow-y-hidden">
                            <CommandGroup>
                                {selectOptions.map((opt) => (
                                    <CommandItem
                                        key={opt}
                                        value={opt}
                                        onSelect={() => {
                                            setInput(opt);
                                            setOpen(false);
                                        }}
                                    >
                                        {opt}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="w-full flex items-center rounded-md border border-transparent focus-within:border-transparent focus-within:ring-0">
                <Input
                    placeholder={placeholder}
                    className="!pl-0 max-h-7 border-none ring-0 outline-none shadow-none focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:ring-0"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            triggerSearch && triggerSearch();
                        }
                    }}
                />
            </div>

            {input.length > 0 ? (
                <span className="text-xs text-muted-foreground mr-1">
                    {totalWWordFound && totalWWordFound > 0 ? `${wordNumber}/` : ''}{totalWWordFound}
                </span>
            ) : null}

            {input.length > 0 && (
                <AppButton
                    size={'sm'}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setInput("");
                    }}
                    className="p-0 w-3 h-3 border border-muted-foreground rounded-2xl"
                    variant="transparent"
                >
                    <IconClose className="text-muted-foreground" />
                </AppButton>
             )}
        </div>
    );
};

export default Combobox;
