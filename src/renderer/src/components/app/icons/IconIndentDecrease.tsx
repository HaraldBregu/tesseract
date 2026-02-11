
import { forwardRef, memo } from "react";

const IconIndentDecrease = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M3.5 20.379v-1.5h17v1.5zm8-3.875v-1.5h9v1.5zm0-3.875v-1.5h9v1.5zm0-3.875v-1.5h9v1.5zm-8-3.875v-1.5h17v1.5zm3.404 10.404L3.5 11.879l3.404-3.404z" />
        </svg>
    );
});

IconIndentDecrease.displayName = 'IconIndentDecrease';

export default memo(IconIndentDecrease);
