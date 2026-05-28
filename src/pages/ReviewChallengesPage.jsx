import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { VARIANTS } from '../data/variants';
import '../styles/ChallengesPage.scss';
import '../styles/small-components/TrialComponent.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import GradeBadgeDisplay from './small-components/GradeBadgeDisplay.jsx';
import TrialListTable from './small-components/TrialListTable.jsx';
import TrialDetailsOverlay from './overlays/TrialDetailsOverlay';
import SeasonRecapOverlay from './overlays/SeasonRecapOverlay';

// === SEASON STATUS MESSAGES ===
const STATUS_MESSAGES = {
    IN_PROGRESS: <><span className="bebas-header-2 title-iri">IN PROGRESS</span></>,
    COMPLETED: <><span className="bebas-header-2 title-iri">COMPLETED</span></>,
    FAILED_TIME: <><span className="bebas-header-2 title-iri">FAILED</span> - Ran out of time</>,
    FAILED_ROSTER: <><span className="bebas-header-2 title-iri">FAILED</span> - Empty Roster</>
}

const ReviewChallengesPage = () => {
    const navigate = useNavigate();

    // --- State Management ---
    const variantView = useFadeTransition(VARIANTS[0]);
    const tabView = useFadeTransition('Seasons');

    // Global active season for the right-side character display
    const [activeSeason, setActiveSeason] = useState(null);

    // Dedicated loading state
    const [isLoading, setIsLoading] = useState(true);

    // Data states for the currently selected variant
    const [seasons, setSeasons] = useState([]);
    const [trials, setTrials] = useState([]);
    const [stats, setStats] = useState(null);

    // View states
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [activeTrialOverlay, setActiveTrialOverlay] = useState(null);
    const [showRecapOverlay, setShowRecapOverlay] = useState(false);

    // --- Initial Data Fetch ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const currentSeasonRes = await api.get('/seasons/active');
                if (currentSeasonRes.data) {
                    setActiveSeason(currentSeasonRes.data);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // TODO: Set error
                    setActiveSeason(null);
                } else {
                    // TODO: Set error
                    console.error("Failed to load global season data", error);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // --- Variant Selection Fetch ---
    useEffect(() => {
        if (!variantView.display) return;

        setSelectedSeason(null);
        setActiveTrialOverlay(null);
        tabView.triggerTransition('Seasons');

        const fetchVariantData = async () => {
            try {
                const variantName = variantView.display.name.toUpperCase();

                const [seasonsRes, statsRes] = await Promise.all([
                    api.get(`/seasons/variant/${variantName}`),
                    api.get(`/seasons/variant/${variantName}/stats`)
                ]);

                const rawSeasons = Array.isArray(seasonsRes.data) ? seasonsRes.data : [];

                const GRADE_PROGRESSION = [
                    "ASH_IV", "ASH_III", "ASH_II", "ASH_I",
                    "BRONZE_IV", "BRONZE_III", "BRONZE_II", "BRONZE_I",
                    "SILVER_IV", "SILVER_III", "SILVER_II", "SILVER_I",
                    "GOLD_IV", "GOLD_III", "GOLD_II", "GOLD_I",
                    "IRIDESCENT_IV", "IRIDESCENT_III", "IRIDESCENT_II", "IRIDESCENT_I"
                ];

                const formattedSeasons = rawSeasons.map(season => {
                    const currentGradeRaw = season.currentGrade || "ASH_IV";

                    const currentIndex = GRADE_PROGRESSION.indexOf(currentGradeRaw);
                    const nextGradeName = currentIndex !== -1 && currentIndex < GRADE_PROGRESSION.length - 1
                        ? GRADE_PROGRESSION[currentIndex + 1].replace("_", " ")
                        : "MAX RANK";

                    let maxPips = 5;
                    if (currentGradeRaw.startsWith("ASH")) maxPips = 3;
                    else if (currentGradeRaw.startsWith("BRONZE")) maxPips = 4;

                    const start = new Date(season.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const completed = season.endDate ? new Date(season.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Current';

                    return {
                        ...season,
                        status: season.status === 'ACTIVE' ? 'IN_PROGRESS' : season.status,
                        gradeName: currentGradeRaw.replace("_", " "),
                        currentGradeRaw: currentGradeRaw,
                        seasonPips: season.currentPips || 0,
                        maxPips: maxPips,
                        nextGradeName: nextGradeName,
                        dateRange: `${start} - ${completed}`,
                        dateStarted: start,
                        dateCompleted: completed
                    };
                });

                setSeasons(formattedSeasons);
                setStats(statsRes.data);
            } catch (error) {
                // TODO: Set error
                console.error("Failed to load variant details", error);
                setSeasons([]);
            }
        };
        fetchVariantData();
    }, [variantView.display]);

    // --- Season Selection Fetch ---
    useEffect(() => {
        if (!selectedSeason) return;

        const fetchTrials = async () => {
            try {
                const trialsRes = await api.get(`/seasons/${selectedSeason.id}/trials`);
                setTrials(trialsRes.data);
            } catch (error) {
                // TODO: Handle error
                console.error("Failed to load trial history", error);
            }
        };
        fetchTrials();
    }, [selectedSeason]);

    const getResultTitle = (grade) => {
        if (!grade) return "IN PROGRESS";
        if (grade.includes("ASH") || grade.includes("BRONZE III")) return "THE ENTITY HUNGERS";
        if (grade.includes("BRONZE II") || grade.includes("SILVER")) return "BRUTAL KILLER";
        if (grade.includes("GOLD") || grade.includes("IRIDESCENT II")) return "RUTHLESS KILLER";
        return "MERCILESS KILLER";
    };

    if (isLoading) {
        return (
            <div className="main-container review-container relative flex items-center justify-center">
                <div className="text-center">
                    <h2 className="bebas-header-1 title-white text-2xl animate-pulse">Summoning The Entity...</h2>
                </div>
            </div>
        );
    }

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
                        <img src={`/assets/Variants/${variantView.display.name}.png`} alt="" className="variant-watermark" />

                        <div className="variant-content-area">

                            <div className="variant-header">
                                <h1 className="bebas-header-1 title-white">
                                    {variantView.display.name}
                                    {tabView.display === 'Seasons' && selectedSeason && " - MATCHES"}
                                </h1>
                                <p className="inter-text-normal header-desc">{variantView.display.difficultyLevel}</p>

                                {!selectedSeason && (
                                    <div className="secondary-nav-container">
                                        {['Seasons', 'Rules', 'Stats'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => tabView.triggerTransition(tab, () => setSelectedSeason(null))}
                                                className={`inter-text-normal secondaryNav ${tabView.active === tab ? 'secondaryNavIndicator' : ''}`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="tab-content-wrapper hide-scrollbar">
                                <div key={tabView.display} className={`tab-content ${tabView.isTransitioning ? 'fade-out' : 'fade-in'}`}>

                                    {/* EMPTY STATES */}
                                    {tabView.display === 'Seasons' && seasons.length === 0 && (
                                        <div className="empty-state-container">
                                            <p className="inter-text-normal">No past or current seasons recorded for this variant.</p>
                                        </div>
                                    )}
                                    {tabView.display === 'Stats' && (!stats || seasons.length === 0) && (
                                        <div className="empty-state-container">
                                            <p className="inter-text-normal">Complete trials to generate performance stats.</p>
                                        </div>
                                    )}

                                    {/* TAB 1: SEASONS (Grid View) */}
                                    {tabView.display === 'Seasons' && !selectedSeason && seasons.length > 0 && (
                                        <div className="seasons-grid">
                                            {seasons.map(season => {
                                                const [badge, gradeNum] = (season.currentGrade).split("_");
                                                return (
                                                    <div key={season.id} onClick={() => setSelectedSeason(season)} className="season-card">
                                                        <div className="season-card-base">
                                                            <p className="season-date inter-text-small text-muted">{season.status === 'IN_PROGRESS' ? 'Current' : season.dateRange}</p>
                                                            <h3 className="bebas-header-2 text-center" style={{ color: `var(--color-${badge})` }}>{season.gradeName}</h3>
                                                            <GradeBadgeDisplay rawGrade={season.currentGradeRaw} pips={season.seasonPips} />
                                                            <p className="season-next-grade inter-text-small">Next Grade</p>
                                                            <p style={{ color: `var(--color-${season.nextGradeName.split(" ")})` }}>{season.nextGradeName}</p>
                                                        </div>
                                                        {season.status !== "IN_PROGRESS" && (
                                                            <div className="season-card-overlay">
                                                                <p className="season-result-label text-size-normal text-muted uppercase">Result</p>
                                                                <h2 className="bebas-header-1 season-result-title">{getResultTitle(season.gradeName)}</h2>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* TAB 1: TRIALS (List View) */}
                                    {tabView.display === 'Seasons' && selectedSeason && (
                                        <div className="trials-list-container">
                                            <div className="trials-header">
                                                <div className="trials-header-text">
                                                    <p className="inter-text-normal">{selectedSeason.dateRange}</p>
                                                    <p className="inter-text-normal">
                                                        {STATUS_MESSAGES[selectedSeason.status] || "UNKNOWN STATUS"}
                                                    </p>
                                                    {selectedSeason.status !== 'IN_PROGRESS' && (
                                                        <button className="season-recap-btn" onClick={() => setShowRecapOverlay(true)}>
                                                            View Season Recap
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="trials-header-badge">
                                                    <GradeBadgeDisplay rawGrade={selectedSeason.currentGradeRaw} pips={selectedSeason.seasonPips} />
                                                </div>
                                            </div>

                                            <TrialListTable
                                                trials={trials}
                                                variantType={selectedSeason.variantType}
                                                onRowClick={setActiveTrialOverlay}
                                            />

                                            <button onClick={() => setSelectedSeason(null)} className="back-button mt-2">Back</button>

                                        </div>
                                    )}

                                    {/* TAB 2: RULES */}
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

                                    {/* TAB 3: STATS */}
                                    {tabView.display === 'Stats' && stats && seasons.length > 0 && (
                                        <div className="stats-container pb-10">

                                            <div className="mb-6">
                                                <h1 className="bebas-header-1 title-white">{variantView.display.name} REPORT</h1>
                                                <p className="inter-text-normal">Statistics pulled from every game in this challenge.</p>
                                            </div>

                                            {/* CORE METRICS */}
                                            <div className="stats-section mb-8">
                                                <h3 className="bebas-header-2 stats-section-title">CORE PERFORMANCE METRICS</h3>
                                                <div className="stats-grid-cols">

                                                    {/* Left Column */}
                                                    <div className="stats-col">
                                                        <div className="stat-card">
                                                            <div className="stat-info">
                                                                <span className="stat-label">Trials Completed</span>
                                                                <span className="stat-value">{stats.matchesPlayed}</span>
                                                            </div>
                                                        </div>
                                                        <div className="stat-card">
                                                            <div className="stat-info">
                                                                <span className="stat-label">4K Rate</span>
                                                                <span className="stat-value">{stats.fourKRate}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="stat-card">
                                                            <div className="stat-info">
                                                                <span className="stat-label">Losses</span>
                                                                <span className="stat-value">{stats.lossRate}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="stat-card">
                                                            <div className="stat-info">
                                                                <span className="stat-label">2K-3K Via Exit Gates</span>
                                                                <span className="stat-value">{stats.twoToThreeKillsWithGates}</span>
                                                            </div>
                                                            <img src="/assets/Survivor Status/escaped.png" className="stat-icon" alt="Gate" />
                                                        </div>
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="stats-col">
                                                        <div className="stat-card">
                                                            <div className="stat-info">
                                                                <span className="stat-label">Kill Rate</span>
                                                                <span className="stat-value">{stats.killRate}%</span>
                                                            </div>
                                                            <img src="/assets/Survivor Status/sacrificed.png" className="stat-icon" alt="Sacrificed" />
                                                        </div>
                                                        <div className="stat-card">
                                                            <div className="stat-info">
                                                                <span className="stat-label">Pip Progression</span>
                                                                <span className="stat-value">{stats.pipProgression > 0 ? `+${stats.pipProgression}` : stats.pipProgression} Pips</span>
                                                            </div>
                                                        </div>
                                                        <div className="stat-card">
                                                            <div className="stat-info">
                                                                <span className="stat-label">Hatch Escapes</span>
                                                                <span className="stat-value">{stats.hatchEscapeRate}%</span>
                                                            </div>
                                                            <img src="/assets/Survivor Status/hatch_escape.png" className="stat-icon" alt="Hatch" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* META & LOADOUT TENDENCIES */}
                                            <div className="stats-section mb-8">
                                                <h3 className="bebas-header-2 stats-section-title">META & LOADOUT TENDENCIES</h3>
                                                <div className="stats-grid">
                                                    {stats.topPerks?.map((perk, i) => (
                                                        <div key={i} className="stat-card">
                                                            <div className="stat-info">
                                                                <span className="stat-value inter-text-normal text-normal">{perk.name}</span>
                                                                <span className="stat-label">{perk.pickRate}% Pick Rate</span>
                                                            </div>
                                                            <div className="stat-perk-diamond">
                                                                <img src={`/assets/Perks/${perk.name}.png`} alt={perk.name} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* EMBLEMS */}
                                            <div className="stats-section">
                                                <h3 className="bebas-header-2 stats-section-title">EMBLEMS</h3>
                                                <div className="stats-grid">
                                                    {stats.iridescentEmblems?.map((emblem, i) => (
                                                        <div key={i} className="stat-card">
                                                            <div className="stat-info">
                                                                {/* Formats GATEKEEPER to Gatekeeper */}
                                                                <span className="stat-value inter-text-normal text-normal capitalize">
                                                                    {emblem.category.charAt(0) + emblem.category.slice(1).toLowerCase()}
                                                                </span>
                                                                <span className="stat-label">{emblem.rate}%</span>
                                                            </div>
                                                            <img src={`/assets/Emblems/${emblem.category}_IRIDESCENT.png`} className="stat-emblem-icon drop-shadow" alt={emblem.category} />
                                                        </div>
                                                    ))}
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
            <div className="right-panel">
                {activeSeason ? (
                    <>
                        <div className="global-actions">
                            <button className="squareBtn" onClick={() => navigate(`/current-season/${activeSeason.seasonId}`)}>Continue</button>
                        </div>

                        <div className="global-season-info">
                            <GradeBadgeDisplay
                                rawGrade={activeSeason.currentGrade}
                                pips={activeSeason.currentPips}
                                size="normal"
                            />
                            <div className="global-season-text">
                                <h3 className="bebas-header-1 global-character-name">{activeSeason.characterName}</h3>
                                <p className="inter-text-small">{activeSeason.variantType}</p>
                                <p className="inter-text-small global-days-left">{activeSeason.daysLeft} Days Left</p>
                            </div>
                        </div>

                        <img
                            src={activeSeason.characterImageUrl}
                            alt={activeSeason.characterName}
                            className="global-character-bg"
                        />
                    </>
                ) : (
                    <div className="global-actions">
                        <button className="squareBtn" onClick={() => navigate('/start-challenge')}>Start New Challenge</button>
                    </div>
                )}
            </div>

            {/* === TRIAL DETAILS OVERLAY === */}
            <TrialDetailsOverlay
                trial={activeTrialOverlay}
                onClose={() => setActiveTrialOverlay(null)}
            />

            {/* === SEASON RECAP OVERLAY === */}
            {showRecapOverlay && selectedSeason && (
                <SeasonRecapOverlay
                    season={{ ...selectedSeason, currentGrade: selectedSeason.currentGradeRaw }}
                    recapData={{ status: selectedSeason.status, finalTrials: trials }}
                    actionText="Back"
                    onAction={() => setShowRecapOverlay(false)}
                />
            )}
        </div>
    );
};

export default ReviewChallengesPage;
