
import { forwardRef, memo } from "react";

const IconListSquareBullet = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M9 9h6v6H9z" />
        </svg>
    );
});

IconListSquareBullet.displayName = 'IconListSquareBullet';

export default memo(IconListSquareBullet);
