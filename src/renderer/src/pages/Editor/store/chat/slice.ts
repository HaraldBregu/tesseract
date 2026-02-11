import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialChatState } from './state';

// ==================== PAYLOAD TYPES ====================
export interface GetDocumentAccessPayload {
  documentId: string;
}

export interface GetHistoryPayload {
  documentId: string;
  page?: number;
  size?: number;
}

export interface GetPartecipantsPayload {
  documentId: string;
}

// ==================== SLICE ====================
const chatSlice = createSlice({
  name: 'chat',
  initialState: initialChatState,
  reducers: {
    // ==================== GET DOCUMENT ACCESS ====================
    getDocumentAccess(state, _action: PayloadAction<GetDocumentAccessPayload>) {
      state.accessLoading = true;
      state.error = null;
    },

    getDocumentAccessSuccess(state, action: PayloadAction<ChatUserAccess>) {
      state.currentUserAccess = action.payload;
      state.accessLoading = false;
      state.error = null;
    },
    getDocumentAccessFailure(state, action: PayloadAction<string>) {
      state.accessLoading = false;
      state.error = action.payload;
    },

    // ==================== GET CHAT HISTORY ====================
    getHistory(state, _action: PayloadAction<GetHistoryPayload>) {
      state.loading = true;
      state.error = null;
    },
    getHistorySuccess(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
      state.originalMessages = action.payload;
      state.loading = false;
      state.error = null;
      state.filters = null;
    },
    getHistoryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // ==================== GET CHAT PARTICIPANTS ====================
    getPartecipants(state, _action: PayloadAction<GetPartecipantsPayload>) {
      state.loading = true;
      state.error = null;
    },
    getPartecipantsSuccess(state, action: PayloadAction<ChatParticipant[]>) {
      state.participants = action.payload;
      state.loading = false;
      state.error = null;
    },
    getPartecipantsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // ==================== UTILITY ACTIONS ====================
    addMessage(state, action: PayloadAction<ChatMessage>) {
      const exists = state.originalMessages.some(msg => msg.chatId === action.payload.chatId);
      if (!exists) {
        state.originalMessages.push(action.payload);
        
        if (!state.filters) {
          state.messages.push(action.payload);
        } else {
          const { searchText, senderUserId, dateFrom } = state.filters;
          const normalizedSearch = searchText.trim().toLowerCase();
          const message = action.payload;
          
          const textMatch = normalizedSearch.length === 0 || (message.text ?? '').toLowerCase().includes(normalizedSearch);
          const senderMatch = !senderUserId || message.senderUserId === senderUserId;
          const dateMatch = !dateFrom || (message.timestamp && new Date(message.timestamp) >= new Date(dateFrom));
          
          if (textMatch && senderMatch && dateMatch) {
            state.messages.push(action.payload);
          }
        }
      }
    },
    addMessages(state, action: PayloadAction<ChatMessage[]>) {
      const existingIds = new Set(state.originalMessages.map(msg => msg.chatId));
      const newMessages = action.payload.filter(msg => !existingIds.has(msg.chatId));
      state.originalMessages.push(...newMessages);
      
      if (!state.filters) {
        state.messages.push(...newMessages);
      } else {
        const { searchText, senderUserId, dateFrom } = state.filters;
        const normalizedSearch = searchText.trim().toLowerCase();
        
        const filteredNewMessages = newMessages.filter(message => {
          const textMatch = normalizedSearch.length === 0 || (message.text ?? '').toLowerCase().includes(normalizedSearch);
          const senderMatch = !senderUserId || message.senderUserId === senderUserId;
          const dateMatch = !dateFrom || (message.timestamp && new Date(message.timestamp) >= new Date(dateFrom));
          return textMatch && senderMatch && dateMatch;
        });
        
        state.messages.push(...filteredNewMessages);
      }
    },
    updateMessage(state, action: PayloadAction<ChatMessage>) {
      const index = state.messages.findIndex(msg => msg.chatId === action.payload.chatId);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
      const originalIndex = state.originalMessages.findIndex(msg => msg.chatId === action.payload.chatId);
      if (originalIndex !== -1) {
        state.originalMessages[originalIndex] = action.payload;
      }
    },
    deleteMessage(state, action: PayloadAction<string | number>) {
      state.messages = state.messages.filter(msg => msg.chatId !== action.payload);
      state.originalMessages = state.originalMessages.filter(msg => msg.chatId !== action.payload);
    },
    clearMessages(state) {
      state.messages = [];
      state.originalMessages = [];
      state.error = null;
      state.filters = null;
    },
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
      state.originalMessages = action.payload;
      state.error = null;
      state.filters = null;
    },
    clearChatData(state) {
      state.messages = [];
      state.originalMessages = [];
      state.participants = null;
      state.currentUserAccess = null;
      state.accessLoading = false;
      state.error = null;
      state.filters = null;
    },

    // ==================== FILTER ACTIONS ====================
    filterMessages(state, action: PayloadAction<{
      searchText: string;
      senderUserId: string | null;
      dateFrom: string | null;
    }>) {
      const { searchText, senderUserId, dateFrom } = action.payload;

      state.filters = { searchText, senderUserId, dateFrom };

      const normalizedSearch = searchText.trim().toLowerCase();

      state.messages = state.originalMessages.filter(message => {
        const textMatch = normalizedSearch.length === 0
          ? true
          : (message.text ?? '').toLowerCase().includes(normalizedSearch);

        const senderMatch = !senderUserId
          ? true
          : message.senderUserId === senderUserId;

        const dateMatch = !dateFrom
          ? true
          : message.timestamp && new Date(message.timestamp) >= new Date(dateFrom);

        return textMatch && senderMatch && dateMatch;
      });
    },

    clearMessageFilter(state) {
      state.filters = null;
      state.messages = state.originalMessages;
    },
  },
});

export const {
  getDocumentAccess,
  getDocumentAccessSuccess,
  getDocumentAccessFailure,
  getHistory,
  getHistorySuccess,
  getHistoryFailure,
  getPartecipants,
  getPartecipantsSuccess,
  getPartecipantsFailure,
  addMessage,
  addMessages,
  updateMessage,
  deleteMessage,
  clearMessages,
  setMessages,
  clearChatData,
  filterMessages,
  clearMessageFilter,
} = chatSlice.actions;

export default chatSlice.reducer;
