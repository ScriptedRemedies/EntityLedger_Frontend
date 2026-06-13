import React, { useState, useEffect } from 'react';
import GradeBadgeDisplay from '../small-components/GradeBadgeDisplay.jsx';
import { useToast } from '../../hooks/ToastContext.jsx';
import '../../styles/overlays/TrialResults.scss';

const TrialResultsOverlay = ({ season, killer, selectedPerks = [], selectedAddons = [], trialCount, onSubmit, isAscending }) => {
    const { addToast } = useToast();

    // --- STATE MANAGEMENT ---
    const [emblems, setEmblems] = useState([0, 0, 0, 0]);
    const [survivors, setSurvivors] = useState([null, null, null, null]);

    // Generator State
    const [gensLeft, setGensLeft] = useState(0);
    const [hoverGens, setHoverGens] = useState(0);
    const needsGens = ['BLOOD_MONEY', 'AFTERBURN', 'CHAOS_SHUFFLE', 'IRON_MAN'].includes(season.variantType);

    const isFinancialVariant = season.variantType === 'BLOOD_MONEY' || season.variantType === 'AFTERBURN';
    const [closedHatch, setClosedHatch] = useState(false);
    const [genBeforeHook, setGenBeforeHook] = useState(false);

    // Grade change animation states
    const [displayGrade, setDisplayGrade] = useState(season.currentGrade);
    const [displayPips, setDisplayPips] = useState(Number(season.currentPips) || 0);
    const [animationClass, setAnimationClass] = useState('fade-in');

    // --- PIP MATH LOGIC ---
    const totalPoints = emblems.reduce((sum, val) => sum + val, 0);
    const hasInteracted = totalPoints > 0 || survivors.some(s => s !== null);

    const EMBLEM_CATEGORIES = ['GATEKEEPER', 'DEVOUT', 'MALICIOUS', 'CHASER'];
    const QUALITIES = ['NONE', 'BRONZE', 'SILVER', 'GOLD', 'IRIDESCENT'];

    const handleSubmit = () => {
        if (survivors.includes(null)) {
            addToast("You must select a status for all 4 survivors.", "error");
            return;
        }

        const structuredEmblems = emblems.map((qualityIndex, i) => ({
            category: EMBLEM_CATEGORIES[i].toUpperCase(),
            quality: QUALITIES[qualityIndex].toUpperCase(),
            points: qualityIndex
        }));

        onSubmit({
            emblems: structuredEmblems,
            totalPoints,
            pipChange,
            survivors,
            gensLeft,
            closedHatch,
            genBeforeHook
        });
    };

    // === DYNAMIC DBD PIP LOGIC ===
    let pipChange = 0;
    let safetyThreshold = 9;
    let plusOneThreshold = 14;
    let plusTwoThreshold = 16;

    const badgeTier = season.currentGrade ? season.currentGrade.split("_")[0] : "ASH";

    if (hasInteracted) {
        if (badgeTier === "ASH") {
            safetyThreshold = 0;
            plusOneThreshold = 9;
            plusTwoThreshold = 14;
            if (totalPoints < plusOneThreshold) pipChange = 0;
            else if (totalPoints < plusTwoThreshold) pipChange = 1;
            else pipChange = 2;
        } else if (badgeTier === "BRONZE") {
            safetyThreshold = 9;
            plusOneThreshold = 14;
            plusTwoThreshold = 16;
            if (totalPoints < safetyThreshold) pipChange = -1;
            else if (totalPoints < plusOneThreshold) pipChange = 0;
            else if (totalPoints < plusTwoThreshold) pipChange = 1;
            else pipChange = 2;
        } else if (badgeTier === "SILVER") {
            safetyThreshold = 10;
            plusOneThreshold = 14;
            plusTwoThreshold = 16;
            if (totalPoints < safetyThreshold) pipChange = -1;
            else if (totalPoints < plusOneThreshold) pipChange = 0;
            else if (totalPoints < plusTwoThreshold) pipChange = 1;
            else pipChange = 2;
        } else if (badgeTier === "GOLD") {
            safetyThreshold = 11;
            plusOneThreshold = 14;
            plusTwoThreshold = 16;
            if (totalPoints < safetyThreshold) pipChange = -1;
            else if (totalPoints < plusOneThreshold) pipChange = 0;
            else if (totalPoints < plusTwoThreshold) pipChange = 1;
            else pipChange = 2;
        } else {
            safetyThreshold = 12;
            plusOneThreshold = 15;
            plusTwoThreshold = 16;
            if (totalPoints < safetyThreshold) pipChange = -1;
            else if (totalPoints < plusOneThreshold) pipChange = 0;
            else if (totalPoints < plusTwoThreshold) pipChange = 1;
            else pipChange = 2;
        }
    } else {
        pipChange = 0;
    }


    const GRADE_PROGRESSION = [
        "ASH_IV", "ASH_III", "ASH_II", "ASH_I",
        "BRONZE_IV", "BRONZE_III", "BRONZE_II", "BRONZE_I",
        "SILVER_IV", "SILVER_III", "SILVER_II", "SILVER_I",
        "GOLD_IV", "GOLD_III", "GOLD_II", "GOLD_I",
        "IRIDESCENT_IV", "IRIDESCENT_III", "IRIDESCENT_II", "IRIDESCENT_I"
    ];

    const getMaxPips = (grade) => {
        if (!grade) return 5;
        if (grade.startsWith("ASH")) return 3;
        if (grade.startsWith("BRONZE")) return 4;
        return 5;
    };

    let displayGradePreview = season.currentGrade;
    let displayPipsPreview = season.currentPips + pipChange;

    useEffect(() => {
        let finalGrade = season.currentGrade;
        let finalPips = (Number(season.currentPips) || 0) + pipChange;
        let gradeIndex = GRADE_PROGRESSION.indexOf(finalGrade);

        if (finalPips < 0) {
            finalPips = 0;
        } else {
            let maxPips = getMaxPips(finalGrade);
            while (finalPips >= maxPips && gradeIndex < GRADE_PROGRESSION.length - 1) {
                finalPips -= maxPips;
                gradeIndex++;
                finalGrade = GRADE_PROGRESSION[gradeIndex];
                maxPips = getMaxPips(finalGrade);
            }
            if (gradeIndex === GRADE_PROGRESSION.length - 1 && finalPips > maxPips) {
                finalPips = maxPips;
            }
        }

        const currentDisplayIndex = GRADE_PROGRESSION.indexOf(displayGrade);
        const finalGradeIndex = GRADE_PROGRESSION.indexOf(finalGrade);

        if (finalGradeIndex > currentDisplayIndex) {
            setDisplayPips(getMaxPips(displayGrade));
            const fadeOutTimer = setTimeout(() => { setAnimationClass('fade-out'); }, 600);
            const swapTimer = setTimeout(() => {
                setDisplayGrade(finalGrade);
                setDisplayPips(finalPips);
                setAnimationClass('fade-in');
            }, 800);
            return () => { clearTimeout(fadeOutTimer); clearTimeout(swapTimer); };
        }
        else if (finalGradeIndex < currentDisplayIndex) {
            setAnimationClass('fade-out');
            const revertTimer = setTimeout(() => {
                setDisplayGrade(finalGrade);
                setDisplayPips(finalPips);
                setAnimationClass('fade-in');
            }, 200);
            return () => clearTimeout(revertTimer);
        }
        else {
            setDisplayGrade(finalGrade);
            setDisplayPips(finalPips);
            setAnimationClass('fade-in');
        }

    }, [pipChange, season.currentGrade, displayGrade]);

    const handleEmblemChange = (index, quality) => {
        setEmblems(prev => {
            const newEmblems = [...prev];
            newEmblems[index] = quality;
            return newEmblems;
        });
    };

    const handleSurvivorChange = (index, status) => {
        setSurvivors(prev => {
            const newSurvs = [...prev];
            newSurvs[index] = status;
            return newSurvs;
        });
    };

    // --- LIVE FINANCIAL CALCULATOR ---
    let earnings = 0;
    let penalties = 0;

    // Calculate Trial Cost
    const killerCost = killer?.cost || 0;
    const perksCost = selectedPerks.reduce((sum, p) => sum + (p?.cost || 0), 0);
    const addonsCost = selectedAddons.reduce((sum, a) => sum + (a?.cost || 0), 0);
    const totalCost = killerCost + perksCost + addonsCost;

    if (isFinancialVariant) {
        const killCount = survivors.filter(s => s === 'sacrificed' || s === 'killed').length;
        const hatches = survivors.filter(s => s === 'hatch_escape').length;
        const gates = survivors.filter(s => s === 'escaped').length;
        const isLastGenCompleted = gensLeft === 0;
        const isGateOpened = gates > 0;

        if (season.variantType === 'BLOOD_MONEY') {
            if (killCount === 3) earnings += 10;
            if (killCount === 4) earnings += 20;
            if (killCount === 4 && gensLeft === 5) earnings += 4;
            if (killCount === 4 && gensLeft === 4) earnings += 2;

            if (genBeforeHook) penalties += 2;
            if (isLastGenCompleted) penalties += 2;
            if (isGateOpened) penalties += 5;
            if (hatches > 0) penalties += 4;
        } else if (season.variantType === 'AFTERBURN') {
            if (killCount === 4 && gensLeft === 5) earnings += 6;
            if (killCount === 4 && gensLeft === 4) earnings += 4;
            if (killCount === 4 && gensLeft === 3) earnings += 2;
            if (closedHatch) earnings += 5;

            if (genBeforeHook) penalties += 3;
            if (isLastGenCompleted) penalties += 2;
            if (isGateOpened) penalties += 5;
            if (hatches > 0) penalties += 2;
        }
    }

    // The True Mathematical Net Income (Earnings - Penalties - Loadout Trial Cost)
    const netIncome = earnings - penalties - totalCost;

    return (
        <div className={`trial-results-overlay ${isAscending ? 'merciless-ascension' : ''}`}>
            <div className="results-bg"></div>

            {isAscending && (
                <div className="merciless-stamp-text">MERCILESS KILLER</div>
            )}

            {/* === LEFT PANEL (The Form) === */}
            <div className="results-left-panel">

                <div className="results-header">
                    <p className="inter-text-normal">
                        {season.variantType.replace('_', ' ')} - Trial #{trialCount + 1}
                    </p>
                    <h1 className="bebas-header-1 title-iri uppercase">RESULTS</h1>
                </div>

                {/* EMBLEMS & PIP BAR */}
                <div className="results-emblem-section">
                    <div className="emblems-row">
                        {[0, 1, 2, 3].map(index => {
                            const category = EMBLEM_CATEGORIES[index];
                            const currentQuality = QUALITIES[emblems[index]];
                            const imagePath = `/assets/Emblems/${category}_${currentQuality}.png`;

                            return (
                                <div key={index} className="emblem-wrapper">
                                    <div className="emblem-display">
                                        <img src={imagePath} alt={`${category} ${currentQuality}`} title={category} />
                                    </div>
                                    <div className="emblem-hover-menu">
                                        {QUALITIES.map((q, qIndex) => (
                                            <div
                                                key={q}
                                                className={`color-pip color-${q === 'IRIDESCENT' ? 'iri' : q.toLowerCase()}`}
                                                onClick={() => handleEmblemChange(index, qIndex)}
                                                title={q}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pip-progress-container">
                        <div className="pip-bar">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className={`pip-segment ${i < totalPoints ? 'filled' : 'empty'}`}></div>
                            ))}
                        </div>
                        <div className="pip-markers">
                            <div className={`marker ${totalPoints >= 0 ? 'reached' : ''}`} style={{ left: '0%' }}>♦</div>
                            {badgeTier !== "ASH" && (
                                <div className={`marker ${totalPoints >= safetyThreshold ? 'reached' : ''}`} style={{ left: `${(safetyThreshold / 16) * 100}%` }}>♦</div>
                            )}
                            <div className={`marker ${totalPoints >= plusOneThreshold ? 'reached' : ''}`} style={{ left: `${(plusOneThreshold / 16) * 100}%` }}>♦</div>
                            <div className={`marker ${totalPoints >= plusTwoThreshold ? 'reached' : ''}`} style={{ left: `${(plusTwoThreshold / 16) * 100}%` }}>♦</div>
                        </div>
                    </div>

                    <div className={`live-grade-preview ${animationClass}`}>
                        <GradeBadgeDisplay rawGrade={displayGrade} pips={displayPips} size="normal" />
                    </div>
                </div>

                {/* SURVIVOR STATUS GRID */}
                <div className="survivor-status-section">

                    {needsGens && (
                        <div className="gens-section" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="survivor-header-bar" style={{ width: '100%', marginBottom: '15px' }}>
                                <span className="inter-text-small uppercase">Generators Remaining</span>
                            </div>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map(num => {
                                    const isHighlighted = num <= (hoverGens || gensLeft);
                                    return (
                                        <img
                                            key={num}
                                            src="/assets/Survivor Status/gens.png"
                                            alt={`Gen ${num}`}
                                            onMouseEnter={() => setHoverGens(num)}
                                            onMouseLeave={() => setHoverGens(0)}
                                            onClick={() => setGensLeft(num)}
                                            style={{
                                                width: '45px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                filter: isHighlighted ? 'brightness(1)' : 'brightness(0.3) grayscale(100%)',
                                                transform: isHighlighted ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isFinancialVariant && (
                        <div className="bonus-penalty-section">
                            {season.variantType === 'AFTERBURN' && (
                                <button
                                    className={`modifier-toggle-btn ${closedHatch ? 'active-bonus' : ''}`}
                                    onClick={() => setClosedHatch(!closedHatch)}
                                >
                                    <span className="modifier-icon">{closedHatch ? '✓' : '+'}</span>
                                    CLOSED HATCH
                                </button>
                            )}

                            <button
                                className={`modifier-toggle-btn ${genBeforeHook ? 'active-penalty' : ''}`}
                                onClick={() => setGenBeforeHook(!genBeforeHook)}
                            >
                                <span className="modifier-icon">{genBeforeHook ? '✕' : '-'}</span>
                                GEN BEFORE 1ST HOOK
                            </button>
                        </div>
                    )}

                    <div className="survivor-header-bar">
                        <span className="inter-text-small uppercase">Survivor Status</span>
                    </div>

                    <div className="survivor-columns">
                        {[0, 1, 2, 3].map(colIndex => (
                            <div key={colIndex} className="survivor-col">
                                <h4 className="bebas-header-2 text-white text-center mb-4">SURVIVOR #{colIndex + 1}</h4>

                                {['sacrificed', 'hatch_escape', 'escaped'].map(status => {
                                    const isSelected = survivors[colIndex] === status;
                                    return (
                                        <img
                                            key={status}
                                            src={`/assets/Survivor Status/${status}.png`}
                                            alt={status}
                                            className={`survivor-icon ${isSelected ? 'selected' : 'dimmed'}`}
                                            onClick={() => handleSurvivorChange(colIndex, status)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {isFinancialVariant && (
                    <div className="inline-ledger-dashboard fade-in">
                        <div className="ledger-col">
                            <span className="inter-text-small text-muted uppercase tracking-widest">Trial Cost</span>
                            <span className="bebas-header-2 title-iri m-0 text-2xl">-${totalCost}</span>
                        </div>
                        <div className="ledger-divider-vertical"></div>
                        <div className="ledger-col">
                            <span className="inter-text-small text-muted uppercase tracking-widest">Gross Income</span>
                            <span className="bebas-header-2 text-white m-0 text-2xl">+${earnings}</span>
                        </div>
                        <div className="ledger-divider-vertical"></div>
                        <div className="ledger-col">
                            <span className="inter-text-small text-muted uppercase tracking-widest">Penalties</span>
                            <span className="bebas-header-2 title-iri m-0 text-2xl">-${penalties}</span>
                        </div>
                        <div className="ledger-divider-vertical"></div>
                        <div className="ledger-col">
                            <span className="inter-text-small text-white uppercase tracking-widest">Net Profit</span>
                            <span className={`bebas-header-1 text-4xl m-0 ${netIncome >= 0 ? 'text-white' : 'title-iri'}`} style={{ lineHeight: 1 }}>
                                {netIncome >= 0 ? `+$${netIncome}` : `-$${Math.abs(netIncome)}`}
                            </span>
                        </div>
                    </div>
                )}

            </div>

            {/* === RIGHT PANEL (The Killer Showcase) === */}
            <div className="results-right-panel">
                {killer && (
                    <img
                        src={`/assets/Killer Portraits/${killer.killerName}.png`}
                        alt={killer.killerName}
                        className="results-killer-bg fade-in"
                    />
                )}
                <button className="squareBtn complete-btn" onClick={handleSubmit}>
                    Complete Trial
                </button>
            </div>

        </div>
    );
};

export default TrialResultsOverlay;
