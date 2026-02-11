
import { forwardRef, memo } from "react";

const IconList = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M9.308 18.628v-1.5H20.5v1.5zm0-6v-1.5H20.5v1.5zm0-6v-1.5H20.5v1.5zM5.164 19.542q-.687 0-1.175-.489a1.6 1.6 0 0 1-.489-1.175q0-.686.489-1.174a1.6 1.6 0 0 1 1.175-.49q.686 0 1.174.49.489.488.489 1.174 0 .687-.489 1.175a1.6 1.6 0 0 1-1.174.489m0-6q-.687 0-1.175-.489a1.6 1.6 0 0 1-.489-1.175q0-.686.489-1.174a1.6 1.6 0 0 1 1.175-.49q.686 0 1.174.49.489.488.489 1.174 0 .687-.489 1.175a1.6 1.6 0 0 1-1.174.489m0-6q-.687 0-1.175-.489A1.6 1.6 0 0 1 3.5 5.878q0-.686.489-1.174a1.6 1.6 0 0 1 1.175-.49q.686 0 1.174.49.489.488.489 1.174 0 .687-.489 1.175a1.6 1.6 0 0 1-1.174.489" />
        </svg>
    );
});

IconList.displayName = 'IconList';

export default memo(IconList);
