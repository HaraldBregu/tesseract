import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface CommentState {
    comments: AppComment[] | null;
    commentCategories: CommentCategory[] | null;
}

const initialState: CommentState = {
    comments: null,
    commentCategories: null,
};

const commentSlice = createSlice({
    name: 'commentState',
    initialState,
    reducers: {
        addCommentCategory(state) {
            const commentCategories = state.commentCategories || []
            const commentCategoryPattern = /^Category (\d+)$/;
            const matchingCommentCategories = commentCategories.filter(categoryComments =>
                commentCategoryPattern.test(categoryComments.name)
            );

            const sortedCommentCategories = matchingCommentCategories.sort((a, b) => {
                const aMatch = a.name.match(commentCategoryPattern);
                const bMatch = b.name.match(commentCategoryPattern);
                const aNum = aMatch ? parseInt(aMatch[1]) : 0;
                const bNum = bMatch ? parseInt(bMatch[1]) : 0;
                return aNum - bNum;
            });

            var lastSortedNumber = 1;
            if (sortedCommentCategories && sortedCommentCategories.length > 0) {
                const lastCommentCategory = sortedCommentCategories[sortedCommentCategories.length - 1];
                const number = parseInt(lastCommentCategory.name.match(/\d+/)?.[0] || '0');
                lastSortedNumber = number + 1;
            }

            commentCategories.push({
                id: crypto.randomUUID(),
                name: `Category ${lastSortedNumber}`
            })

            state.commentCategories = commentCategories
        },
        updateCommentCategory(state, action: PayloadAction<CommentCategory>) {
            if (!state.commentCategories)
                return
            const category = state.commentCategories.find(category => category.id === action.payload.id)
            if (category) {
                category.name = action.payload.name
            }
        },
        editComment(state, action: PayloadAction<AppComment>) {
            const comment = state.comments?.find(comment => comment.id === action.payload.id)
            if (comment) {
                comment.author = action.payload.author
                comment.description = action.payload.description
                comment.updatedAt = new Date().toISOString()
            }
        },
        editMainTextCommentsContent(state, action: PayloadAction<{ id: string, content: string }[]>) {
            if (!state.comments)
                return

            const mainTextComments = state.comments
                .filter(comment => comment.target === 'MAIN_TEXT')
                .map(comment => ({
                    ...comment,
                    visible: action.payload.some(data => data.id === comment.id) || comment.visible,
                    content: action.payload.find(data => data.id === comment.id)?.content || comment.content
                }))

            const apparatusComments = state.comments
                .filter(comment => comment.target === 'APPARATUS_TEXT')

            state.comments = [
                ...mainTextComments,
                ...apparatusComments,
            ]
        },
        hideMainTextCommentWithIds(state, action: PayloadAction<string[]>) {
            if (!state.comments)
                return

            const mainTextComments = state.comments
                .filter(comment => comment.target === 'MAIN_TEXT')
                .map(comment => ({
                    ...comment,
                    visible: action.payload.includes(comment.id) ? false : comment.visible,
                }))

            const apparatusComments = state.comments
                .filter(comment => comment.target === 'APPARATUS_TEXT')

            state.comments = [
                ...mainTextComments,
                ...apparatusComments,
            ]
        },
        hideCommentWithIds(state, action: PayloadAction<string[]>) {
            if (!state.comments)
                return

            const newComments = state.comments
                .map(comment => ({
                    ...comment,
                    visible: action.payload.includes(comment.id) ? false : comment.visible,
                }))

            state.comments = newComments
        },
        editApparatusTextCommentsContent(state, action: PayloadAction<{ id: string, content: string }[]>) {
            if (!state.comments)
                return

            const mainTextComments = state.comments
                .filter(comment => comment.target === 'MAIN_TEXT')

            const apparatusComments = state.comments
                .filter(comment => comment.target === 'APPARATUS_TEXT')
                .map(comment => ({
                    ...comment,
                    visible: action.payload.some(data => data.id === comment.id) || comment.visible,
                    content: action.payload.find(data => data.id === comment.id)?.content || comment.content
                }))

            state.comments = [
                ...mainTextComments,
                ...apparatusComments,
            ]
        },
        hideApparatusTextCommentWithIds(state, action: PayloadAction<string[]>) {
            if (!state.comments)
                return

            const mainTextComments = state.comments
                .filter(comment => comment.target === 'MAIN_TEXT')

            const apparatusComments = state.comments
                .filter(comment => comment.target === 'APPARATUS_TEXT')
                .map(comment => ({
                    ...comment,
                    visible: action.payload.includes(comment.id) ? false : comment.visible,
                }))

            state.comments = [
                ...mainTextComments,
                ...apparatusComments,
            ]
        },

        moveCommentToCategoryId(state, action: PayloadAction<{ comment: AppComment, categoryId?: string }>) {
            const comment = state.comments?.find(comment => comment.id === action.payload.comment.id)
            if (comment) {
                comment.categoryId = action.payload.categoryId
            }
        },
        deleteCommentCategory(state, action: PayloadAction<CommentCategory>) {
            if (!state.commentCategories)
                return
            state.commentCategories = state.commentCategories
                .filter(category => category.id !== action.payload.id)

            if (!state.comments)
                return

            state.comments = state.comments
                .map(comment => {
                    const newComment = {
                        ...comment,
                        visible: comment.categoryId === action.payload.id ? false : comment.visible,
                    } as AppComment satisfies AppComment

                    if (newComment.categoryId === action.payload.id
                        || newComment.categoryId === null
                        || newComment.categoryId === undefined)
                        delete newComment.categoryId

                    return newComment
                })
        },
        moveCommentsFromCategory(state, action: PayloadAction<{ categoryId: string, newCategoryId: string | null }>) {
            const comments = state.comments?.filter(comment => comment.categoryId === action.payload.categoryId)
            comments?.forEach(comment => {
                comment.categoryId = action.payload.newCategoryId ?? undefined
            })
        },
        deleteCommentWithIds(state, action: PayloadAction<string[]>) {
            if (!state.comments)
                return
            state.comments = state.comments.filter(comment => !action.payload.includes(comment.id))
        },
        addComment(state, action: PayloadAction<{ id: string, content: string, target: CommentTarget, categoryId?: string, userInfo?: string }>) {
            const newComment: AppComment = {
                id: action.payload.id,
                content: action.payload.content,
                target: action.payload.target,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: action.payload.userInfo ?? "Unknown",
                visible: true,
            }

            if (action.payload.categoryId)
                newComment.categoryId = action.payload.categoryId

            if (!state.comments)
                state.comments = []

            state.comments.push(newComment)
        },
        setComments(state, action: PayloadAction<AppComment[]>) {
            state.comments = action.payload ?? []
            state.comments = state.comments.filter(comment => comment.visible);
        },
        setCommentsCategories(state, action: PayloadAction<CommentCategory[]>) {
            state.commentCategories = action.payload ?? []
        },
    },
});

export const {
    addCommentCategory,
    updateCommentCategory,
    editComment,
    editMainTextCommentsContent,
    editApparatusTextCommentsContent,
    moveCommentToCategoryId,
    deleteCommentCategory,
    moveCommentsFromCategory,
    hideMainTextCommentWithIds,
    hideApparatusTextCommentWithIds,
    deleteCommentWithIds,
    addComment,
    setComments,
    setCommentsCategories,
    hideCommentWithIds,
} = commentSlice.actions;

export default commentSlice.reducer;