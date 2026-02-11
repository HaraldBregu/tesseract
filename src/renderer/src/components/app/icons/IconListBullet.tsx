
import { forwardRef, memo } from "react";

const IconListBullet = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M12 15q-1.253 0-2.126-.873Q9 13.254 9 12.001q0-1.254.873-2.127Q10.746 9 11.999 9q1.254 0 2.127.873.874.873.874 2.126 0 1.254-.873 2.127-.873.874-2.126.874" />
        </svg>
    );
});

IconListBullet.displayName = 'IconListBullet';

export default memo(IconListBullet);
