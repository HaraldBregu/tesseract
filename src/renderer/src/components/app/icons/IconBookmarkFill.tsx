
import { forwardRef, memo } from "react";

const IconBookmarkFill = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M5.5 20.25V5.308q0-.758.525-1.283T7.308 3.5h9.384q.758 0 1.283.525t.525 1.283V20.25L12 17.462z" />
        </svg>
    );
});

IconBookmarkFill.displayName = 'IconBookmarkFill';

export default memo(IconBookmarkFill);
