
import { forwardRef, memo } from "react";

const IconIndentIncrease = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M3.5 20.379v-1.5h17v1.5zm8-3.875v-1.5h9v1.5zm0-3.875v-1.5h9v1.5zm0-3.875v-1.5h9v1.5zm-8-3.875v-1.5h17v1.5zm0 10.404V8.475l3.404 3.404z" />
        </svg>
    );
});

IconIndentIncrease.displayName = 'IconIndentIncrease';

export default memo(IconIndentIncrease);
