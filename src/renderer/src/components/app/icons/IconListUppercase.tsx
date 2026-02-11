
import { forwardRef, memo } from "react";

const IconListUppercase = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="m6 19 5.464-14h1.795l5.465 14h-1.871l-1.412-3.737H9.243L7.83 19zm3.805-5.289h5.074l-2.465-6.533h-.124z" />
        </svg>
    );
});

IconListUppercase.displayName = 'IconListUppercase';

export default memo(IconListUppercase);
