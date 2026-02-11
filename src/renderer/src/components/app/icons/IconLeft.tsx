
import { forwardRef, memo } from "react";

const IconLeft = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M9.173 18.663 2.5 11.99l6.673-6.674 1.044 1.045-4.863 4.879h16.155v1.5H5.364l4.878 4.878z" />
        </svg>
    );
});

IconLeft.displayName = 'IconLeft';

export default memo(IconLeft);
