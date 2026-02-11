
import { forwardRef, memo } from "react";

const IconCloseBig = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m6.4 18.655-1.054-1.054 5.6-5.6-5.6-5.6 1.053-1.053 5.6 5.6 5.6-5.6L18.653 6.4l-5.6 5.6 5.6 5.6-1.053 1.054-5.6-5.6z" />
        </svg>
    );
});

IconCloseBig.displayName = 'IconCloseBig';

export default memo(IconCloseBig);
