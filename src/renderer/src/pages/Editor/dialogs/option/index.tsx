import { memo, forwardRef, useImperativeHandle } from 'react'
import Comment from './Comment'
import Bookmark from './Bookmark'
import { useEditor } from '../../hooks/use-editor'
import { setBookmarkCategoriesDialogVisible, setCommentCategoriesDialogVisible } from '../../provider/actions/dialogs'

interface OptionsDialogsProps {
    commentCategories: CommentCategory[] | null
    bookmarkCategories: BookmarkCategory[] | null
    onSelectCommentCategoryId: (categoryId: string) => void
    onSelectBookmarkCategoryId: (categoryId: string) => void
}

export interface OptionsDialogsElement {
    openCommentCategoriesDialog: () => void
    openBookmarkCategoriesDialog: () => void
    closeCommentCategoriesDialog: () => void
    closeBookmarkCategoriesDialog: () => void
}

const OptionsDialogs = forwardRef<OptionsDialogsElement, OptionsDialogsProps>(({
    commentCategories,
    bookmarkCategories,
    onSelectCommentCategoryId,
    onSelectBookmarkCategoryId,
}, ref) => {
    const [state, dispatch] = useEditor()

    useImperativeHandle(ref, () => ({
        openCommentCategoriesDialog: () => dispatch(setCommentCategoriesDialogVisible(true)),
        openBookmarkCategoriesDialog: () => dispatch(setBookmarkCategoriesDialogVisible(true)),
        closeCommentCategoriesDialog: () => dispatch(setCommentCategoriesDialogVisible(false)),
        closeBookmarkCategoriesDialog: () => dispatch(setBookmarkCategoriesDialogVisible(false)),
    }), [])

    const handleSelectComment = (category: CommentCategory) => {
        onSelectCommentCategoryId(category.id)
        dispatch(setCommentCategoriesDialogVisible(false))
    }

    const handleSelectBookmark = (category: BookmarkCategory) => {
        onSelectBookmarkCategoryId(category.id)
        dispatch(setBookmarkCategoriesDialogVisible(false))
    }

    return (
        <>
            {state.commentCategoriesDialogVisible && <Comment
                open={state.commentCategoriesDialogVisible}
                onCancel={() => dispatch(setCommentCategoriesDialogVisible(false))}
                onSelectCategory={handleSelectComment}
                categories={commentCategories}
            />}

            {state.bookmarkCategoriesDialogVisible && <Bookmark
                open={state.bookmarkCategoriesDialogVisible}
                onCancel={() => dispatch(setBookmarkCategoriesDialogVisible(false))}
                onSelectCategory={handleSelectBookmark}
                categories={bookmarkCategories}
            />}
        </>
    )
})

OptionsDialogs.displayName = 'OptionsDialogs'

export default memo(OptionsDialogs)
export { default as Comment } from './Comment'
export { default as Bookmark } from './Bookmark'
