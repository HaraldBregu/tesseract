
import { forwardRef, memo } from "react";

const IconSuperscript = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path fillRule="evenodd" d="M10.464 5 5 19h1.83l1.413-3.737h6.198L15.853 19h1.87L12.26 5zm3.415 8.711H8.805l2.485-6.533h.124zm4.144-7.327V13h1.02V5h-.738L16 6.643l.532.795z" clipRule="evenodd" />
        </svg>
    );
});

IconSuperscript.displayName = 'IconSuperscript';

export default memo(IconSuperscript);
