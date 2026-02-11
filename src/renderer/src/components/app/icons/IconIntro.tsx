
import { forwardRef, memo } from "react";

const IconIntro = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M9.308 18.75v-1.5H20.5v1.5zm0-6v-1.5H20.5v1.5zm0-6v-1.5H20.5v1.5zM5.164 19.662q-.687 0-1.175-.489A1.6 1.6 0 0 1 3.5 18q0-.686.489-1.174a1.6 1.6 0 0 1 1.175-.49q.686 0 1.174.49.489.488.489 1.174 0 .687-.489 1.175a1.6 1.6 0 0 1-1.174.489m0-6q-.687 0-1.175-.489A1.6 1.6 0 0 1 3.5 12q0-.686.489-1.174a1.6 1.6 0 0 1 1.175-.49q.686 0 1.174.49.489.488.489 1.174 0 .687-.489 1.175a1.6 1.6 0 0 1-1.174.489m0-6q-.687 0-1.175-.489A1.6 1.6 0 0 1 3.5 6q0-.686.489-1.174a1.6 1.6 0 0 1 1.175-.49q.686 0 1.174.49.489.488.489 1.174 0 .687-.489 1.175a1.6 1.6 0 0 1-1.174.489" />
        </svg>
    );
});

IconIntro.displayName = 'IconIntro';

export default memo(IconIntro);
