
import { forwardRef, memo } from "react";

const IconPlay = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M8.5 18.098V5.906l9.577 6.096z" />
        </svg>
    );
});

IconPlay.displayName = 'IconPlay';

export default memo(IconPlay);
