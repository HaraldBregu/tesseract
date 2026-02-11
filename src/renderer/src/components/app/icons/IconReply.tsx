
import { forwardRef, memo } from "react";

const IconReply = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M19 18.498v-3.5a3.13 3.13 0 0 0-.952-2.298 3.13 3.13 0 0 0-2.298-.952H6.373l3.85 3.85-1.07 1.053L3.5 10.998l5.654-5.654 1.069 1.053-3.85 3.85h9.377q1.97 0 3.36 1.391 1.39 1.39 1.39 3.36v3.5z" />
        </svg>
    );
});

IconReply.displayName = 'IconReply';

export default memo(IconReply);
