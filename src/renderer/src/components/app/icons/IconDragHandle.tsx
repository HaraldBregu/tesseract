
import { forwardRef, memo } from "react";

const IconDragHandle = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M4.5 14.75v-1.5h15v1.5zm0-4v-1.5h15v1.5z" />
        </svg>
    );
});

IconDragHandle.displayName = 'IconDragHandle';

export default memo(IconDragHandle);
