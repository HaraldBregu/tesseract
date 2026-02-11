
import { forwardRef, memo } from "react";

const IconCopy = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M9.058 17.5q-.758 0-1.283-.525a1.75 1.75 0 0 1-.525-1.283V4.308q0-.758.525-1.283T9.058 2.5h8.384q.758 0 1.283.525t.525 1.283v11.384q0 .758-.525 1.283t-1.283.525zm0-1.5h8.384a.3.3 0 0 0 .212-.096.3.3 0 0 0 .096-.212V4.308a.3.3 0 0 0-.096-.212.3.3 0 0 0-.212-.096H9.058a.3.3 0 0 0-.212.096.3.3 0 0 0-.096.212v11.384q0 .116.096.212a.3.3 0 0 0 .212.096m-3.5 5q-.758 0-1.283-.525a1.75 1.75 0 0 1-.525-1.283V6.308h1.5v12.884q0 .116.096.212a.3.3 0 0 0 .212.096h9.884V21z" />
        </svg>
    );
});

IconCopy.displayName = 'IconCopy';

export default memo(IconCopy);
