import { useNavigate } from 'react-router-dom';
import { VARIANTS } from '../data/variants';
import './StartChallengePage.scss';
import {useFadeTransition} from "../hooks/useFadeTranistion.js";
import {useEffect, useState} from "react";
import api from "../services/api.js";

const ReviewChallengesPage = () => {
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
                    <div className="flex flex-col gap-6">
                        <h3 className="bebas-header-1 text-white">Standard Options</h3>

                        {/* 1. Consecutive Matches */}
                        <label className="flex items-center gap-3 text-white cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!seasonPayload.variantSettings.consecutiveMatches}
                                onChange={() => handleToggleSetting('consecutiveMatches')}
                                className="w-5 h-5"
                            />
                            Consecutive Matches
                        </label>

                        {/* 2. Restricted Loadout */}
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 text-white cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!seasonPayload.variantSettings.restrictedLoadout}
                                    onChange={() => {
                                        if (seasonPayload.variantSettings.sameBuild) return;
                                        handleToggleSetting('restrictedLoadout');
                                    }}
                                    disabled={seasonPayload.variantSettings.sameBuild}
                                    className="w-5 h-5 disabled:opacity-50"
                                />
                                Restricted Loadout
                                {seasonPayload.variantSettings.sameBuild && <span className="text-red-500 text-sm">(Disabled by Same Build)</span>}
                            </label>

                            {/* The Grade Limits UI (Only shows if toggle is checked) */}
                            {seasonPayload.variantSettings.restrictedLoadout && (
                                <div className="ml-8 grid grid-cols-2 gap-4 bg-black/50 p-4 border border-60-background">
                                    {['ASH', 'BRONZE', 'SILVER', 'GOLD', 'IRIDESCENT'].map(grade => (
                                        <div key={grade} className="flex justify-between items-center text-white">
                                            <span className="text-sm">{grade}</span>
                                            <input
                                                type="number"
                                                min="0" max="2"
                                                className="w-12 bg-transparent border-b border-white text-center"
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
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 text-white cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!seasonPayload.variantSettings.sameBuild}
                                    onChange={() => {
                                        if (seasonPayload.variantSettings.restrictedLoadout) return;
                                        handleToggleSetting('sameBuild');
                                    }}
                                    disabled={seasonPayload.variantSettings.restrictedLoadout}
                                    className="w-5 h-5 disabled:opacity-50"
                                />
                                Same Build
                                {seasonPayload.variantSettings.restrictedLoadout && <span className="text-red-500 text-sm">(Disabled by Restricted Loadout)</span>}
                            </label>

                            {/* The Build Picker UI (Only shows if toggle is checked) */}
                            {seasonPayload.variantSettings.sameBuild && (
                                <div className="ml-8 p-4 border border-60-background text-white bg-black/50">
                                    {/* Replace this div with your actual Perk/Addon picker components! */}
                                    <p className="text-sm text-gray-400 mb-2">Select your locked loadout:</p>
                                    <button
                                        className="bg-60-background px-4 py-2 hover:bg-white hover:text-black transition-colors"
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
                    <div className="flex flex-col gap-4">
                        <h3 className="bebas-header-1 text-white">SELECT BLOOD MONEY SAVE</h3>
                        <p className="inter-text-small text-normal">Choose a completed Blood Money run to inherit your remaining killers and funds.</p>

                        {pastBloodMoneyRuns.length === 0 ? (
                            <div className="p-4 border border-red-900 bg-red-900/20 text-red-400">
                                No completed Blood Money runs found. You must complete a Blood Money season before attempting Afterburn.
                            </div>
                        ) : (
                            <select
                                className="bg-black border border-60-background text-white p-2"
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
                    <div className="flex flex-col items-center justify-center py-10 opacity-70">
                        <p className="inter-text-normal text-white text-center">
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
        <div className="review-container h-screen w-screen overflow-hidden bg-full-background flex relative font-inter text-normal">

            <div className="bg-overlay absolute inset-0 z-0 pointer-events-none"></div>

            {/* === LEFT NAV === */}
            <div className="nav border-r-2 border-black flex flex-col relative z-30 flex-shrink-0">
                <div className="absolute inset-0 overflow-hidden -z-20 pointer-events-none">
                    <div className="nav-fog-bg opacity-60"></div>
                </div>

                {/* Variant List (Scrollable) */}
                <div className="flex-1 w-[180px] py-6 overflow-y-auto overflow-x-hidden hide-scrollbar flex flex-col items-center gap-6 pb-4">
                    {/* Map directly over the hardcoded VARIANTS import */}
                    {VARIANTS.map((v) => (
                        <div key={v.id} className="variantIconContainer relative group flex items-center justify-center cursor-pointer" onClick={() => variantView.triggerTransition(v)}>
                            {/* The active variant indicator */}
                            {variantView.active?.id === v.id && (
                                <div className="variantIconActive fade-in absolute -z-10 bg-30-background"></div>
                            )}
                            <img src={`/assets/Variants/${v.name}.png`} alt={v.name} className="variantIcon" />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="back-button inter-text-normal text-normal hover:text-white transition-colors"
                >
                    Back
                </button>
            </div>

            {/* === MIDDLE CONTENT AREA === */}
            <div className="flex-1 relative flex flex-col overflow-hidden z-10">
                {variantView.display && (
                    <div key={variantView.display.id} className={`flex-1 flex flex-col h-full w-full relative ${variantView.isTransitioning ? 'fade-out' : 'fade-in'}`}>
                        <div className="content-fog-bg -z-10 opacity-50"></div>
                        <img src={variantView.display.watermarkUrl} alt="" className="absolute inset-0 m-auto w-1/2 opacity-10 pointer-events-none object-contain" />

                        <div className="flex-1 flex flex-col p-10 overflow-hidden relative z-20">

                            {/* Secondary Nav & Header */}
                            <div className="flex-shrink-0">
                                <h1 className="bebas-header-1 text-white">{variantView.display.name}</h1>
                                <p className="inter-text-normal">{variantView.display.difficultyLevel}</p>

                                <div className="flex border-b border-60-background">
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
                            <div className="flex-1 overflow-y-auto hide-scrollbar pb-10">
                                <div key={tabView.display} className={`h-full w-full ${tabView.isTransitioning ? 'fade-out' : 'fade-in'}`}>
                                    {/* TAB 1: RULES */}
                                    {tabView.display === 'Rules' && (
                                        <div className="flex flex-col gap-1 max-w-2xl">
                                            <p className="inter-text-normal text-normal pt-5">{variantView.display.rulesDescription}</p>
                                            <h3 className="bebas-header-1 text-white">RULES</h3>
                                            {variantView.display.rules.map(rule => (
                                                <div key={rule.id} className="flex flex-col">
                                                    <h4 className="inter-text-normal text-white font-bold mb-1">{rule.title}</h4>
                                                    <p className="inter-text-small text-normal leading-relaxed">{rule.description}</p>

                                                    {rule.bullets && rule.bullets.length > 0 && (
                                                        <ul className="list-disc list-inside inter-text-small text-normal leading-relaxed mt-2 pl-2 flex flex-col gap-1">
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
                                        <div className="flex flex-col gap-[40px]">

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
            <div className="w-[383px] relative z-0 flex-shrink-0">
                <button className="squareBtn">Start Challenge</button>
            </div>
        </div>
    );
};

export default ReviewChallengesPage;
