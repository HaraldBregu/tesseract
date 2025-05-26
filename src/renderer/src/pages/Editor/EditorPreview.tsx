import { ForwardedRef, useImperativeHandle } from "react";
import { forwardRef } from "react";

interface EditorPreviewProps {
}

export const EditorPreview = forwardRef((
    { }: EditorPreviewProps,
    ref: ForwardedRef<unknown>
) => {
    useImperativeHandle(ref, () => {
        return {
        }
    }, []);

    return (
        <div>
            This is the preview
        </div>
    )
})

export default EditorPreview;
