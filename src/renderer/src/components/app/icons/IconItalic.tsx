
import { forwardRef, memo } from "react";

const IconItalic = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M5.395 18.504v-1.808h3.817l3.24-9.634H8.635V5.254h9.154v1.808h-3.51l-3.24 9.634h3.51v1.808z" />
        </svg>
    );
});

IconItalic.displayName = 'IconItalic';

export default memo(IconItalic);
