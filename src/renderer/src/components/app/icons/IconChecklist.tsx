
import { forwardRef, memo } from "react";

const IconChecklist = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M5.694 18.452 2.5 15.257l1.044-1.044 2.125 2.125 4.25-4.25 1.044 1.07zm0-7.616L2.5 7.642l1.044-1.044L5.67 8.723l4.25-4.25 1.044 1.069zm7.315 5.721v-1.5h8.5v1.5zm0-7.615v-1.5h8.5v1.5z" />
        </svg>
    );
});

IconChecklist.displayName = 'IconChecklist';

export default memo(IconChecklist);
