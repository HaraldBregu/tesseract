
import { forwardRef, memo } from "react";

const IconLeft_2 = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M11.125 17.655 5.47 12.001l5.653-5.653L12.179 7.4l-4.584 4.6 4.584 4.6zm6.35 0-5.654-5.654 5.653-5.653L18.528 7.4l-4.584 4.6 4.584 4.6z" />
        </svg>
    );
});

IconLeft_2.displayName = 'IconLeft_2';

export default memo(IconLeft_2);
