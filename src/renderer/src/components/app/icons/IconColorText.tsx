
import { forwardRef, memo } from "react";

const IconColorText = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement> & { textColor?: string }>(({ textColor, ...props }, ref) => {
    return (
        <svg width="25" height="25" viewBox="0 0 25 25" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path stroke={textColor ?? "#000000"} fill={textColor ?? "#000000"} d="M2.5 23.879v-3.73h19v3.73z" />
            <path d="m5.866 16.879 5.269-13.5h1.73l5.27 13.5H16.33l-1.346-3.62H9.008L7.63 16.88zm3.669-5.1h4.892l-2.377-6.3h-.12z" />
        </svg>
    );
});

IconColorText.displayName = 'IconColorText';

export default memo(IconColorText);
