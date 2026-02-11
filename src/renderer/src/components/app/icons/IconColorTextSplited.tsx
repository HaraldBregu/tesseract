
import { forwardRef, memo } from "react";

const IconColorTextSplited = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path stroke="#000000" d="M2.5 23.879v-3.73h19v3.73z" />
            <path fill="#000000" d="m5.866 16.879 5.269-13.5h1.73l5.27 13.5H16.33l-1.346-3.62H9.008L7.63 16.88zm3.669-5.1h4.892l-2.377-6.3h-.12z" />
        </svg>
    );
});

IconColorTextSplited.displayName = 'IconColorTextSplited';

export default memo(IconColorTextSplited);
