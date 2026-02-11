
import { forwardRef, memo } from "react";

const IconNonPrintingCharact = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M10.34 11.178a3.333 3.333 0 0 1 0-6.666h6.666v1.666h-1.667v13.334h-1.667V6.178h-1.666v13.334h-1.667z" />
        </svg>
    );
});

IconNonPrintingCharact.displayName = 'IconNonPrintingCharact';

export default memo(IconNonPrintingCharact);
