import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { VARIANTS } from '../data/variants';
import './ReviewChallengesPage.scss';
import {useFadeTransition} from "../hooks/useFadeTranistion.js";

const ReviewChallengesPage = () => {
    const navigate = useNavigate();

    // --- State Management ---
    const variantView = useFadeTransition(VARIANTS[0]);
    const tabView = useFadeTransition('Trials');

    // Global active season for the right-side character display
    const [globalActiveSeason, setGlobalActiveSeason] = useState(null);

    // Data states for the currently selected variant
    const [seasons, setSeasons] = useState([]);
    const [trials, setTrials] = useState([]);
    const [stats, setStats] = useState(null);

    // View states
    const [selectedSeason, setSelectedSeason] = useState(null); // Switches from Grid to List view
    const [activeTrialOverlay, setActiveTrialOverlay] = useState(null); // The right-side trial detail popup

    // --- Initial Data Fetch ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // We no longer fetch variants here, only the global active season
                const currentSeasonRes = await api.get('/seasons/current');
                if (currentSeasonRes.data) setGlobalActiveSeason(currentSeasonRes.data);
            } catch (error) {
                console.error("Failed to load global season data", error);
            }
        };
        fetchInitialData();
    }, []);

    // --- Variant Selection Fetch ---
    useEffect(() => {
        if (!variantView.display) return;

        // Reset sub-views when switching variants
        setSelectedSeason(null);
        setActiveTrialOverlay(null);
        tabView.triggerTransition('Trials');

        const fetchVariantData = async () => {
            try {
                // Fetch all history/stats tied to this specific variant Enum (e.g., 'STANDARD')
                const [seasonsRes, statsRes] = await Promise.all([
                    api.get(`/variants/${variantView.display.id}/seasons`),
                    api.get(`/variants/${variantView.display.id}/stats`)
                ]);
                setSeasons(seasonsRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Failed to load variant details", error);
            }
        };
        fetchVariantData();
    }, [variantView.display]);

    // --- Season Selection Fetch (Trial Recap) ---
    useEffect(() => {
        if (!selectedSeason) return;

        const fetchTrials = async () => {
            try {
                const trialsRes = await api.get(`/seasons/${selectedSeason.id}/trials`);
                setTrials(trialsRes.data);
            } catch (error) {
                console.error("Failed to load trial history", error);
            }
        };
        fetchTrials();
    }, [selectedSeason]);

    // --- Helper Functions ---
    const getResultTitle = (grade) => {
        if (!grade) return "IN PROGRESS";
        if (grade.includes("ASH") || grade.includes("BRONZE III")) return "THE ENTITY HUNGERS";
        if (grade.includes("BRONZE II") || grade.includes("SILVER")) return "BRUTAL KILLER";
        if (grade.includes("GOLD") || grade.includes("IRIDESCENT II")) return "RUTHLESS KILLER";
        return "MERCILESS KILLER";
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
                                    {['Trials', 'Rules', 'Stats'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => tabView.triggerTransition(tab, () => setSelectedSeason(null))}
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
                                    {/* EMPTY STATE - TRIALS */}
                                    {tabView.display === 'Trials' && seasons.length === 0 && (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="inter-text-normal text-muted">No past or current seasons recorded for this variant.</p>
                                        </div>
                                    )}

                                    {/* EMPTY STATE - STATS */}
                                    {tabView.display === 'Stats' && (!stats || seasons.length === 0) && (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="inter-text-normal text-muted">Complete trials to generate performance stats.</p>
                                        </div>
                                    )}

                                    {/* TAB 1: TRIALS (Grid View) */}
                                    {tabView.display === 'Trials' && !selectedSeason && seasons.length > 0 && (
                                        <div className="flex flex-wrap gap-[60px]">
                                            {seasons.map(season => (
                                                <div key={season.id} onClick={() => setSelectedSeason(season)} className="relative group w-48 h-64 cursor-pointer border border-transparent hover:border-normal transition-all">

                                                    <div className="absolute inset-0 bg-60-background p-4 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <p className="inter-text-small text-muted mb-2">{season.status === 'IN_PROGRESS' ? 'Current' : season.dateCompleted}</p>
                                                        <h3 className="bebas-header-1 text-ash text-center">{season.gradeName}</h3>
                                                        <img src={season.badgeUrl} alt="Grade" className="w-16 h-16 my-2" />
                                                        <p className="inter-text-small text-iri">Next Grade: {season.nextGradeName}</p>
                                                    </div>

                                                    <div className="absolute inset-0 bg-[#0A0A0A] p-4 flex flex-col items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 border border-black">
                                                        <p className="inter-text-small text-muted mb-4">{season.dateRange}</p>
                                                        <p className="inter-text-small text-ash uppercase tracking-widest mb-1">Result</p>
                                                        <h2 className="bebas-header-1 text-iri text-center leading-none">{getResultTitle(season.gradeName)}</h2>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* TAB 1: TRIALS (List View / Trial Recap) */}
                                    {tabView.display === 'Trials' && selectedSeason && (
                                        <div className="flex flex-col">
                                            <button onClick={() => setSelectedSeason(null)} className="self-start text-muted hover:text-white mb-6">← Back to Seasons</button>

                                            <div className="flex justify-between items-center mb-8 border-b border-normal pb-4">
                                                <div>
                                                    <h2 className="bebas-header-1">{variantView.display.name} - TRIALS</h2>
                                                    <p className="inter-text-normal text-muted">{variantView.display.difficultyLevel}</p>
                                                    <p className="inter-text-small mt-2">
                                                        <span className="text-white">{selectedSeason.dateRange}</span> | <span className="text-iri uppercase">{selectedSeason.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}</span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <img src={selectedSeason.badgeUrl} alt="Grade" className="w-16 h-16" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <div className="flex text-muted inter-text-small pb-2 border-b border-60-background px-4">
                                                    <div className="w-1/4">Perks</div>
                                                    <div className="w-1/4 text-center">Add Ons</div>
                                                    <div className="w-1/4 text-center">Survivor Status</div>
                                                    <div className="w-1/4 text-right">Grade</div>
                                                </div>

                                                {trials.map(trial => (
                                                    <div key={trial.id} onClick={() => setActiveTrialOverlay(trial)} className="flex items-center py-4 px-4 border-b border-60-background hover:bg-60-background cursor-pointer transition-colors">
                                                        <div className="w-1/4 flex items-center gap-4">
                                                            <img src={trial.killer.portraitUrl} alt={trial.killer.name} className="w-12 h-12 object-cover border border-normal" />
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-white text-sm uppercase font-bold">{trial.killer.name}</span>
                                                                <div className="flex gap-1">
                                                                    {trial.perks.map(p => <img key={p.id} src={p.iconUrl} className="w-6 h-6" alt="perk" />)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-1/4 flex justify-center gap-2 items-center border-l border-r border-60-background px-2">
                                                            {trial.addons.map((a, i) => (
                                                                <div key={a.id} className="flex items-center gap-2">
                                                                    {i > 0 && <span className="text-muted">+</span>}
                                                                    <img src={a.iconUrl} className="w-8 h-8" alt="addon" />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="w-1/4 flex justify-center gap-2">
                                                            {trial.survivorResults.map((res, i) => (
                                                                <img key={i} src={`/assets/status/${res.toLowerCase()}.png`} className="w-6 h-6" alt={res} />
                                                            ))}
                                                        </div>

                                                        <div className="w-1/4 flex flex-col items-end">
                                                            <img src={trial.gradeBadgeUrl} className="w-8 h-8" alt="grade" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 2: RULES */}
                                    {tabView.display === 'Rules' && (
                                        <div className="flex flex-col gap-8 max-w-2xl">
                                            <p className="inter-text-normal text-muted">{variantView.display.rulesDescription}</p>
                                            <h3 className="bebas-header-1 text-white mt-4">RULES</h3>
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

                                    {/* TAB 3: STATS */}
                                    {tabView.display === 'Stats' && stats && seasons.length > 0 && (
                                        <div className="flex flex-col gap-10">
                                            <div>
                                                <h3 className="inter-text-small text-muted uppercase tracking-widest mb-4">Core Performance Metrics</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-60-background p-4 flex justify-between items-center border-l-2 border-transparent hover:border-ash transition-colors">
                                                        <div className="flex flex-col">
                                                            <span className="inter-text-small text-muted">Trials Played</span>
                                                            <span className="text-white text-xl">{stats.trialsPlayed}</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-60-background p-4 flex justify-between items-center border-l-2 border-transparent hover:border-ash transition-colors">
                                                        <div className="flex flex-col">
                                                            <span className="inter-text-small text-muted">Kill Rate</span>
                                                            <span className="text-white text-xl">{stats.killRate}%</span>
                                                        </div>
                                                        <img src="/assets/icons/skull.png" className="w-6 h-6 opacity-80" alt="" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* === RIGHT PANEL (Static Character Display) === */}
            <div className="w-[383px] relative z-0 flex-shrink-0">
                {globalActiveSeason && (
                    <>
                        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 z-20">
                            <button className="text-normal hover:text-white inter-text-normal border-b border-normal hover:border-white pb-1 transition-all">Continue</button>
                            <button className="text-iri hover:text-white inter-text-normal border-b border-iri hover:border-white pb-1 transition-all mt-2">Start New Challenge</button>
                        </div>

                        <div className="absolute bottom-24 right-6 flex items-center gap-4 z-20">
                            <img src={globalActiveSeason.badgeUrl} alt="Current Grade" className="w-16 h-16 drop-shadow-md" />
                            <div className="flex flex-col text-right">
                                <h3 className="bebas-header-1 text-white leading-none">{globalActiveSeason.characterName}</h3>
                                <p className="inter-text-small text-muted leading-tight">{globalActiveSeason.variantName}</p>
                                <p className="inter-text-small text-normal leading-tight mt-1">{globalActiveSeason.daysLeft} Days Left</p>
                            </div>
                        </div>

                        <img
                            src={globalActiveSeason.characterImageUrl}
                            alt={globalActiveSeason.characterName}
                            className="absolute bottom-0 right-0 w-full h-[85%] object-cover object-bottom pointer-events-none -z-10"
                            style={{ filter: 'brightness(0.8)' }}
                        />
                    </>
                )}
            </div>

            {/* === TRIAL DETAILS OVERLAY === */}
            {activeTrialOverlay && (
                <div className="absolute top-0 right-0 w-[400px] h-full bg-full-background border-l-2 border-black z-50 p-8 shadow-2xl overflow-y-auto hide-scrollbar flex flex-col animation-slide-in">

                    <button onClick={() => setActiveTrialOverlay(null)} className="absolute top-4 right-4 text-normal hover:text-white">✕</button>

                    <div className="flex justify-between items-start border-b border-60-background pb-6 mb-6">
                        <div className="flex flex-col">
                            <h2 className="bebas-header-1 text-white">{activeTrialOverlay.killer.name}</h2>
                            <p className="inter-text-small text-muted">Trial #{activeTrialOverlay.trialNumber}</p>
                        </div>
                        <img src={activeTrialOverlay.gradeBadgeUrl} className="w-12 h-12" alt="Grade" />
                    </div>

                    <div className="mb-6">
                        <h4 className="bebas-header-1 text-normal mb-4">PERKS</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {activeTrialOverlay.perks.map(p => (
                                <div key={p.id} className="flex flex-col items-center text-center gap-2">
                                    <img src={p.iconUrl} className="w-10 h-10" alt={p.name} />
                                    <span className="text-[10px] text-muted leading-tight">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="bebas-header-1 text-normal mb-4">ADD ONS</h4>
                        <div className="flex gap-4 items-start">
                            {activeTrialOverlay.addons.map((a, i) => (
                                <div key={a.id} className="flex items-center gap-4">
                                    {i > 0 && <span className="text-muted self-center mt-2">+</span>}
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <img src={a.iconUrl} className="w-10 h-10" alt={a.name} />
                                        <span className="text-[10px] text-muted leading-tight">{a.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="bebas-header-1 text-normal mb-4 text-uppercase">SURVIVOR RESULT - {activeTrialOverlay.killCount}K</h4>
                        <div className="flex justify-between">
                            {activeTrialOverlay.survivorResults.map((res, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-2">
                                    <img src={`/assets/status/${res.toLowerCase()}.png`} className="w-8 h-8" alt={res} />
                                    <span className="text-[10px] text-muted">{res}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="bebas-header-1 text-normal mb-4 text-uppercase">EMBLEMS {activeTrialOverlay.pipChange > 0 ? `+${activeTrialOverlay.pipChange} PIPS` : ''}</h4>
                        <div className="flex justify-between">
                            {activeTrialOverlay.emblems.map((emb, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-2">
                                    <img src={emb.iconUrl} className="w-10 h-10 drop-shadow-md" alt={emb.name} />
                                    <span className="text-[10px] text-muted">{emb.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ReviewChallengesPage;
