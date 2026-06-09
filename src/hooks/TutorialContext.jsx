import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import '../styles/TutorialWhisper.scss';

const TutorialContext = createContext();

// The ordered list of steps across the whole app
export const TUTORIAL_STEPS = {
    INTRO: 'INTRO',
    DASHBOARD_START: 'DASHBOARD_START',
    DASHBOARD_NEW_CHALLENGE: 'DASHBOARD_NEW_CHALLENGE',
    START_CHALLENGE_INTRO: 'START_CHALLENGE_INTRO'
};

export const TutorialProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(null);
    const [whisperData, setWhisperData] = useState(null);

    // Check if they are a new user on initial load
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('ledger_has_seen_tutorial');
        if (!hasSeenTutorial) {
            startTutorial();
        }
    }, []);

    const startTutorial = useCallback(() => {
        setIsActive(true);
        setCurrentStep(TUTORIAL_STEPS.INTRO);
    }, []);

    const endTutorial = useCallback(() => {
        setIsActive(false);
        setCurrentStep(null);
        setWhisperData(null);
        localStorage.setItem('ledger_has_seen_tutorial', 'true');
    }, []);

    const nextStep = useCallback((stepName) => {
        setCurrentStep(stepName);
    }, []);

    // Components will call this when they mount to attach a whisper to an element
    const registerWhisper = useCallback((stepName, data) => {
        if (isActive && currentStep === stepName) {
            setWhisperData(prevData => {
                // THE FIX: Break the infinite loop!
                // If the incoming whisper is exactly the same as the one we are already showing, do nothing.
                if (JSON.stringify(prevData) === JSON.stringify(data)) {
                    return prevData;
                }
                return data;
            });
        }
    }, [isActive, currentStep]);

    return (
        <TutorialContext.Provider value={{ isActive, currentStep, startTutorial, endTutorial, nextStep, registerWhisper }}>
            {children}

            {/* GLOBAL WHISPER RENDERER */}
            {isActive && whisperData && (
                <>
                    <div className="tutorial-overlay-active"></div>
                    <div
                        className={`entity-whisper-box fade-in ${whisperData.isCentered ? 'whisper-center' : ''}`}
                        style={!whisperData.isCentered ? { top: whisperData.top, left: whisperData.left } : {}}
                    >
                        {whisperData.title && (
                            <h3 className="bebas-header-2 title-iri text-2xl mb-2">{whisperData.title}</h3>
                        )}

                        <p className="whisper-text" dangerouslySetInnerHTML={{ __html: whisperData.text }}></p>

                        <div className="whisper-actions">
                            <button className="whisper-btn-skip" onClick={endTutorial}>Silence Whispers</button>

                            {!whisperData.hideNextBtn && (
                                <button className="whisper-btn-next" onClick={() => nextStep(whisperData.nextStepId)}>
                                    {whisperData.nextText || "Continue"}
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </TutorialContext.Provider>
    );
};

export const useTutorial = () => useContext(TutorialContext);
