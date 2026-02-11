
import { forwardRef, memo } from "react";

const IconRight = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m14.837 18.663-1.07-1.045 4.88-4.879H2.5v-1.5h16.156l-4.864-4.878 1.044-1.045 6.673 6.674z" />
        </svg>
    );
});

IconRight.displayName = 'IconRight';

export default memo(IconRight);
