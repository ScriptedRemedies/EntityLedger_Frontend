import { useNavigate } from 'react-router-dom';
import { VARIANTS } from '../data/variants';
import '../styles/ChallengesPage.scss';
import {useFadeTransition} from "../hooks/useFadeTranistion.js";
import {useEffect, useState} from "react";
import api from "../services/api.js";

const StartChallengePage = () => {
    const navigate = useNavigate();

    // --- State Management ---
    const variantView = useFadeTransition(VARIANTS[0]);
    const tabView = useFadeTransition('Rules');

    const [seasonPayload, setSeasonPayload] = useState({
        startingGrade: 'ASH_IV', // Default starting grade for all variants
        inheritedSeasonId: null,
        variantSettings: {
            // Pre-load default standard settings to avoid undefined errors
            consecutiveMatches: false,
            restrictedLoadout: false,
            sameBuild: false,
            addOnLimits: { ASH: 2, BRONZE: 2, SILVER: 1, GOLD: 0, IRIDESCENT: 0 },
            lockedPerks: [],
            lockedAddOns: []
        }
    });

    // Clear the settings whenever they click a new variant icon on the left!
    useEffect(() => {
        if (!variantView.display) return;
        tabView.triggerTransition('Rules');

        // Wipe the payload clean so Standard settings don't accidentally leak into Chaos Shuffle
        setSeasonPayload({
            startingGrade: 'ASH_IV',
            inheritedSeasonId: null,
            variantSettings: {
                // Reset
                consecutiveMatches: false,
                restrictedLoadout: false,
                sameBuild: false,
                addOnLimits: { ASH: 2, BRONZE: 2, SILVER: 1, GOLD: 0, IRIDESCENT: 0 },
                lockedPerks: [],
                lockedAddOns: []
            }
        });
    }, [variantView.display]);

    // --- Variant Selection Fetch ---
    useEffect(() => {
        if (!variantView.display) return;
        // Reset sub-views when switching variants
        tabView.triggerTransition('Rules');
    }, [variantView.display]);

    // --- Helper to handle standard variant toggles ---
    const handleToggleSetting = (settingKey) => {
        setSeasonPayload(prev => ({
            ...prev,
            variantSettings: {
                ...prev.variantSettings,
                [settingKey]: !prev.variantSettings[settingKey]
            }
        }));
    };

    const [pastBloodMoneyRuns, setPastBloodMoneyRuns] = useState([]);

    // Fetch past Blood Money runs when Afterburn is selected
    useEffect(() => {
        if (variantView.display?.id === 'AFTERBURN') {
            const fetchPastRuns = async () => {
                try {
                    // Assuming you have an endpoint that fetches a player's seasons by variant!
                    const response = await api.get('/seasons/variant/BLOOD_MONEY');

                    // Filter to ONLY show COMPLETED runs
                    const completedRuns = response.data.filter(s => s.status === 'COMPLETED');
                    setPastBloodMoneyRuns(completedRuns);
                } catch (error) {
                    console.error("Failed to fetch past Blood Money runs", error);
                }
            };
            fetchPastRuns();
        }
    }, [variantView.display]);

    // --- The Render Switch ---
    const renderVariantSettings = () => {
        const variantId = variantView.display.id;

        switch (variantId) {
            case 'STANDARD':
                return (
                    <div className="standard-options-container">
                        <h3 className="bebas-header-1 title-white">Standard Options</h3>

                        {/* 1. Consecutive Matches */}
                        <label className="settings-toggle-label">
                            <input
                                type="checkbox"
                                checked={!!seasonPayload.variantSettings.consecutiveMatches}
                                onChange={() => handleToggleSetting('consecutiveMatches')}
                                className="settings-toggle-input"
                            />
                            Consecutive Matches
                        </label>

                        {/* 2. Restricted Loadout */}
                        <div className="settings-group">
                            <label className="settings-toggle-label">
                                <input
                                    type="checkbox"
                                    checked={!!seasonPayload.variantSettings.restrictedLoadout}
                                    onChange={() => {
                                        if (seasonPayload.variantSettings.sameBuild) return;
                                        handleToggleSetting('restrictedLoadout');
                                    }}
                                    disabled={seasonPayload.variantSettings.sameBuild}
                                    className="settings-toggle-input"
                                />
                                Restricted Loadout
                                {seasonPayload.variantSettings.sameBuild && <span className="settings-warning">(Disabled by Same Build)</span>}
                            </label>

                            {/* The Grade Limits UI (Only shows if toggle is checked) */}
                            {seasonPayload.variantSettings.restrictedLoadout && (
                                <div className="grade-limits-container">
                                    {['ASH', 'BRONZE', 'SILVER', 'GOLD', 'IRIDESCENT'].map(grade => (
                                        <div key={grade} className="grade-limit-item">
                                            <span className="grade-limit-label">{grade}</span>
                                            <input
                                                type="number"
                                                min="0" max="2"
                                                className="grade-limit-input"
                                                value={seasonPayload.variantSettings.addOnLimits[grade]}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    setSeasonPayload(prev => ({
                                                        ...prev,
                                                        variantSettings: {
                                                            ...prev.variantSettings,
                                                            addOnLimits: {
                                                                ...prev.variantSettings.addOnLimits,
                                                                [grade]: val
                                                            }
                                                        }
                                                    }));
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Same Build */}
                        <div className="settings-group">
                            <label className="settings-toggle-label">
                                <input
                                    type="checkbox"
                                    checked={!!seasonPayload.variantSettings.sameBuild}
                                    onChange={() => {
                                        if (seasonPayload.variantSettings.restrictedLoadout) return;
                                        handleToggleSetting('sameBuild');
                                    }}
                                    disabled={seasonPayload.variantSettings.restrictedLoadout}
                                    className="settings-toggle-input"
                                />
                                Same Build
                                {seasonPayload.variantSettings.restrictedLoadout && <span className="settings-warning">(Disabled by Restricted Loadout)</span>}
                            </label>

                            {/* The Build Picker UI (Only shows if toggle is checked) */}
                            {seasonPayload.variantSettings.sameBuild && (
                                <div className="same-build-container">
                                    {/* Replace this div with your actual Perk/Addon picker components! */}
                                    <p className="same-build-description">Select your locked loadout:</p>
                                    <button
                                        className="same-build-btn"
                                        onClick={() => {
                                            // Example of how you will update state when a perk is picked
                                            // setSeasonPayload(prev => ({...prev, variantSettings: {...prev.variantSettings, lockedPerks: ['uuid-1', 'uuid-2']}}))
                                            console.log("Open Perk Picker Modal");
                                        }}
                                    >
                                        Choose Perks & Add-ons
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'AFTERBURN':
                return (
                    <div className="afterburn-options-container">
                        <h3 className="bebas-header-1 title-white">SELECT BLOOD MONEY SAVE</h3>
                        <p className="inter-text-small text-normal">Choose a completed Blood Money run to inherit your remaining killers and funds.</p>

                        {pastBloodMoneyRuns.length === 0 ? (
                            <div className="error-box">
                                No completed Blood Money runs found. You must complete a Blood Money season before attempting Afterburn.
                            </div>
                        ) : (
                            <select
                                className="season-select-dropdown"
                                value={seasonPayload.inheritedSeasonId || ''}
                                onChange={(e) => setSeasonPayload({...seasonPayload, inheritedSeasonId: e.target.value})}
                            >
                                <option value="" disabled>Select a past season...</option>
                                {pastBloodMoneyRuns.map(run => (
                                    <option key={run.id} value={run.id}>
                                        {/* Format this based on your actual Season object properties */}
                                        Blood Money - Ended {new Date(run.endDate).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="default-variant-message">
                        <p className="inter-text-normal text-center title-white">
                            The Entity dictates the rules for this trial.<br/>
                            No additional configuration is required.
                        </p>
                    </div>
                );
        }
    };

    const handleStartChallenge = async () => {
        try {
            const requestBody = {
                variantType: variantView.display.id, // e.g., "STANDARD", "IRON_MAN"
                startingGrade: seasonPayload.startingGrade,
                inheritedSeasonId: seasonPayload.inheritedSeasonId,
                variantSettings: seasonPayload.variantSettings
            };

            const response = await api.post('/seasons', requestBody);

            // It worked! Navigate them to the dashboard or roster view for this new season.
            navigate(`/season/${response.data.id}/roster`);

        } catch (error) {
            console.error("Failed to start season:", error.response?.data?.message || error.message);
            // Show an error toast to the user here
        }
    };

    return (
        <div className="main-container review-container">

            {/* === LEFT NAV === */}
            <div className="nav">
                {/* Fog Background */}
                <div className="nav-fog-wrapper">
                    <div className="nav-fog-bg"></div>
                </div>

                {/* Variant List (Scrollable) */}
                <div className="nav-icons-list hide-scrollbar">
                    {/* Map directly over the hardcoded VARIANTS import */}
                    {VARIANTS.map((v) => (
                        <div key={v.id} className="variantIconContainer" onClick={() => variantView.triggerTransition(v)}>
                            {/* The active variant indicator */}
                            {variantView.active?.id === v.id && (
                                <div className="variantIconActive fade-in"></div>
                            )}
                            <img src={`/assets/Variants/${v.name}.png`} alt={v.name} className="variantIcon" />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    Back
                </button>
            </div>

            {/* === MIDDLE CONTENT AREA === */}
            <div className="middle-content">
                {variantView.display && (
                    <div key={variantView.display.id} className={`variant-view-wrapper ${variantView.isTransitioning ? 'fade-out' : 'fade-in'}`}>
                        <div className="content-fog-bg"></div>
                        <img src={variantView.display.watermarkUrl} alt="" className="variant-watermark" />

                        <div className="variant-content-area">

                            {/* Secondary Nav & Header */}
                            <div className="variant-header">
                                <h1 className="bebas-header-1 title-white">{variantView.display.name}</h1>
                                <p className="inter-text-normal">{variantView.display.difficultyLevel}</p>

                                <div className="secondary-nav-container">
                                    {['Rules', 'Settings'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => tabView.triggerTransition(tab)}
                                            className={`inter-text-normal transition-colors ${tabView.active === tab ? 'secondaryNavIndicator' : 'secondaryNav'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="tab-content-wrapper hide-scrollbar">
                                <div key={tabView.display} className={`tab-content ${tabView.isTransitioning ? 'fade-out' : 'fade-in'}`}>
                                    {/* TAB 1: RULES */}
                                    {tabView.display === 'Rules' && (
                                        <div className="rules-container">
                                            <p className="inter-text-normal rules-description">{variantView.display.rulesDescription}</p>
                                            <h1 className="bebas-header-1 title-white">RULES</h1>
                                            {variantView.display.rules.map(rule => (
                                                <div key={rule.id} className="rule-item">
                                                    <h2 className="bebas-header-2 rule-title">{rule.title}</h2>
                                                    <p className="inter-text-small rule-desc">{rule.description}</p>

                                                    {rule.bullets && rule.bullets.length > 0 && (
                                                        <ul className="rule-bullets">
                                                            {rule.bullets.map((bullet, index) => (
                                                                <li key={index}>{bullet}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* TAB 2: SETTINGS */}
                                    {tabView.display === 'Settings' && (
                                        <div className="settings-container">

                                            {/* Dynamic Settings based on Variant */}
                                            {renderVariantSettings()}

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* === RIGHT PANEL (Start challenge button) === */}
            <div className="right-panel">
                <button className="squareBtn">Start Challenge</button>
            </div>
        </div>
    );
};

export default StartChallengePage;
