
import { forwardRef, memo } from "react";

const IconMinusSimple = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M5.5 12.75v-1.5h13v1.5z" />
        </svg>
    );
});

IconMinusSimple.displayName = 'IconMinusSimple';

export default memo(IconMinusSimple);
