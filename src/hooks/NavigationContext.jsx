import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const cinematicNavigate = useCallback((to, options) => {
        // 1. Trigger the CSS black-out animation
        setIsTransitioning(true);

        // 2. Wait for the screen to go completely dark (450ms matches CSS)
        setTimeout(() => {
            // Support for both navigate('/path') and navigate(-1)
            if (typeof to === 'number') {
                navigate(to);
            } else {
                navigate(to, options);
            }

            // Reset scroll position for the new page
            window.scrollTo(0, 0);

            // 3. Lift the fog and reveal the new page
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 450);
    }, [navigate]);

    return (
        <NavigationContext.Provider value={cinematicNavigate}>
            {children}
            {/* The invisible div that sits over the entire app until triggered */}
            <div className={`global-fog-overlay ${isTransitioning ? 'fog-active' : ''}`}></div>
        </NavigationContext.Provider>
    );
};

export const useCinematicNavigate = () => useContext(NavigationContext);
