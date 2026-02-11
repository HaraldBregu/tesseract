
import { forwardRef, memo } from "react";

const IconUpload = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M11.25 15.789v-8.4L8.785 9.853 7.73 8.769 12 4.5l4.27 4.27-1.055 1.084-2.465-2.465v8.4zM6.308 19.5q-.758 0-1.283-.525a1.75 1.75 0 0 1-.525-1.283v-2.711H6v2.711q0 .116.096.212a.3.3 0 0 0 .212.096h11.384a.3.3 0 0 0 .212-.096.3.3 0 0 0 .096-.212v-2.711h1.5v2.711q0 .758-.525 1.283t-1.283.525z" />
        </svg>
    );
});

IconUpload.displayName = 'IconUpload';

export default memo(IconUpload);
