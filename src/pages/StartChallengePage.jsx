import { useNavigate } from 'react-router-dom';
import { VARIANTS } from '../data/variants';
import '../styles/ChallengesPage.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import {useToast} from "../hooks/ToastContext.jsx";

const StartChallengePage = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    // --- State Management ---
    const variantView = useFadeTransition(VARIANTS[0]);
    const tabView = useFadeTransition('Rules');

    const [masterKillerList, setMasterKillerList] = useState([]);
    const [pastBloodMoneyRuns, setPastBloodMoneyRuns] = useState([]);

    const [seasonPayload, setSeasonPayload] = useState({
        startingGrade: 'ASH_IV',
        inheritedSeasonId: null,
        unlockedKillerIds: []
    });

    // Modal States
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isKillerListExpanded, setIsKillerListExpanded] = useState(false);

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

    // --- Submit to Backend ---
    const submitChallenge = async () => {
        try {
            const requestBody = {
                variantType: variantView.display.id,
                startingGrade: seasonPayload.startingGrade,
                inheritedSeasonId: seasonPayload.inheritedSeasonId,
                unlockedKillerIds: seasonPayload.unlockedKillerIds
            };

            const response = await api.post('/seasons', requestBody);

            addToast("Challenge successfully created!", "success");

            // Navigate to the newly created placeholder page
            navigate(`/current-season/${response.data.id}`);

        } catch (error) {
            console.error("Failed to start season:", error.response?.data?.message || error.message);
            const errorMsg = error.response?.data?.message || "The Entity rejected your request. Try again.";
            addToast(errorMsg, "error");
        }
    };

    return (
        <div className="main-container review-container relative">

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

                            <div className="variant-header">
                                <h1 className="bebas-header-1 title-white">{variantView.display.name}</h1>
                                <p className="inter-text-normal">{variantView.display.difficultyLevel}</p>

                                <div className="secondary-nav-container mt-4">
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

                                    {/* TAB 2: KILLER LIST */}
                                    {/* TODO: Move styles and functionality to include Killer Card */}
                                    {tabView.display === 'Killers' && (
                                        <div className="killers-container">

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

            {/* === RIGHT PANEL (Triggers Confirmation Modal) === */}
            <div className="right-panel">
                <button className="squareBtn" onClick={() => setIsConfirmModalOpen(true)}>Start Challenge</button>
            </div>

            {/* === CONFIRMATION MODAL === */}
            {isConfirmModalOpen && (
                <div className="modal-backdrop fade-in">
                    <div className="modal-content-box confirm-modal">

                        <h2 className="bebas-header-1 title-white modal-title">Confirm Challenge</h2>
                        <div className="modal-divider"></div>

                        <div className="modal-scroll-area hide-scrollbar">
                            <h3 className="bebas-header-1">Variant: <span className="title-iri modal-variant-name">{variantView.display.name}</span></h3>
                            <p className="bebas-header-1">Rules Summary: <span className="modal-variant-name">{variantView.display.rulesDescription}</span></p>
                            <ul className="rules-summary-list">
                                {variantView.display.rulesSummary.map((rule, index) => (
                                    <li key={index}>{rule}</li>
                                ))}
                            </ul>

                            <div className="collapsible-section">
                                <button
                                    className="inter-text-normal title-white collapsible-btn"
                                    onClick={() => setIsKillerListExpanded(!isKillerListExpanded)}
                                >
                                    <span>Included Killers ({seasonPayload.unlockedKillerIds.length})</span>
                                    <span>{isKillerListExpanded ? '▲' : '▼'}</span>
                                </button>

                                <div className={`collapsible-content ${isKillerListExpanded ? 'expanded' : ''}`}>
                                    <ul className="killer-summary-list">
                                        {masterKillerList
                                            .filter(k => seasonPayload.unlockedKillerIds.includes(k.id))
                                            .map(k => (
                                                <li key={k.id} className="inter-text-small text-normal">{k.name}</li>
                                            ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Edit on Left, Start on Right */}
                        <div className="modal-actions">
                            <button className="back-button" onClick={() => setIsConfirmModalOpen(false)}>Edit</button>
                            <button className="squareBtn" onClick={submitChallenge}>Start Challenge</button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default StartChallengePage;
