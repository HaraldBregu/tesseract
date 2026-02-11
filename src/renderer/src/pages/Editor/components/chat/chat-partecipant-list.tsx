import List from "@/components/app/list";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/utils";
import { t } from "i18next";
import { Users, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";


interface ChatPartecipantListProps {
    readonly partecipants: ChatParticipant[] | null;
}
const ChatPartecipantList = ({
    partecipants,
}: ChatPartecipantListProps) => {
    const [isParticipantsCollapsed, setIsParticipantsCollapsed] = useState(true)

    if (!partecipants || partecipants.length === 0) {
        return null
    }

    return (
        <div className="border-t bg-muted/30">
            <button
                onClick={() => setIsParticipantsCollapsed(!isParticipantsCollapsed)}
                className="w-full p-4 flex items-center justify-between text-sm font-semibold hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t("chat.participants", "Participants")} ({partecipants.length})
                </div>
                {isParticipantsCollapsed ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </button>
            {!isParticipantsCollapsed && (
                <div className="px-4 pb-4 space-y-2">
                    <List
                        data={partecipants}
                        renderItem={(item) => {
                            return (
                                <div key={item.userId} className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                            {getInitials(item.userName + ' ' + item.userSurname)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            {item.userName} {item.userSurname}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{item.status}</div>
                                    </div>
                                </div>
                            )
                        }}
                    />
                </div>
            )}
        </div>
    );
}

// ChatPartecipantList.displayName = 'ChatPartecipantList'

export default ChatPartecipantList;