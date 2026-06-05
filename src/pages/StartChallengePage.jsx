import { VARIANTS } from '../data/variants';
import '../styles/ChallengesPage.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useToast } from "../hooks/ToastContext.jsx";
import KillerCard from "./small-components/KillerCard.jsx";
import SeasonCard from "./small-components/SeasonCard.jsx";
import {useCinematicNavigate} from "../hooks/NavigationContext.jsx";

const StartChallengePage = () => {
    const navigate = useCinematicNavigate();
    const { addToast } = useToast();

    // --- State Management ---
    const variantView = useFadeTransition(VARIANTS[0]);
    const tabView = useFadeTransition('Rules');

    const [masterKillerList, setMasterKillerList] = useState([]);
    const [pastBloodMoneyRuns, setPastBloodMoneyRuns] = useState([]);

    // --- NEW: State to hold the roster of the selected past run ---
    const [selectedPastRoster, setSelectedPastRoster] = useState([]);

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

    // --- NEW: Extract the roster when a past season is clicked ---
    useEffect(() => {
        if (variantView.display?.id === 'AFTERBURN' && seasonPayload.inheritedSeasonId) {
            const run = pastBloodMoneyRuns.find(r => r.id === seasonPayload.inheritedSeasonId);
            if (run) {
                // Depending on your Spring Boot serialization, it might be 'rosters' or 'roster'
                const rosterData = run.rosters || run.roster || [];
                setSelectedPastRoster(rosterData);
            }
        }
    }, [seasonPayload.inheritedSeasonId, pastBloodMoneyRuns, variantView.display]);

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
            const cleanUnlockedIds = variantView.display.id === 'AFTERBURN'
                ? selectedPastRoster.filter(r => r.status === 'AVAILABLE').map(r => r.killer?.id || r.killerId)
                : seasonPayload.unlockedKillerIds;

            const requestBody = {
                variantType: variantView.display.id,
                startingGrade: seasonPayload.startingGrade,
                inheritedSeasonId: seasonPayload.inheritedSeasonId,
                unlockedKillerIds: cleanUnlockedIds
            };

            const response = await api.post('/seasons', requestBody);

            addToast("Challenge successfully created!", "success");
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

                            <div className="tab-content-wrapper hide-scrollbar mt-3">
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
                                    {tabView.display === 'Killers' && (
                                        <div className="killers-container">

                                            {/* --- NEW: Horizontal Scrollable Season Cards --- */}
                                            {variantView.display.id === 'AFTERBURN' && (
                                                <div className="afterburn-options-container">
                                                    <h3 className="bebas-header-1 title-white">SELECT BLOOD MONEY SAVE</h3>
                                                    <p className="inter-text-small text-normal">Choose a completed Blood Money run to inherit your remaining killers and funds.</p>

                                                    {pastBloodMoneyRuns.length === 0 ? (
                                                        <div className="error-box">
                                                            No completed Blood Money runs found. You must complete a Blood Money season before attempting Afterburn.
                                                        </div>
                                                    ) : (
                                                        <div className="flex overflow-x-auto gap-6  hide-scrollbar w-full">
                                                            {pastBloodMoneyRuns.map(run => {
                                                                const isSelected = seasonPayload.inheritedSeasonId === run.id;
                                                                return (
                                                                    <div
                                                                        key={run.id}
                                                                        onClick={() => setSeasonPayload({ ...seasonPayload, inheritedSeasonId: run.id })}
                                                                        className="cursor-pointer transition-all duration-200 ease-in-out"
                                                                        style={{
                                                                            width: '202px', // Matches the SeasonCard's native CSS width
                                                                            border: `1px solid ${isSelected ? 'white' : 'transparent'}`,
                                                                        }}
                                                                    >
                                                                        <SeasonCard season={run} onClick={() => {}} hideOverlay={true} />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="killer-selection-header">
                                                <div>
                                                    <h1 className="bebas-header-1 title-white">KILLERS</h1>
                                                    {variantView.display.id === 'AFTERBURN' ? (
                                                        <p className="inter-text-small text-normal">Review the surviving roster from your selected Blood Money run.</p>
                                                    ) : (
                                                        <p className="inter-text-small text-normal">Select the killers you currently own. The Entity will only draw from this pool.</p>
                                                    )}
                                                </div>

                                                {/* --- NEW: Hide action buttons if in Afterburn --- */}
                                                {variantView.display.id !== 'AFTERBURN' && (
                                                    <div className="killer-actions">
                                                        <button onClick={() => setSeasonPayload(prev => ({...prev, unlockedKillerIds: masterKillerList.map(k => k.id)}))}>Select All</button>
                                                        <button onClick={() => setSeasonPayload(prev => ({...prev, unlockedKillerIds: []}))}>Deselect All</button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="killer-grid hide-scrollbar">
                                                {variantView.display.id === 'AFTERBURN' ? (
                                                    // --- NEW: Display the Past Season Roster ---
                                                    (!seasonPayload.inheritedSeasonId) ? (
                                                        <></>
                                                    ) : (
                                                        selectedPastRoster.length > 0 ? selectedPastRoster.map(rosterItem => {
                                                            // Handle nested objects depending on how your backend serializes the roster
                                                            const kInfo = rosterItem.killer || rosterItem;
                                                            return (
                                                                <KillerCard
                                                                    key={kInfo.id || kInfo.killerId}
                                                                    killer={{
                                                                        killerName: kInfo.name || kInfo.killerName,
                                                                        cost: kInfo.cost,
                                                                        status: rosterItem.status // Pass the historical status!
                                                                    }}
                                                                    variantType="BLOOD_MONEY" // Forces prices to show
                                                                    mode="active"             // Forces DEAD/SOLD styling to show
                                                                    isSelected={rosterItem.status === 'AVAILABLE'} // Available killers look selected
                                                                    onSelect={() => {}}       // Disabled interaction
                                                                />
                                                            );
                                                        }) : <p className="inter-text-normal text-muted mt-4">Loading roster...</p>
                                                    )
                                                ) : (
                                                    // --- STANDARD: Master Killer List ---
                                                    masterKillerList.map(killer => {
                                                        const isSelected = seasonPayload.unlockedKillerIds.includes(killer.id);
                                                        return (
                                                            <KillerCard
                                                                key={killer.id}
                                                                killer={{ ...killer, killerName: killer.name }}
                                                                mode="review"
                                                                variantType={variantView.display.id}
                                                                isSelected={isSelected}
                                                                onSelect={() => handleToggleKiller(killer.id)}
                                                            />
                                                        );
                                                    })
                                                )}
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
                            {(variantView.display.id === 'BLOOD_MONEY' || variantView.display.id === 'AFTERBURN') && (
                                <p className="bebas-header-1">Starting Balance: <span className="title-iri modal-variant-name">
                                    ${variantView.display.id === 'BLOOD_MONEY'
                                        ? 20
                                        : pastBloodMoneyRuns.find(run => run.id === seasonPayload.inheritedSeasonId)?.variantState?.balance || 0}
                                </span></p>
                            )}
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
                                    <span>Included Killers ({variantView.display.id === 'AFTERBURN' ? selectedPastRoster.filter(r => r.status === 'AVAILABLE').length : seasonPayload.unlockedKillerIds.length})</span>
                                    <span>{isKillerListExpanded ? '▲' : '▼'}</span>
                                </button>

                                <div className={`collapsible-content ${isKillerListExpanded ? 'expanded' : ''}`}>
                                    <ul className="killer-summary-list">
                                        {variantView.display.id === 'AFTERBURN' ? (
                                            selectedPastRoster
                                                .filter(r => r.status === 'AVAILABLE')
                                                .map(r => (
                                                    <li key={r.killer?.id || r.killerId} className="inter-text-small text-normal">
                                                        {r.killer?.name || r.killerName}
                                                    </li>
                                                ))
                                        ) : (
                                            masterKillerList
                                                .filter(k => seasonPayload.unlockedKillerIds.includes(k.id))
                                                .map(k => (
                                                    <li key={k.id} className="inter-text-small text-normal">{k.name}</li>
                                                ))
                                        )}
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
