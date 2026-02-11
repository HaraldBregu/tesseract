
import { forwardRef, memo } from "react";

const IconBurger = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M3.5 17.636v-1.5h17v1.5zm0-4.884v-1.5h17v1.5zm0-4.885v-1.5h17v1.5z" />
        </svg>
    );
});

IconBurger.displayName = 'IconBurger';

export default memo(IconBurger);
