
import { forwardRef, memo } from "react";

const IconDropdown = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M12 14.308 8.19 10.5h7.616z" />
        </svg>
    );
});

IconDropdown.displayName = 'IconDropdown';

export default memo(IconDropdown);
