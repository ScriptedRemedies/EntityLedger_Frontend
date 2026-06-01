import { useEffect, useRef } from 'react';
import api from '../services/api';

const useSessionHeartbeat = () => {
    // 1. Keep track of the exact millisecond the user last interacted
    const lastActivity = useRef(Date.now());

    // 2. Set our intervals
    const PING_INTERVAL = 5 * 60 * 1000; // 5 Minutes
    const MAX_INACTIVITY = 24 * 60 * 60 * 1000; // 24 Hours

    useEffect(() => {
        // Update the timestamp whenever the user does something
        const updateActivity = () => {
            lastActivity.current = Date.now();
        };

        // Listen for all common UI touches
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, updateActivity));

        // The Heartbeat Loop
        const intervalId = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActive = now - lastActivity.current;

            // SCENARIO A: The user walked away completely. 24 hours have passed.
            if (timeSinceLastActive > MAX_INACTIVITY) {
                console.warn("24 hours of total inactivity. Soft logout triggered.");
                // Match the exact logout logic from your api.js interceptor
                if (window.location.pathname !== '/') {
                    localStorage.setItem('returnPath', window.location.pathname);
                }
                window.location.href = '/';
                return;
            }

            // SCENARIO B: The user interacted with the UI during this 5-minute window
            if (timeSinceLastActive < PING_INTERVAL) {
                // Silently ping the backend to keep the session alive
                api.get('/players/ping').catch(() => {
                    // If the ping fails (e.g. server restarted or token died),
                    // your api.js interceptor will automatically catch the 401 and kick them out!
                });
            }
        }, PING_INTERVAL);

        // Cleanup listeners if the component ever unmounts
        return () => {
            events.forEach(event => window.removeEventListener(event, updateActivity));
            clearInterval(intervalId);
        };
    }, []);
};

export default useSessionHeartbeat;
