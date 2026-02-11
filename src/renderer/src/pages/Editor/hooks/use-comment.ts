import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addComment,
    addCommentCategory,
    deleteCommentCategory,
    editComment,
    editMainTextCommentsContent,
    editApparatusTextCommentsContent,
    moveCommentsFromCategory,
    moveCommentToCategoryId,
    setComments,
    setCommentsCategories,
    updateCommentCategory,
    hideApparatusTextCommentWithIds,
    hideMainTextCommentWithIds,
    hideCommentWithIds,
} from '../store/comment/comments.slice';
import {
    visibleCommentsSelector,
    commentCategoriesSelector,
    commentsSelector,
} from '../store/comment/comments.selector';

export interface UseCommentReturn {
    comments: AppComment[] | null;
    visibleComments: AppComment[] | null;
    commentCategories: CommentCategory[] | null;
    createComment: (target: CommentTarget, id: string, content: string, categoryId?: string, userInfo?: string) => void;
    editMainTextCommentsContent: (comments: { id: string, content: string }[]) => void;
    editApparatusTextCommentsContent: (comments: { id: string, content: string }[]) => void;
    setComments: (comments: AppComment[]) => void;
    setCommentCategories: (commentCategories: CommentCategory[]) => void;
    addCommentCategory: () => void;
    updateCommentCategory: (category: CommentCategory) => void;
    deleteCommentCategory: (category: CommentCategory) => void;
    editComment: (comment: AppComment) => void;
    moveCommentsFromCategory: (categoryId: string, newCategoryId: string | null) => void;
    moveCommentToCategory: (comment: AppComment, category: CommentCategory | null) => void;
    hideCommentWithIds: (ids: string[]) => void;
    hideMainTextCommentWithIds: (ids: string[]) => void;
    hideApparatusTextCommentWithIds: (ids: string[]) => void;
}

export const useComment = (): UseCommentReturn => {
    const dispatch = useDispatch();
    const comments = useSelector(commentsSelector);
    const visibleComments = useSelector(visibleCommentsSelector);
    const commentCategories = useSelector(commentCategoriesSelector);

    const createComment = useCallback((target: CommentTarget, id: string, content: string, categoryId?: string, userInfo?: string) => {
        dispatch(addComment({ id, content, target, categoryId, userInfo }));
    }, [dispatch])

    const setCommentsHandler = useCallback((comments: AppComment[]) => {
        dispatch(setComments(comments));
    }, [dispatch])

    const setCommentCategoriesHandler = useCallback((commentCategories: CommentCategory[]) => {
        dispatch(setCommentsCategories(commentCategories));
    }, [dispatch])

    const addCommentCategoryHandler = useCallback(() => {
        dispatch(addCommentCategory())
    }, [dispatch, commentCategories])

    const updateCommentCategoryHandler = useCallback((category: CommentCategory) => {
        dispatch(updateCommentCategory(category))
    }, [dispatch])

    const deleteCommentCategoryHandler = useCallback((category: CommentCategory) => {
        dispatch(deleteCommentCategory(category))
    }, [dispatch, commentCategories])

    const editCommentHandler = useCallback((comment: AppComment) => {
        dispatch(editComment(comment))
    }, [dispatch])

    const moveCommentsFromCategoryHandler = useCallback((categoryId: string, newCategoryId: string | null) => {
        dispatch(moveCommentsFromCategory({ categoryId, newCategoryId }))
    }, [dispatch])

    const moveCommentToCategoryHandler = useCallback((comment: AppComment, category: CommentCategory | null) => {
        const categoryId = category?.id ?? undefined
        dispatch(moveCommentToCategoryId({ comment, categoryId }))
    }, [dispatch])

    const editMainTextCommentsContentHandler = useCallback((data: { id: string, content: string }[]) => {
        dispatch(editMainTextCommentsContent(data));
    }, [dispatch])

    const editApparatusTextCommentsContentHandler = useCallback((data: { id: string, content: string }[]) => {
        dispatch(editApparatusTextCommentsContent(data));
    }, [dispatch])

    const hideCommentWithIdsHandler = useCallback((ids: string[]) => {
        dispatch(hideCommentWithIds(ids));
    }, [dispatch])

    const hideMainTextCommentWithIdsHandler = useCallback((ids: string[]) => {
        dispatch(hideMainTextCommentWithIds(ids));
    }, [dispatch])

    const hideApparatusTextCommentWithIdsHandler = useCallback((ids: string[]) => {
        dispatch(hideApparatusTextCommentWithIds(ids));
    }, [dispatch])



    return {
        comments,
        visibleComments,
        commentCategories,
        createComment,
        setComments: setCommentsHandler,
        setCommentCategories: setCommentCategoriesHandler,
        addCommentCategory: addCommentCategoryHandler,
        updateCommentCategory: updateCommentCategoryHandler,
        deleteCommentCategory: deleteCommentCategoryHandler,
        editComment: editCommentHandler,
        moveCommentsFromCategory: moveCommentsFromCategoryHandler,
        moveCommentToCategory: moveCommentToCategoryHandler,
        editMainTextCommentsContent: editMainTextCommentsContentHandler,
        editApparatusTextCommentsContent: editApparatusTextCommentsContentHandler,
        hideCommentWithIds: hideCommentWithIdsHandler,
        hideMainTextCommentWithIds: hideMainTextCommentWithIdsHandler,
        hideApparatusTextCommentWithIds: hideApparatusTextCommentWithIdsHandler,
    };
};

export default useComment;
