import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/renderer/src/store/store';

const chatStateSelector = (state: RootState) => state.chat;

export const selectMessages = createSelector(
  chatStateSelector,
  (state) => state.messages
);

export const selectLoading = createSelector(
  chatStateSelector,
  (state) => state.loading
);

export const selectAccessLoading = createSelector(
  chatStateSelector,
  (state) => state.accessLoading
);

export const selectError = createSelector(
  chatStateSelector,
  (state) => state.error
);

export const selectMessageCount = createSelector(
  selectMessages,
  (messages) => messages.length
);

export const selectMessagesByUserId = createSelector(
  [selectMessages, (_: RootState, userId: string) => userId],
  (messages, userId) => messages.filter(msg => msg.senderUserId === userId)
);

export const selectMessagesByDocumentId = createSelector(
  [selectMessages, (_: RootState, documentId: string) => documentId],
  (messages, documentId) => messages.filter(msg => msg.documentId === documentId)
);

export const selectMessageById = createSelector(
  [selectMessages, (_: RootState, messageId: string | number) => messageId],
  (messages, messageId) => messages.find(msg => msg.chatId === messageId)
);

export const selectLastMessage = createSelector(
  selectMessages,
  (messages) => messages[messages.length - 1] || null
);

export const selectSortedMessages = createSelector(
  selectMessages,
  (messages: ChatMessage[]) => {
    return [...messages].sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeA - timeB;
    });
  }
);

export const selectMessagesGroupedByDate = createSelector(
  selectSortedMessages,
  (messages) => {
    return messages.reduce((acc: Record<string, ChatMessage[]>, msg) => {
      const date = new Date(msg.timestamp || Date.now());
      const dateKey = date.toLocaleDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(msg);
      return acc;
    }, {});
  }
);

export const selectParticipants = createSelector(
  chatStateSelector,
  (state) => state.participants
);

export const selectParticipantCount = createSelector(
  selectParticipants,
  (participants) => participants?.length || 0
);

export const selectCurrentUserAccess = createSelector(
  chatStateSelector,
  (state) => state.currentUserAccess
);

export const selectCanUserAccess = createSelector(
  selectCurrentUserAccess,
  (access) => access?.canAccess || false
);

export const selectCurrentUserDisplayName = createSelector(
  selectCurrentUserAccess,
  (access) => access?.displayName || null
);

export const selectCurrentUserInitials = createSelector(
  selectCurrentUserAccess,
  (access) => access?.initials || null
);

export const selectAccessDeniedReason = createSelector(
  selectCurrentUserAccess,
  (access) => access?.reason || null
);

export const selectIsAccessCheckComplete = createSelector(
  [selectCurrentUserAccess, selectAccessLoading],
  (access, loading) => !loading && access !== null
);

export const selectAnyLoading = createSelector(
  [selectLoading, selectAccessLoading],
  (loading, accessLoading) => loading || accessLoading
);

export const selectMessageFilters = createSelector(
  chatStateSelector,
  (state) => state.filters
);

export const selectOriginalMessages = createSelector(
  chatStateSelector,
  (state) => state.originalMessages
);

export const selectHasActiveFilters = createSelector(
  selectMessageFilters,
  (filters) => filters !== null
);

export const selectFilteredMessageCount = createSelector(
  [selectMessages, selectOriginalMessages],
  (filtered, original) => ({
    filtered: filtered.length,
    total: original.length
  })
);
