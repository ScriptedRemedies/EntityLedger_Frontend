import { useState, useCallback } from 'react';

export const useFadeTransition = (initialValue, delay = 100) => {
    // The exact same 3 states, just made generic
    const [activeValue, setActiveValue] = useState(initialValue);
    const [displayValue, setDisplayValue] = useState(initialValue);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // The reusable handler
    const triggerTransition = useCallback((newValue, callback) => {
        // Prevent spam clicks
        if (newValue === activeValue || isTransitioning) return;

        setActiveValue(newValue);
        setIsTransitioning(true);

        setTimeout(() => {
            setDisplayValue(newValue);
            if (callback) callback(); // Fire any extra logic exactly when the screen is black
            setIsTransitioning(false);
        }, delay);
    }, [activeValue, isTransitioning, delay]);

    // Return the variables so your components can use them
    return {
        active: activeValue,
        display: displayValue,
        isTransitioning,
        triggerTransition
    };
};
