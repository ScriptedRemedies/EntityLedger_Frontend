import { useState, useCallback, useRef, useLayoutEffect } from 'react';

export const useFadeTransition = (initialValue, delay = 100, externalScrollRef = null) => {
    const [activeValue, setActiveValue] = useState(initialValue);
    const [displayValue, setDisplayValue] = useState(initialValue);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Silently store the scroll positions
    const scrollPositions = useRef({});

    // Helper to safely extract keys whether the tab is a String or an Object
    const getKey = (val) => (typeof val === 'object' && val !== null ? (val.id || val.name) : val);

    const triggerTransition = useCallback((newValue, callback) => {
        if (newValue === activeValue || isTransitioning) return;

        // SNAPSHOT: Uses the ref passed down from the component!
        if (externalScrollRef && externalScrollRef.current) {
            scrollPositions.current[getKey(displayValue)] = externalScrollRef.current.scrollTop;
        }

        setActiveValue(newValue);
        setIsTransitioning(true);

        setTimeout(() => {
            setDisplayValue(newValue);
            if (callback) callback();
            setIsTransitioning(false);
        }, delay);
    }, [activeValue, displayValue, isTransitioning, delay, externalScrollRef]);

    // RESTORE
    useLayoutEffect(() => {
        if (externalScrollRef && externalScrollRef.current) {
            const savedPosition = scrollPositions.current[getKey(displayValue)] || 0;
            externalScrollRef.current.style.scrollBehavior = 'auto';
            externalScrollRef.current.scrollTop = savedPosition;
        }
    }, [displayValue, externalScrollRef]);

    // Notice there are no refs being returned here anymore!
    return {
        active: activeValue,
        display: displayValue,
        isTransitioning,
        triggerTransition
    };
};
