import React from 'react';
import { useNavigate } from 'react-router-dom';
import GradeBadgeDisplay from './GradeBadgeDisplay';
import '../styles/TrialConfirmation.scss';
import '../styles/ChallengesPage.scss';

const SeasonRecapOverlay = ({ season, recapData, actionText, onAction }) => {
    const navigate = useNavigate();

    // --- LOCAL REDUCER MATH ---
    const totalMatches = recapData.finalTrials.length;
    let totalKills = 0;
    let totalPips = 0;
    const killerStats = {};

    // Crunch the numbers for the whole season
    recapData.finalTrials.forEach(t => {
        totalPips += t.pipProgression;

        // Count specific kills for this trial
        const kills = t.survivors.filter(s => s.outcome === 'SACRIFICED' || s.outcome === 'KILLED').length;
        totalKills += kills;

        // Group stats by killer for MVP/LVP calculation
        if (!killerStats[t.killer.name]) {
            killerStats[t.killer.name] = { name: t.killer.name, matches: 0, kills: 0, pips: 0 };
        }
        killerStats[t.killer.name].matches += 1;
        killerStats[t.killer.name].kills += kills;
        killerStats[t.killer.name].pips += t.pipProgression;
    });

    const killRate = totalMatches > 0 ? Math.round((totalKills / (totalMatches * 4)) * 10.0) : 0;

    // Find Best/Worst Performer (Primary: Pips, Secondary: Kill Rate)
    const sortedKillers = Object.values(killerStats).sort((a, b) => {
        if (b.pips !== a.pips) return b.pips - a.pips; // Sort by highest pips
        return (b.kills / b.matches) - (a.kills / a.matches); // Tie-breaker: average kills
    });

    const mvp = sortedKillers.length > 0 ? sortedKillers[0] : null;
    const lvp = sortedKillers.length > 1 ? sortedKillers[sortedKillers.length - 1] : null;

    // Determine Theme based on Win/Loss
    const lastTrial = recapData.finalTrials[recapData.finalTrials.length - 1];
    const killerDied = lastTrial.survivors.some(s => s.outcome === 'ESCAPED');
    const reachedIri1 = lastTrial.resultingGrade === 'IRIDESCENT_I';

    const isVictory = recapData.status === 'COMPLETED' && (!killerDied || reachedIri1);

    const headerTitle = isVictory ? "CHALLENGE COMPLETED" : "ROSTER DECIMATED";
    const headerColor = isVictory ? "title-white" : "title-iri";
    const subTitle = isVictory ? "The Entity is sated... for now." : "The fog claims another victim.";

    return (
        <div className="trial-confirmation-overlay fade-in" style={{ zIndex: 1000 }}>
            {/* Darker fog for a more dramatic ending */}
            <div className="login-fog-bg" style={{ opacity: 0.9 }}></div>

            <div className="confirmation-content hide-scrollbar" style={{ width: '80vw', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>

                {/* DYNAMIC HEADER */}
                <div className="confirm-header" style={{ borderBottom: '1px solid var(--color-60-background)', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 className={`bebas-header-1 ${headerColor}`} style={{ fontSize: '3.5rem' }}>{headerTitle}</h1>
                        <p className="inter-text-normal text-muted uppercase">{subTitle}</p>
                    </div>
                </div>

                {/* FINAL STATS GRID (Reusing your awesome Stats CSS!) */}
                <div className="stats-container mb-8">
                    <h3 className="bebas-header-2 stats-section-title">FINAL SEASON METRICS</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-info">
                                <span className="stat-label">Total Trials Survived</span>
                                <span className="stat-value">{totalMatches}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-info">
                                <span className="stat-label">Overall Kill Rate</span>
                                <span className="stat-value">{killRate}%</span>
                            </div>
                            <img src="/assets/Survivor Status/sacrificed.png" className="stat-icon" alt="Sacrificed" />
                        </div>
                        <div className="stat-card">
                            <div className="stat-info">
                                <span className="stat-label">Net Pip Progression</span>
                                <span className="stat-value">{totalPips > 0 ? `+${totalPips}` : totalPips} Pips</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-info">
                                <span className="stat-label">Final Grade Reached</span>
                                <span className="stat-value">{season.currentGrade.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MVP / LVP SHOWCASE */}
                <div className="confirm-loadout-row" style={{ justifyContent: 'center', gap: '40px', marginBottom: '40px' }}>
                    {mvp && (
                        <div className="confirm-column" style={{ alignItems: 'center' }}>
                            <h3 className="bebas-header-2 text-white">MOST VALUABLE KILLER</h3>
                            <div className="staggered-fade confirm-slot killer-slot mt-2" style={{ animationDelay: '0.4s' }}>
                                <img src={`/assets/Killers/${mvp.name}.png`} alt={mvp.name} />
                            </div>
                            <p className="inter-text-small mt-2 text-muted">{mvp.name}</p>
                            <p className="inter-text-small title-iri">+{mvp.pips} Pips</p>
                        </div>
                    )}

                    {lvp && (
                        <div className="confirm-column" style={{ alignItems: 'center' }}>
                            <h3 className="bebas-header-2 text-muted">WEAKEST LINK</h3>
                            <div className="staggered-fade confirm-slot killer-slot mt-2" style={{ animationDelay: '0.6s', filter: 'grayscale(100%) brightness(0.5)' }}>
                                <img src={`/assets/Killers/${lvp.name}.png`} alt={lvp.name} />
                            </div>
                            <p className="inter-text-small mt-2 text-muted">{lvp.name}</p>
                            <p className="inter-text-small text-muted">{lvp.pips > 0 ? `+${lvp.pips}` : lvp.pips} Pips</p>
                        </div>
                    )}
                </div>

                {/* EXIT STRATEGY */}
                <div className="confirm-actions" style={{ justifyContent: 'center', borderTop: 'none' }}>
                    {/* Replaced the hardcoded navigate with our dynamic props */}
                    <button className="squareBtn" onClick={onAction}>
                        {actionText}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SeasonRecapOverlay;
