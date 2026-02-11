
import { forwardRef, memo } from "react";

const IconListUpperRoman = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M9.5 5h5v1.8h-1.5v10.4h1.5V19h-5v-1.8h1.5V6.8H9.5z" />
        </svg>
    );
});

IconListUpperRoman.displayName = 'IconListUpperRoman';

export default memo(IconListUpperRoman);

