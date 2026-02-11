
import { forwardRef, memo } from "react";

const IconAlignJustify = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M3.5 20.379v-1.5h17v1.5zm0-3.875v-1.5h17v1.5zm0-3.875v-1.5h17v1.5zm0-3.875v-1.5h17v1.5zm0-3.875v-1.5h17v1.5z" />
        </svg>
    );
});

IconAlignJustify.displayName = 'IconAlignJustify';

export default memo(IconAlignJustify);
