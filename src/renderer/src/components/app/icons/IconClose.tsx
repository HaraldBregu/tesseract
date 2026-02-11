
import { forwardRef, memo } from "react";

const IconClose = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m8.228 16.836-1.064-1.064 3.773-3.773-3.773-3.748 1.064-1.063L12 10.96l3.748-3.774 1.063 1.064-3.773 3.748 3.773 3.773-1.063 1.063L12 13.063z" />
        </svg>
    );
});

IconClose.displayName = 'IconClose';

export default memo(IconClose);
