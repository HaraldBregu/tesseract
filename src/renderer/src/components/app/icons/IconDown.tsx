
import { forwardRef, memo } from "react";

const IconDown = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m12 21.502-6.674-6.673 1.044-1.045 4.88 4.864V2.492h1.5v16.146l4.878-4.879 1.044 1.07z" />
        </svg>
    );
});

IconDown.displayName = 'IconDown';

export default memo(IconDown);
