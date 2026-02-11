
import { forwardRef, memo } from "react";

const IconUp = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M11.25 21.502V5.346l-4.88 4.863-1.044-1.044L12 2.492l6.673 6.673-1.044 1.07-4.879-4.88v16.147z" />
        </svg>
    );
});

IconUp.displayName = 'IconUp';

export default memo(IconUp);
