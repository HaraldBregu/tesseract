
import { forwardRef, memo } from "react";

const IconUnfoldMore = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m12 20.037-3.723-3.723.91-.91L12 18.219l2.814-2.813.91.91zM9.187 8.562l-.91-.91L12 3.93l3.723 3.723-.91.91L12 5.748z" />
        </svg>
    );
});

IconUnfoldMore.displayName = 'IconUnfoldMore';

export default memo(IconUnfoldMore);
