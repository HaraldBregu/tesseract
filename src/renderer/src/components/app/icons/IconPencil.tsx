
import { forwardRef, memo } from "react";

const IconPencil = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} ref={ref}>
            <path d="M5 19h1.261L16.499 8.764l-1.262-1.262L5 17.739zm-1.5 1.5v-3.384L16.69 3.93q.228-.207.501-.319a1.5 1.5 0 0 1 .575-.112q.3 0 .583.107.282.106.499.34l1.221 1.236q.233.217.332.5.099.282.099.565 0 .301-.103.576t-.328.501L6.885 20.5zM15.856 8.144l-.62-.642 1.262 1.262z" />
        </svg>
    );
});

IconPencil.displayName = 'IconPencil';

export default memo(IconPencil);
