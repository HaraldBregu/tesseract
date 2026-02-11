
import { forwardRef, memo } from "react";

const IconExpand = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M12 15.055 6.345 9.401l1.053-1.053 4.6 4.6 4.6-4.6L17.653 9.4z" />
        </svg>
    );
});

IconExpand.displayName = 'IconExpand';

export default memo(IconExpand);
