
import { forwardRef, memo } from "react";

const IconHome = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M6 19h3.346v-5.943h5.308V19H18v-9l-6-4.52L6 10zm-1.5 1.5V9.25L12 3.605l7.5 5.645V20.5h-6.346v-5.943h-2.308V20.5z" />
        </svg>
    );
});

IconHome.displayName = 'IconHome';

export default memo(IconHome);
