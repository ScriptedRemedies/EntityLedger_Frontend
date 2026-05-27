import React, { useState } from 'react';
import GradeBadgeDisplay from '../small-components/GradeBadgeDisplay';
import TrialListTable from '../small-components/TrialListTable';
import TrialDetailsOverlay from './TrialDetailsOverlay';
import '../../styles/overlays/TrialConfirmation.scss';
import '../../styles/ChallengesPage.scss';
import '../../styles/overlays/SeasonRecapOverlay.scss';

const SeasonRecapOverlay = ({ season, recapData, actionText, onAction }) => {

    // --- VIEW STATES ---
    const [activeTab, setActiveTab] = useState('Stats'); // Default view
    const [activeTrialOverlay, setActiveTrialOverlay] = useState(null);

    // --- AGGRESSIVE FRONTEND MATH ---
    const totalMatches = recapData.finalTrials.length;
    let totalKills = 0;
    let totalPips = 0;
    let fourKCount = 0;
    let lossCount = 0;
    let twoToThreeKWithGates = 0;
    let hatchEscapesCount = 0;

    const killerStats = {};
    const perkCounts = {};
    const emblemCounts = { GATEKEEPER: 0, DEVOUT: 0, MALICIOUS: 0, CHASER: 0 };

    // Crunch the numbers for the whole season in one loop
    recapData.finalTrials.forEach(t => {
        totalPips += t.pipProgression;

        const kills = t.survivors.filter(s => s.outcome === 'SACRIFICED' || s.outcome === 'KILLED').length;
        const escapes = t.survivors.filter(s => s.outcome === 'ESCAPED').length;
        const hatches = t.survivors.filter(s => s.outcome === 'HATCH_ESCAPE').length;

        totalKills += kills;

        if (kills === 4) fourKCount++;
        if (kills <= 1) lossCount++;
        if ((kills === 2 || kills === 3) && escapes > 0) twoToThreeKWithGates++;
        if (hatches > 0) hatchEscapesCount++;

        if (!killerStats[t.killer.name]) {
            killerStats[t.killer.name] = {
                name: t.killer.name,
                matches: 0,
                kills: 0,
                pips: 0,
                fourKs: 0,
                gateEscapes: 0,
                hatchEscapes: 0,
                losses: 0
            };
        }
        killerStats[t.killer.name].matches += 1;
        killerStats[t.killer.name].kills += kills;
        killerStats[t.killer.name].pips += t.pipProgression;

        if (kills === 4) killerStats[t.killer.name].fourKs += 1;
        if (kills <= 1) killerStats[t.killer.name].losses += 1;
        killerStats[t.killer.name].gateEscapes += escapes;
        killerStats[t.killer.name].hatchEscapes += hatches;

        t.perks?.forEach(p => {
            if (p) perkCounts[p.name] = (perkCounts[p.name] || 0) + 1;
        });

        t.emblems?.forEach(e => {
            if (e && (e.type === 'IRIDESCENT' || e.quality === 'IRIDESCENT')) {
                emblemCounts[e.category] = (emblemCounts[e.category] || 0) + 1;
            }
        });
    });

    // --- CALCULATE RATES ---
    const killRate = totalMatches > 0 ? Math.round((totalKills / (totalMatches * 4)) * 100) : 0;
    const fourKRate = totalMatches > 0 ? Math.round((fourKCount / totalMatches) * 100) : 0;
    const lossRate = totalMatches > 0 ? Math.round((lossCount / totalMatches) * 100) : 0;
    const hatchEscapeRate = totalMatches > 0 ? Math.round((hatchEscapesCount / totalMatches) * 100) : 0;

    const topPerks = Object.entries(perkCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count]) => ({ name, pickRate: Math.round((count / totalMatches) * 100) }));

    const iridescentEmblems = Object.entries(emblemCounts)
        .map(([category, count]) => ({ category, rate: Math.round((count / totalMatches) * 100) }));

    const sortedKillers = Object.values(killerStats).sort((a, b) => {
        if (b.pips !== a.pips) return b.pips - a.pips;
        return (b.kills / b.matches) - (a.kills / a.matches);
    });

    const mvp = sortedKillers.length > 0 ? sortedKillers[0] : null;
    const lvp = sortedKillers.length > 1 ? sortedKillers[sortedKillers.length - 1] : null;

    // --- NEW: AWARDS DATA OBJECT ---
    // 1. Calculate the winners first safely
    const executioner = sortedKillers.filter(k => k.fourKs > 0).sort((a, b) => b.fourKs - a.fourKs)[0];
    const choker = sortedKillers.filter(k => k.gateEscapes > 0).sort((a, b) => b.gateEscapes - a.gateEscapes)[0];
    const merciful = sortedKillers.filter(k => k.hatchEscapes > 0).sort((a, b) => b.hatchEscapes - a.hatchEscapes)[0];
    const disappointment = sortedKillers.filter(k => k.losses > 0).sort((a, b) => b.losses - a.losses)[0];

    // 2. Build the array conditionally using &&
    const awards = [
        // MVP (Positive Effect)
        mvp && {
            name: "MOST VALUABLE",
            killer: mvp,
            detailText: `${mvp.pips > 0 ? `+${mvp.pips}` : mvp.pips} Pips`,
            effect: "positive"
        },
        // Executioner (Positive Effect)
        executioner && {
            name: "THE EXECUTIONER",
            killer: executioner,
            detailText: `${executioner.fourKs} Total 4Ks`,
            effect: "positive"
        },
        // The Merciful (Positive Effect)
        merciful && {
            name: "THE MERCIFUL",
            killer: merciful,
            detailText: `${merciful.hatchEscapes} Hatch Escapes`,
            effect: "positive"
        },
        // Endgame Choker (Negative Effect)
        choker && {
            name: "ENDGAME CHOKER",
            killer: choker,
            detailText: `${choker.gateEscapes} Gate Escapes`,
            effect: "negative"
        },
        // LVP / DISAPPOINTMENT (Negative Effect)
        // Only award the Weakest Link if it's a different killer than the MVP!
        (lvp && mvp && lvp.name !== mvp.name) && {
            name: "WEAKEST LINK",
            killer: lvp,
            detailText: `${lvp.pips > 0 ? `+${lvp.pips}` : lvp.pips} Pips`,
            effect: "negative"
        }
    ].filter(Boolean); // Clean up any undefined/false entries perfectly

    // --- THEME LOGIC ---
    const lastTrial = recapData.finalTrials[recapData.finalTrials.length - 1];
    const killerDied = lastTrial ? lastTrial.survivors.some(s => s.outcome === 'ESCAPED') : false;
    const reachedIri1 = lastTrial ? lastTrial.resultingGrade === 'IRIDESCENT_I' : false;

    const isVictory = recapData.status === 'COMPLETED' && (!killerDied || reachedIri1);

    const headerTitle = isVictory ? "CHALLENGE COMPLETED" : "ROSTER DECIMATED";
    const headerColor = isVictory ? "title-white" : "title-iri";
    const subTitle = isVictory ? "The Entity is sated... for now." : "The fog claims another victim.";

    return (
        <div className="recap-overlay-container fade-in">
            <div className="login-fog-bg"></div>

            <div className="recap-content-box">

                {/* 1. HEADER & NAVIGATION */}
                <div className="recap-header">
                    <h1 className={`bebas-header-1 ${headerColor}`}>{headerTitle}</h1>
                    <p className="inter-text-normal text-muted uppercase mb-4">{subTitle}</p>

                    <div className="secondary-nav-container" style={{ justifyContent: 'center', width: '100%' }}>
                        {['Stats', 'Trials'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`inter-text-normal secondaryNav ${activeTab === tab ? 'secondaryNavIndicator' : ''}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. SINGLE PANE BODY */}
                <div className="recap-body-single hide-scrollbar">

                    {/* === VIEW: STATS === */}
                    {activeTab === 'Stats' && (
                        <div className="fade-in">
                            {/* Core Performance Metrics */}
                            <div className="stats-section mb-8">
                                <h3 className="bebas-header-2 stats-section-title">CORE PERFORMANCE METRICS</h3>
                                <div className="recap-stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-info">
                                            <span className="stat-label">Trials Survived</span>
                                            <span className="stat-value">{totalMatches}</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info">
                                            <span className="stat-label">4K Rate</span>
                                            <span className="stat-value">{fourKRate}%</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info">
                                            <span className="stat-label">Losses</span>
                                            <span className="stat-value">{lossRate}%</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info">
                                            <span className="stat-label">2K-3K Via Exit Gates</span>
                                            <span className="stat-value">{twoToThreeKWithGates}</span>
                                        </div>
                                        <img src="/assets/Survivor Status/escaped.png" className="stat-icon" alt="Gate" />
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info">
                                            <span className="stat-label">Kill Rate</span>
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
                                        <GradeBadgeDisplay rawGrade={season.currentGrade} pips={season.currentPips} size="small" />
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-info">
                                            <span className="stat-label">Hatch Escapes</span>
                                            <span className="stat-value">{hatchEscapeRate}%</span>
                                        </div>
                                        <img src="/assets/Survivor Status/hatch_escape.png" className="stat-icon" alt="Hatch" />
                                    </div>
                                </div>
                            </div>

                            {/* Roster Performance Awards (Mapped over the 'awards' object) */}
                            <div className="stats-section mb-8">
                                <h3 className="bebas-header-2 stats-section-title">ROSTER PERFORMANCE AWARDS</h3>
                                <div className="recap-stats-grid">
                                    {awards.map((award, i) => (
                                        <div key={i} className="stats-card">
                                            <h4 className={`stats-title bebas-header-2 text-white text-center ${award.effect === "negative" ? "weakest-link-header" : ""}`}>{award.name}</h4>
                                            <img
                                                src={`/assets/Killers/${award.killer.name}.png`}
                                                className={`stat-killer-slot ${award.effect === "negative" ? "weakest-link-img" : ""}`}
                                                alt={award.killer.name}
                                            />
                                            <div className="award-text">
                                                <p className="inter-text-small uppercase">{award.killer.name}</p>
                                                <p className="inter-text-small">{award.detailText}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Meta Tendencies */}
                            <div className="stats-section mb-8">
                                <h3 className="bebas-header-2 stats-section-title">META TENDENCIES</h3>
                                <div className="stats-grid">
                                    {topPerks.map((perk, i) => (
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

                            {/* Emblems */}
                            <div className="stats-section">
                                <h3 className="bebas-header-2 stats-section-title">EMBLEMS</h3>
                                <div className="stats-grid">
                                    {iridescentEmblems.map((emblem, i) => (
                                        <div key={i} className="stat-card">
                                            <div className="stat-info">
                                                <span className="stat-value inter-text-normal text-normal capitalize">
                                                    {emblem.category.charAt(0) + emblem.category.slice(1).toLowerCase()}
                                                </span>
                                                <span className="stat-label">{emblem.rate}% Iridescent</span>
                                            </div>
                                            <img src={`/assets/Emblems/${emblem.category}_IRIDESCENT.png`} className="stat-emblem-icon drop-shadow" alt={emblem.category} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === VIEW: TRIALS === */}
                    {activeTab === 'Trials' && (
                        <div className="fade-in pb-10">
                            <TrialListTable
                                trials={recapData.finalTrials}
                                variantType={season.variantType}
                                onRowClick={setActiveTrialOverlay}
                            />
                        </div>
                    )}

                </div>

                {/* 3. FIXED FOOTER */}
                <div className="recap-footer">
                    <button className="squareBtn" style={{ position: 'relative', bottom: '0', right: '0' }} onClick={onAction}>
                        {actionText}
                    </button>
                </div>
            </div>

            {/* NESTED DETAILS OVERLAY */}
            <TrialDetailsOverlay
                trial={activeTrialOverlay}
                onClose={() => setActiveTrialOverlay(null)}
            />
        </div>
    );
};

export default SeasonRecapOverlay;
