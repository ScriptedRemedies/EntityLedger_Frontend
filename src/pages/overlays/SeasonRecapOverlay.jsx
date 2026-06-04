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

    let totalRevenue = 0, totalDebt = 0;
    let biggestWin = { amount: 0, trialNumber: 0 };
    let biggestLoss = { amount: 0, trialNumber: 0 };
    let mulligansBurned = 0, flawlessCount = 0;

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

        if (t.netIncome > 0) {
            totalRevenue += t.netIncome;
            if (t.netIncome > biggestWin.amount) biggestWin = { amount: t.netIncome, trialNumber: t.trialNumber };
        } else if (t.netIncome < 0) {
            totalDebt += Math.abs(t.netIncome);
            if (t.netIncome < biggestLoss.amount) biggestLoss = { amount: t.netIncome, trialNumber: t.trialNumber };
        }
        if (t.burnedMulligan) mulligansBurned++;
        if (t.flawlessTrial) flawlessCount++;

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

    let totalCompletionTime = "N/A";
    if (season.startDate && season.endDate) {
        const start = new Date(season.startDate);
        const end = new Date(season.endDate);
        const diffMins = Math.floor((end - start) / 60000);
        totalCompletionTime = `${Math.floor(diffMins/60).toString().padStart(2,'0')}:${(diffMins%60).toString().padStart(2,'0')}`;
    }

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

    const adeptTopKillers = sortedKillers.slice(0, 4).map(k => ({
        name: k.name, pickRate: Math.round((k.matches/totalMatches)*100), killRate: Math.round((k.kills/(k.matches*4))*100)
    }));

    const mvp = sortedKillers.length > 0 ? sortedKillers[0] : null;
    const lvp = sortedKillers.length > 1 ? sortedKillers[sortedKillers.length - 1] : null;

    // --- NEW: AWARDS DATA OBJECT ---
    // 1. Calculate the winners first safely
    const executioner = sortedKillers.filter(k => k.fourKs > 0).sort((a, b) => b.fourKs - a.fourKs)[0];
    const choker = sortedKillers.filter(k => k.gateEscapes > 0).sort((a, b) => b.gateEscapes - a.gateEscapes)[0];
    const merciful = sortedKillers.filter(k => k.hatchEscapes > 0).sort((a, b) => b.hatchEscapes - a.hatchEscapes)[0];

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

    const headerTitle = recapData.status.replace("_", " ");
    const headerColor = isVictory ? "title-white" : "title-iri";
    const subTitle = isVictory ? "The Entity is pleased... for now." : "The fog claims another victim.";

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
                                            <span className="stat-label">Hatch Escapes</span>
                                            <span className="stat-value">{hatchEscapeRate}%</span>
                                        </div>
                                        <img src="/assets/Survivor Status/hatch_escape.png" className="stat-icon" alt="Hatch" />
                                    </div>

                                    {/* --- NEW: IRON MAN SINGLE RUN STATS --- */}
                                    {season.variantType === 'IRON_MAN' && (
                                        <>
                                            <div className="stat-card">
                                                <div className="stat-info">
                                                    <span className="stat-label">Total Completion Time</span>
                                                    <span className="stat-value">{totalCompletionTime}</span>
                                                </div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-info">
                                                    <span className="stat-label">Flawless / Burned</span>
                                                    <span className="stat-value">{flawlessCount} / {mulligansBurned}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* --- NEW: FINANCIAL EXTREMES (Blood Money / Afterburn) --- */}
                            {(season.variantType === 'BLOOD_MONEY' || season.variantType === 'AFTERBURN') && (
                                <div className="stats-section mb-8">
                                    <h3 className="bebas-header-2 stats-section-title">THE ECONOMY</h3>
                                    <div className="recap-stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                        <div className="stat-card">
                                            <div className="stat-info">
                                                <span className="stat-label">Total Revenue Generated</span>
                                                <span className="stat-value title-white">${totalRevenue}</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-info">
                                                <span className="stat-label">Total Debt Accrued</span>
                                                <span className="stat-value title-iri">-${totalDebt}</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-info">
                                                <span className="stat-label">Biggest Win</span>
                                                <span className="stat-value title-white">
                                                    {biggestWin.amount > 0 ? `+$${biggestWin.amount}` : '$0'} <span className="text-sm text-normal">{biggestWin.trialNumber > 0 ? `(Trial ${biggestWin.trialNumber})` : ''}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-info">
                                                <span className="stat-label">Biggest Loss</span>
                                                <span className="stat-value title-iri">
                                                    {biggestLoss.amount < 0 ? `-$${Math.abs(biggestLoss.amount)}` : '$0'} <span className="text-sm text-normal">{biggestLoss.trialNumber > 0 ? `(Trial ${biggestLoss.trialNumber})` : ''}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Roster Performance Awards */}
                            {awards && awards.length > 0 && (
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
                            )}

                            {/* --- NEW: TOP KILLERS (Adept Only) --- */}
                            {season.variantType === 'ADEPT' && adeptTopKillers && adeptTopKillers.length > 0 && (
                                <div className="stats-section mb-8">
                                    <h3 className="bebas-header-2 stats-section-title">MOST PLAYED KILLERS</h3>
                                    <div className="recap-stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                        {adeptTopKillers.map((killer, i) => (
                                            <div key={i} className="stat-card">
                                                <div className="stat-info">
                                                    <span className="stat-value inter-text-normal text-white uppercase">{killer.name}</span>
                                                    <span className="stat-label">{killer.pickRate}% Pick Rate | {killer.killRate}% Kill Rate</span>
                                                </div>
                                                <img src={`/assets/Killers/${killer.name}.png`} style={{ height: '50px', objectFit: 'cover' }} alt={killer.name} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Meta Tendencies (Hidden for Adept & Chaos Shuffle) */}
                            {season.variantType !== 'ADEPT' && season.variantType !== 'CHAOS_SHUFFLE' && (
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
                            )}

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

                    {/* TODO: Fix the trials doing a double scroll */}
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
                trials={recapData.finalTrials}
                variantType={season.variantType}
                onClose={() => setActiveTrialOverlay(null)}
            />
        </div>
    );
};

export default SeasonRecapOverlay;
