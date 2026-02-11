
import { forwardRef, memo } from "react";

const IconCheck = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m9.55 17.655-5.335-5.334 1.069-1.07 4.265 4.266 9.166-9.165 1.069 1.069z" />
        </svg>
    );
});

IconCheck.displayName = 'IconCheck';

export default memo(IconCheck);
