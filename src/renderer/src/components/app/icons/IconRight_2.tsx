
import { forwardRef, memo } from "react";

const IconRight_2 = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m10.055 12.001-4.584-4.6 1.053-1.053L12.178 12l-5.654 5.654-1.053-1.054zm6.35 0-4.584-4.6 1.053-1.053L18.529 12l-5.653 5.654-1.054-1.054z" />
        </svg>
    );
});

IconRight_2.displayName = 'IconRight_2';

export default memo(IconRight_2);
