
import { forwardRef, memo } from "react";

const IconFolder = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M4.308 19.5q-.758 0-1.283-.525a1.75 1.75 0 0 1-.525-1.283V6.308q0-.758.525-1.283T4.308 4.5h5.49l2 2h7.894q.758 0 1.283.525t.525 1.283v9.384q0 .758-.525 1.283t-1.283.525zm0-1.5h15.384a.3.3 0 0 0 .221-.087.3.3 0 0 0 .087-.22V8.307a.3.3 0 0 0-.087-.222.3.3 0 0 0-.22-.086h-8.509l-2-2H4.309a.3.3 0 0 0-.221.087.3.3 0 0 0-.087.22v11.385a.3.3 0 0 0 .087.221.3.3 0 0 0 .22.087" />
        </svg>
    );
});

IconFolder.displayName = 'IconFolder';

export default memo(IconFolder);
