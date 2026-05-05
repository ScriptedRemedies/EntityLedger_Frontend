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
    const tabView = useFadeTransition('Rules'); // Defaults to Rules

    const [masterKillerList, setMasterKillerList] = useState([]);
    const [pastBloodMoneyRuns, setPastBloodMoneyRuns] = useState([]);

    const [seasonPayload, setSeasonPayload] = useState({
        startingGrade: 'ASH_IV',
        inheritedSeasonId: null,
        unlockedKillerIds: []
    });

    // --- Fetch Master Killer List ---
    useEffect(() => {
        const fetchKillers = async () => {
            try {
                const response = await api.get('/reference-data/killers');
                setMasterKillerList(response.data);

                // Auto-select all killers by default
                const allIds = response.data.map(k => k.id);
                setSeasonPayload(prev => ({ ...prev, unlockedKillerIds: allIds }));
            } catch (error) {
                console.error("Failed to fetch killers:", error);
            }
        };
        fetchKillers();
    }, []);

    // --- Fetch Past Blood Money Runs (For Afterburn) ---
    useEffect(() => {
        if (variantView.display?.id === 'AFTERBURN') {
            const fetchPastRuns = async () => {
                try {
                    const response = await api.get('/seasons/variant/BLOOD_MONEY');
                    const completedRuns = response.data.filter(s => s.status === 'COMPLETED');
                    setPastBloodMoneyRuns(completedRuns);
                } catch (error) {
                    console.error("Failed to fetch past Blood Money runs", error);
                }
            };
            fetchPastRuns();
        }
    }, [variantView.display]);

    // --- Variant Switching Logic ---
    useEffect(() => {
        if (!variantView.display) return;

        // Reset to Rules tab and clear inherited season when switching variants
        tabView.triggerTransition('Rules');
        setSeasonPayload(prev => ({
            ...prev,
            inheritedSeasonId: null
        }));
    }, [variantView.display]);

    // --- Helper to Toggle Killer Selection ---
    const handleToggleKiller = (killerId) => {
        setSeasonPayload(prev => {
            const currentIds = prev.unlockedKillerIds;
            if (currentIds.includes(killerId)) {
                return { ...prev, unlockedKillerIds: currentIds.filter(id => id !== killerId) };
            } else {
                return { ...prev, unlockedKillerIds: [...currentIds, killerId] };
            }
        });
    };

    const handleStartChallenge = async () => {
        try {
            const requestBody = {
                variantType: variantView.display.id,
                startingGrade: seasonPayload.startingGrade,
                inheritedSeasonId: seasonPayload.inheritedSeasonId,
                unlockedKillerIds: seasonPayload.unlockedKillerIds
            };

            const response = await api.post('/seasons', requestBody);
            navigate(`/season/${response.data.id}/roster`);

        } catch (error) {
            console.error("Failed to start season:", error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="main-container review-container">

            {/* === LEFT NAV === */}
            <div className="nav">
                <div className="nav-fog-wrapper">
                    <div className="nav-fog-bg"></div>
                </div>

                <div className="nav-icons-list hide-scrollbar">
                    {VARIANTS.map((v) => (
                        <div key={v.id} className="variantIconContainer" onClick={() => variantView.triggerTransition(v)}>
                            {variantView.active?.id === v.id && (
                                <div className="variantIconActive fade-in"></div>
                            )}
                            <img src={`/assets/Variants/${v.name}.png`} alt={v.name} className="variantIcon" />
                        </div>
                    ))}
                </div>

                <button onClick={() => navigate(-1)} className="back-button">Back</button>
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

                                <div className="secondary-nav-container mt-4">
                                    {/* Changed Settings to Killers */}
                                    {['Rules', 'Killers'].map(tab => (
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
                            <div className="tab-content-wrapper hide-scrollbar mt-6">
                                <div key={tabView.display} className={`tab-content ${tabView.isTransitioning ? 'fade-out' : 'fade-in'}`}>

                                    {/* TAB 1: RULES */}
                                    {tabView.display === 'Rules' && (
                                        <div className="rules-container">
                                            <p className="inter-text-normal rules-description">{variantView.display.rulesDescription}</p>
                                            <h1 className="bebas-header-1 title-white mt-8">RULES</h1>
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

                                    {/* TAB 2: KILLER LIST (Replaces Settings) */}
                                    {tabView.display === 'Killers' && (
                                        <div className="killers-container">

                                            {/* Afterburn Requires the Save Selector */}
                                            {variantView.display.id === 'AFTERBURN' && (
                                                <div className="afterburn-options-container">
                                                    <h3 className="bebas-header-1 title-white">SELECT BLOOD MONEY SAVE</h3>
                                                    <p className="inter-text-small text-normal mb-2">Choose a completed Blood Money run to inherit your remaining killers and funds.</p>

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
                                                                    Blood Money - Ended {new Date(run.endDate).toLocaleDateString()}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            )}

                                            {/* Universal Killer Grid */}
                                            <div className="killer-selection-header">
                                                <div>
                                                    <h1 className="bebas-header-1 title-white">KILLERS</h1>
                                                    <p className="inter-text-small text-normal mt-1">Select the killers you currently own. The Entity will only draw from this pool.</p>
                                                </div>
                                                <div className="killer-actions">
                                                    <button onClick={() => setSeasonPayload(prev => ({...prev, unlockedKillerIds: masterKillerList.map(k => k.id)}))}>Select All</button>
                                                    <button onClick={() => setSeasonPayload(prev => ({...prev, unlockedKillerIds: []}))}>Deselect All</button>
                                                </div>
                                            </div>

                                            <div className="killer-grid hide-scrollbar">
                                                {masterKillerList.map(killer => {
                                                    const isSelected = seasonPayload.unlockedKillerIds.includes(killer.id);
                                                    return (
                                                        <div
                                                            key={killer.id}
                                                            onClick={() => handleToggleKiller(killer.id)}
                                                            className={`killer-card ${isSelected ? 'selected' : 'unselected'}`}
                                                        >
                                                            <img src={`/assets/Killers/${killer.name}.png`} alt={killer.name} className="killer-portrait" />
                                                        </div>
                                                    );
                                                })}
                                            </div>

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
                <button className="squareBtn" onClick={handleStartChallenge}>Start Challenge</button>
            </div>
        </div>
    );
};

export default StartChallengePage;
