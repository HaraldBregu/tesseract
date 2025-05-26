import { debounce } from '@/lib/utils';
import { useState, useEffect } from 'react';

export const useWindowSize = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = debounce(
            () => {
                setWidth(window.innerWidth);
                setHeight(window.innerHeight);
            },
            300
        );

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return {
        width,
        height,
    };
}
