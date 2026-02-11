
import { forwardRef, memo } from "react";

const IconInnerMarginNote = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path fillRule="evenodd" d="M8.25 22h-1.5V2h1.5zm2.402-12.776v1.5h6.597v-1.5zm0 3.692v1.5h6.597v-1.5zm0-7.385v1.5h6.597v-1.5z" clipRule="evenodd" />
        </svg>
    );
});

IconInnerMarginNote.displayName = 'IconInnerMarginNote';

export default memo(IconInnerMarginNote);
