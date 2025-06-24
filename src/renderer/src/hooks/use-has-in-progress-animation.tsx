import { useState, useEffect } from 'react';

const useHasInProgressAnimation = (): boolean => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const handleAnimationStart = () => setIsAnimating(true);
        const handleAnimationEnd = () => setIsAnimating(false);

        document.addEventListener('animationstart', handleAnimationStart);
        document.addEventListener('animationend', handleAnimationEnd);
        document.addEventListener('transitionstart', handleAnimationStart);
        document.addEventListener('transitionend', handleAnimationEnd);

        return () => {
            document.removeEventListener('animationstart', handleAnimationStart);
            document.removeEventListener('animationend', handleAnimationEnd);
            document.removeEventListener('transitionstart', handleAnimationStart);
            document.removeEventListener('transitionend', handleAnimationEnd);
        };
    }, []);

    return isAnimating;
};

export default useHasInProgressAnimation;
