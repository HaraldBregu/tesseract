
import { forwardRef, memo } from "react";

const IconCalendar = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M5.308 21.498q-.758 0-1.283-.525A1.75 1.75 0 0 1 3.5 19.69V6.306q0-.758.525-1.283t1.283-.525h1.384V2.383h1.539v2.115h7.577V2.383h1.5v2.115h1.384q.758 0 1.283.525t.525 1.283V19.69q0 .758-.525 1.283t-1.283.525zm0-1.5h13.384a.3.3 0 0 0 .212-.096.3.3 0 0 0 .096-.212v-9.384H5v9.384q0 .116.096.212a.3.3 0 0 0 .212.096M5 8.806h14v-2.5a.3.3 0 0 0-.096-.212.3.3 0 0 0-.212-.096H5.308a.3.3 0 0 0-.212.096.3.3 0 0 0-.096.212z" />
        </svg>
    );
});

IconCalendar.displayName = 'IconCalendar';

export default memo(IconCalendar);
