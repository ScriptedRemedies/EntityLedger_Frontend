import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { VARIANTS } from '../data/variants';
import '../styles/ChallengesPage.scss';
import {useFadeTransition} from "../hooks/useFadeTranistion.js";

const ReviewChallengesPage = () => {
    const navigate = useNavigate();

    // --- State Management ---
    const variantView = useFadeTransition(VARIANTS[0]);
    const tabView = useFadeTransition('Seasons');

    // Global active season for the right-side character display
    const [activeSeason, setActiveSeason] = useState(null);

    // Data states for the currently selected variant
    const [seasons, setSeasons] = useState([]);
    const [trials, setTrials] = useState([]);
    const [stats, setStats] = useState(null);

    // View states
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [activeTrialOverlay, setActiveTrialOverlay] = useState(null);

    // --- Initial Data Fetch ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const currentSeasonRes = await api.get('/seasons/active');
                console.log(currentSeasonRes);
                if (currentSeasonRes.data) setActiveSeason(currentSeasonRes.data);
            } catch (error) {
                console.error("Failed to load global season data", error);
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
                const [seasonsRes, statsRes] = await Promise.all([
                    api.get(`/seasons/variant/${variantView.display.id}`),
                    api.get(`/seasons/variant/${variantView.display.id}/stats`)
                ]);

                setSeasons(Array.isArray(seasonsRes.data) ? seasonsRes.data : []);
                setStats(statsRes.data);
            } catch (error) {
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

    if (!activeSeason) {
        return (
            <div className="main-container review-container relative flex items-center justify-center">
                <div className="text-center">
                    <h2 className="bebas-header-1 title-white text-2xl animate-pulse">Summoning The Entity...</h2>
                </div>
            </div>
        );
    }

    const [badge, gradeNum] = activeSeason.currentGrade.split("_");

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
                                <h1 className="bebas-header-1 title-white">{variantView.display.name}</h1>
                                <p className="inter-text-normal header-desc">{variantView.display.difficultyLevel}</p>

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
                                            {seasons.map(season => (
                                                <div key={season.id} onClick={() => setSelectedSeason(season)} className="season-card">

                                                    {/* TODO: Need to fix the current season not showing in the season cards */}
                                                    {/* TODO:  */}
                                                    <div className="season-card-hover">
                                                        <p className="season-date">{season.status === 'IN_PROGRESS' ? 'Current' : season.dateCompleted}</p>
                                                        <h3 className="bebas-header-1 title-ash text-center">{season.gradeName}</h3>
                                                        <img src={season.badgeUrl} alt="Grade" className="season-badge" />
                                                        <p className="season-next-grade">Next Grade: {season.nextGradeName}</p>
                                                    </div>

                                                    <div className="season-card-default">
                                                        <p className="season-date-range">{season.dateRange}</p>
                                                        <p className="season-result-label">Result</p>
                                                        <h2 className="bebas-header-1 season-result-title">{getResultTitle(season.gradeName)}</h2>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* TODO: Test trial view */}
                                    {/* TAB 1: TRIALS (List View) */}
                                    {tabView.display === 'Seasons' && selectedSeason && (
                                        <div className="trials-list-container">
                                            <button onClick={() => setSelectedSeason(null)} className="back-to-seasons-btn">← Back to Seasons</button>

                                            <div className="trials-header">
                                                <div className="trials-header-text">
                                                    <h2 className="bebas-header-1">{variantView.display.name} - TRIALS</h2>
                                                    <p className="inter-text-normal trials-header-desc">{variantView.display.difficultyLevel}</p>
                                                    <p className="inter-text-small trials-header-meta">
                                                        <span className="title-white">{selectedSeason.dateRange}</span> | <span className="title-iri uppercase">{selectedSeason.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}</span>
                                                    </p>
                                                </div>
                                                <div className="trials-header-badge">
                                                    <img src={selectedSeason.badgeUrl} alt="Grade" className="season-badge" />
                                                </div>
                                            </div>

                                            <div className="trials-table">
                                                <div className="trials-table-header">
                                                    <div className="table-col-1">Perks</div>
                                                    <div className="table-col-center">Add Ons</div>
                                                    <div className="table-col-center">Survivor Status</div>
                                                    <div className="table-col-right">Grade</div>
                                                </div>

                                                {trials.map(trial => (
                                                    <div key={trial.id} onClick={() => setActiveTrialOverlay(trial)} className="trial-row">

                                                        <div className="trial-killer-info">
                                                            <img src={trial.killer.portraitUrl} alt={trial.killer.name} className="trial-portrait" />
                                                            <div className="trial-killer-details">
                                                                <span className="trial-killer-name">{trial.killer.name}</span>
                                                                <div className="trial-perks-mini">
                                                                    {trial.perks.map(p => <img key={p.id} src={p.iconUrl} className="perk-mini" alt="perk" />)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="trial-addons-mini">
                                                            {trial.addons.map((a, i) => (
                                                                <div key={a.id} className="addon-wrapper">
                                                                    {i > 0 && <span className="addon-plus">+</span>}
                                                                    <img src={a.iconUrl} className="addon-mini" alt="addon" />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="trial-survivors-mini">
                                                            {trial.survivorResults.map((res, i) => (
                                                                <img key={i} src={`/assets/status/${res.toLowerCase()}.png`} className="survivor-status-mini" alt={res} />
                                                            ))}
                                                        </div>

                                                        <div className="trial-grade-col">
                                                            <img src={trial.gradeBadgeUrl} className="grade-mini" alt="grade" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
                                        <div className="stats-container">
                                            <div>
                                                <h3 className="inter-text-small stats-section-title">Core Performance Metrics</h3>
                                                <div className="stats-grid">
                                                    <div className="stat-card">
                                                        <div className="stat-info">
                                                            <span className="stat-label">Trials Played</span>
                                                            <span className="stat-value">{stats.trialsPlayed}</span>
                                                        </div>
                                                    </div>
                                                    <div className="stat-card">
                                                        <div className="stat-info">
                                                            <span className="stat-label">Kill Rate</span>
                                                            <span className="stat-value">{stats.killRate}%</span>
                                                        </div>
                                                        <img src="/assets/icons/skull.png" className="stat-icon" alt="" />
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
            <div className="right-panel">
                {activeSeason && (
                    <>
                        <div className="global-actions">
                            {/* TODO: Add routing */}
                            <button className="squareBtn">Continue</button>
                        </div>

                        <div className="global-season-info">
                            <div className="badge">
                                <img src={`/assets/Grades/${badge}.png`} alt={gradeNum} className="badge-image"/>
                                <p className="gradeNum" style={{ color: `var(--color-${badge})` }}>{gradeNum}</p>
                            </div>
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
                )}
                {/* If there is no current active season then show the start new season button */}
                {!activeSeason && (
                    <>
                        <div className="global-actions">
                            {/* TODO: Add routing */}
                            <button className="sqaureBtn">Start New Challenge</button>
                        </div>
                    </>
                )}
            </div>

            {/* === TRIAL DETAILS OVERLAY === */}
            {activeTrialOverlay && (
                <div className="trial-overlay hide-scrollbar animation-slide-in">

                    <button onClick={() => setActiveTrialOverlay(null)} className="close-overlay-btn">✕</button>

                    <div className="overlay-header">
                        <div className="overlay-header-text">
                            <h2 className="bebas-header-1 title-white">{activeTrialOverlay.killer.name}</h2>
                            <p className="inter-text-small text-muted">Trial #{activeTrialOverlay.trialNumber}</p>
                        </div>
                        <img src={activeTrialOverlay.gradeBadgeUrl} className="overlay-grade-badge" alt="Grade" />
                    </div>

                    <div className="overlay-section">
                        <h4 className="bebas-header-1 section-title">PERKS</h4>
                        <div className="overlay-perks-grid">
                            {activeTrialOverlay.perks.map(p => (
                                <div key={p.id} className="overlay-item">
                                    <img src={p.iconUrl} className="overlay-icon" alt={p.name} />
                                    <span className="overlay-item-name">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overlay-section">
                        <h4 className="bebas-header-1 section-title">ADD ONS</h4>
                        <div className="overlay-addons-flex">
                            {activeTrialOverlay.addons.map((a, i) => (
                                <div key={a.id} className="overlay-addon-wrapper">
                                    {i > 0 && <span className="addon-plus">+</span>}
                                    <div className="overlay-item">
                                        <img src={a.iconUrl} className="overlay-icon" alt={a.name} />
                                        <span className="overlay-item-name">{a.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overlay-section">
                        <h4 className="bebas-header-1 section-title uppercase">SURVIVOR RESULT - {activeTrialOverlay.killCount}K</h4>
                        <div className="overlay-flex-between">
                            {activeTrialOverlay.survivorResults.map((res, i) => (
                                <div key={i} className="overlay-item">
                                    <img src={`/assets/status/${res.toLowerCase()}.png`} className="overlay-icon-sm" alt={res} />
                                    <span className="overlay-item-name">{res}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overlay-section">
                        <h4 className="bebas-header-1 section-title uppercase">EMBLEMS {activeTrialOverlay.pipChange > 0 ? `+${activeTrialOverlay.pipChange} PIPS` : ''}</h4>
                        <div className="overlay-flex-between">
                            {activeTrialOverlay.emblems.map((emb, i) => (
                                <div key={i} className="overlay-item">
                                    <img src={emb.iconUrl} className="overlay-icon drop-shadow" alt={emb.name} />
                                    <span className="overlay-item-name">{emb.name}</span>
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
