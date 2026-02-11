
import { forwardRef, memo } from "react";

const IconHighlighter = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement> & { textColor?: string }>(({ textColor, ...props }, ref) => {
    return (
        <svg width="25" height="25" viewBox="0 0 25 25" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path stroke={textColor ?? "#000000"} fill={textColor ?? "#000000"} d="M2.5 23.879v-3.73h19v3.73z" />
            <path d="m14.302 12.146-2.6-2.6-3.942 3.942a.29.29 0 0 0-.087.212q0 .125.087.211l2.161 2.177a.29.29 0 0 0 .212.087.29.29 0 0 0 .211-.087zm-1.531-3.654 2.585 2.585 4.269-4.254a.3.3 0 0 0 .087-.221.3.3 0 0 0-.087-.222l-2.158-2.157a.3.3 0 0 0-.22-.087.3.3 0 0 0-.222.087zm-1.58-.542 4.707 4.707-4.484 4.5q-.543.543-1.274.543-.73 0-1.273-.543l-.096-.096-.915.854H3.97l2.843-2.827-.077-.077a1.82 1.82 0 0 1-.558-1.288q-.016-.747.527-1.289zm0 0 4.79-4.79q.542-.543 1.273-.543t1.273.542l2.177 2.162q.542.542.542 1.273t-.542 1.273l-4.806 4.79z" />
        </svg>
    );
});

IconHighlighter.displayName = 'IconHighlighter';

export default memo(IconHighlighter);
