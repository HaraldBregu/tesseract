export interface ChatState {
  messages: ChatMessage[];
  originalMessages: ChatMessage[];
  participants: ChatParticipant[] | null;
  currentUserAccess: ChatUserAccess | null;
  loading: boolean;
  accessLoading: boolean;
  error: string | null;
  filters: {
    searchText: string;
    senderUserId: string | null;
    dateFrom: string | null;
  } | null;
}

export const initialChatState: ChatState = {
  messages: [],
  originalMessages: [],
  participants: null,
  currentUserAccess: null,
  loading: false,
  accessLoading: false,
  error: null,
  filters: null,
};
