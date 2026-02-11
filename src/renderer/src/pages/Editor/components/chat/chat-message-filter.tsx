import AppButton from "@/components/app/app-button";
import AppInput from "@/components/app/app-input";
import { CalendarIcon, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AppPopover, AppPopoverTrigger, AppPopoverContent } from "@/components/app/app-popover";
import { AppSelect, AppSelectTrigger, AppSelectValue, AppSelectContent, AppSelectItem } from "@/components/app/app-select";
import { t } from "i18next";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface ChatMessageFilterProps {
    readonly partecipants: ChatParticipant[] | null;
    readonly onFilter: (searchText: string, senderUserId: string | null, dateFrom: string | null) => void
}
const ChatMessageFilter = ({
    partecipants,
    onFilter,
}: ChatMessageFilterProps) => {
    const [searchContent, setSearchContent] = useState("")
    const [searchFromDate, setSearchFromDate] = useState<Date>()
    const [partecipantFilter, setPartecipantFilter] = useState<ChatParticipant | null>(null)

    useEffect(() => {
        onFilter(searchContent, partecipantFilter?.userId || null, searchFromDate ? searchFromDate.toISOString() : null,)
    }, [searchContent, searchFromDate, partecipantFilter])

    return (
        <div className="p-4 space-y-3 bg-white border border-b-1">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <AppInput
                    type="search"
                    placeholder={t("chat.search", "Cerca nei messaggi...")}
                    value={searchContent}
                    onChange={(e) => {
                        setSearchContent(e.target.value)
                    }}
                    className="pl-10"
                    autoFocus={false}
                />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <AppPopover>
                        <AppPopoverTrigger asChild>
                            <AppButton
                                variant="outline"
                                data-empty={!searchFromDate}
                                className="p-2 data-[empty=true]:text-muted-foreground justify-start text-left font-normal w-full">
                                <CalendarIcon />
                                {searchFromDate ? format(searchFromDate, "PPP") : <span>Pick a date</span>}
                            </AppButton>
                        </AppPopoverTrigger>
                        <AppPopoverContent className="w-auto p-1">
                            <Calendar
                                mode="single"
                                selected={searchFromDate}
                                onSelect={setSearchFromDate}
                                className="rounded-md"
                            />
                        </AppPopoverContent>
                    </AppPopover>
                </div>
                <div className="flex-1">
                    <AppSelect
                        value={partecipantFilter?.userId || "ALL"}
                        onValueChange={(value: string) => {
                            if (value === "ALL")
                                setPartecipantFilter(null)
                            else {
                                const partecipant = partecipants?.find((p) => p.userId === value) || null;
                                setPartecipantFilter(partecipant);
                            }
                        }}>
                        <AppSelectTrigger className="w-full h-9">
                            <div className="flex items-center gap-2 p-2">
                                <Users className="h-4 w-4" />
                                <AppSelectValue />
                            </div>
                        </AppSelectTrigger>
                        <AppSelectContent>
                            <AppSelectItem value="ALL">{t("chat.allSenders", "Tutti i mittenti")}</AppSelectItem>
                            {partecipants?.map((participant) => (
                                <AppSelectItem
                                    key={participant.userId}
                                    value={participant.userId}>
                                    {participant.userName} {participant.userSurname}
                                </AppSelectItem>
                            ))}
                        </AppSelectContent>
                    </AppSelect>
                </div>
            </div>
        </div>
    );
}

ChatMessageFilter.displayName = 'ChatMessageFilter'

export default ChatMessageFilter