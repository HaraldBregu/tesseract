
import { forwardRef, memo } from "react";

const IconListBullet_empty = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M12 17q-2.076 0-3.538-1.462T7 12t1.462-3.538T12 7q2.076 0 3.538 1.462T17 12t-1.462 3.538T12 17m0-1.154q1.596 0 2.721-1.125T15.846 12t-1.125-2.721T12 8.154 9.279 9.279 8.154 12t1.125 2.721T12 15.846" />
        </svg>
    );
});

IconListBullet_empty.displayName = 'IconListBullet_empty';

export default memo(IconListBullet_empty);
