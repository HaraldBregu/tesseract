
import { forwardRef, memo } from "react";

const IconCollapse = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m12 10.455-4.6 4.6-1.054-1.054 5.653-5.653L17.654 14 16.6 15.055z" />
        </svg>
    );
});

IconCollapse.displayName = 'IconCollapse';

export default memo(IconCollapse);
