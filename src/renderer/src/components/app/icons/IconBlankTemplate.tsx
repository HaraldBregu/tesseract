
import { forwardRef, memo } from "react";

const IconBlankTemplate = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path fillRule="evenodd" d="M123.676 3H3.171A.17.17 0 0 0 3 3.171V172.83c0 .094.077.171.171.171h120.505a.17.17 0 0 0 .171-.171V3.171a.17.17 0 0 0-.171-.171M3.171 0A3.17 3.17 0 0 0 0 3.171V172.83A3.17 3.17 0 0 0 3.171 176h120.505a3.17 3.17 0 0 0 3.171-3.171V3.171A3.17 3.17 0 0 0 123.676 0z" clipRule="evenodd" />
        </svg>
    );
});

IconBlankTemplate.displayName = 'IconBlankTemplate';

export default memo(IconBlankTemplate);
