import { useEffect, useState } from 'react';
import { vec2D } from '../data/globals';

const useResize = () => {
    const [size, setSize] = useState<vec2D>({
        x: window.innerWidth,
        y: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                x: window.innerWidth,
                y: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); 

    return size;
};

export default useResize;