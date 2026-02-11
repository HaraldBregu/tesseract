
import { forwardRef, memo } from "react";

const IconSubscript = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path fillRule="evenodd" d="M10.464 5 5 19h1.83l1.413-3.737h6.198L15.853 19h1.87L12.26 5zm3.415 8.711H8.805l2.485-6.533h.124zm6.144-1.327V19h1.02v-8h-.738L18 12.643l.532.795z" clipRule="evenodd" />
        </svg>
    );
});

IconSubscript.displayName = 'IconSubscript';

export default memo(IconSubscript);
