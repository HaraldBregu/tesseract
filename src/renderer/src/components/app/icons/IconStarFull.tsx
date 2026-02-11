
import { forwardRef, memo } from "react";

const IconStarFull = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m6.574 19.96 1.433-6.17-4.786-4.147 6.315-.548L12 3.277l2.463 5.818 6.315.548-4.786 4.148 1.432 6.169L12 16.687z" />
        </svg>
    );
});

IconStarFull.displayName = 'IconStarFull';

export default memo(IconStarFull);
