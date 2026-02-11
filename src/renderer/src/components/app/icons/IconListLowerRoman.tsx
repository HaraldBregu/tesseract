
import { forwardRef, memo } from "react";

const IconListLowerRoman = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M10.5 9h3v1.3h-0.75v7.4h0.75V19h-3v-1.3h0.75V10.3h-0.75z" />
        </svg>
    );
});

IconListLowerRoman.displayName = 'IconListLowerRoman';

export default memo(IconListLowerRoman);

