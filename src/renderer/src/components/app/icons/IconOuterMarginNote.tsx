
import { forwardRef, memo } from "react";

const IconOuterMarginNote = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <g><path d="M15.749 22h1.5V2h-1.5z" /><path d="M13.346 9.224v1.5H6.75v-1.5z" /><path d="M13.346 12.916v1.5H6.75v-1.5z" /><path d="M13.346 5.531v1.5H6.75v-1.5z" /></g>
        </svg>
    );
});

IconOuterMarginNote.displayName = 'IconOuterMarginNote';

export default memo(IconOuterMarginNote);
