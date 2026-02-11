
import { forwardRef, memo } from "react";

const IconListNumber = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M11.777 18.481V7.761L9.362 9.47 8.5 8.18l3.735-2.661h1.196V18.48z" />
        </svg>
    );
});

IconListNumber.displayName = 'IconListNumber';

export default memo(IconListNumber);
