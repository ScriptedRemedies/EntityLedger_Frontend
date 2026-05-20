import React, { useState } from 'react';
import GradeBadgeDisplay from './GradeBadgeDisplay';
import { useToast } from '../hooks/ToastContext';
import '../styles/TrialResults.scss';

const TrialResultsOverlay = ({ season, killer, onSubmit }) => {
    const { addToast } = useToast();

    // --- STATE MANAGEMENT ---
    // Emblems: Array of 4 (Indices 0-3). Values: 0(None), 1(Bronze), 2(Silver), 3(Gold), 4(Iridescent)
    const [emblems, setEmblems] = useState([0, 0, 0, 0]);

    // Survivors: Array of 4. Values: null, 'sacrificed', 'killed', 'disconnected', 'escaped'
    const [survivors, setSurvivors] = useState([null, null, null, null]);

    // --- PIP MATH LOGIC ---
    const totalPoints = emblems.reduce((sum, val) => sum + val, 0);

    const EMBLEM_CATEGORIES = ['GATEKEEPER', 'DEVOUT', 'MALICIOUS', 'CHASER'];

    const QUALITIES = ['NONE', 'BRONZE', 'SILVER', 'GOLD', 'IRIDESCENT'];

    const handleSubmit = () => {
        if (survivors.includes(null)) {
            addToast("You must select a status for all 4 survivors.", "error");
            return;
        }

        // 3. Format the data perfectly for your Java backend before submitting!
        const structuredEmblems = emblems.map((qualityIndex, i) => ({
            category: EMBLEM_CATEGORIES[i].toUpperCase(), // e.g., 'CHASER'
            quality: QUALITIES[qualityIndex].toUpperCase(), // e.g., 'GOLD'
            points: qualityIndex // 0, 1, 2, 3, or 4
        }));

        onSubmit({
            emblems: structuredEmblems, // Now passing detailed objects instead of just [0,0,0,0]
            totalPoints,
            pipChange,
            survivors
        });
    };

    // Standard DbD Pip Logic (16 point scale)
    let pipChange = 0;
    if (totalPoints < 9) pipChange = -1;
    else if (totalPoints < 14) pipChange = 0;
    else if (totalPoints < 16) pipChange = 1;
    else pipChange = 2; // Perfect 16 points

    // Calculate Live Grade Preview (Simplified visual math)
    const previewPips = Math.max(0, season.currentPips + pipChange);

    // --- HANDLERS ---
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

    return (
        <div className="trial-results-overlay fade-in">
            {/* Background */}
            <div className="results-bg"></div>

            {/* === LEFT PANEL (The Form) === */}
            <div className="results-left-panel">

                <div className="results-header">
                    <p className="inter-text-normal">
                        {season.variantType.replace('_', ' ')} - Trial #{season.trialsCompleted + 1 || 1}
                    </p>
                    <h1 className="bebas-header-1 title-iri uppercase">RESULTS</h1>
                </div>

                {/* EMBLEMS & PIP BAR */}
                <div className="results-emblem-section">
                    <div className="emblems-row">
                        {[0, 1, 2, 3].map(index => {
                            // Grab the correct category and quality strings
                            const category = EMBLEM_CATEGORIES[index];
                            const currentQuality = QUALITIES[emblems[index]];

                            // Build the exact file path (e.g., /assets/Emblems/chaser_gold.png)
                            const imagePath = `/assets/Emblems/${category}_${currentQuality}.png`;

                            return (
                                <div key={index} className="emblem-wrapper">
                                    <div className="emblem-display">
                                        <img src={imagePath} alt={`${category} ${currentQuality}`} />
                                    </div>

                                    {/* Hover Menu for Colors */}
                                    {/* TODO: Fix the colors not showing */}
                                    <div className="emblem-hover-menu">
                                        {QUALITIES.map((q, qIndex) => (
                                            <div
                                                key={q}
                                                // Maps 'platinum' back to 'iri' just for the CSS colors
                                                className={`color-pip color-${q === 'platinum' ? 'iri' : q}`}
                                                onClick={() => handleEmblemChange(index, qIndex)}
                                                title={q}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* PIP PROGRESS BAR (16 Segments) */}
                    <div className="pip-progress-container">
                        <div className="pip-bar">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className={`pip-segment ${i < totalPoints ? 'filled' : 'empty'}`}></div>
                            ))}
                        </div>
                        {/* Threshold Diamonds (9 = safety, 14 = +1, 16 = +2) */}
                        <div className="pip-markers">
                            {/* 0 is always reached, but we keep the logic consistent! */}
                            <div className={`marker marker-0 ${totalPoints >= 0 ? 'reached' : ''}`}>♦</div>
                            <div className={`marker marker-9 ${totalPoints >= 9 ? 'reached' : ''}`}>♦</div>
                            <div className={`marker marker-14 ${totalPoints >= 14 ? 'reached' : ''}`}>♦</div>
                            <div className={`marker marker-16 ${totalPoints >= 16 ? 'reached' : ''}`}>♦</div>
                        </div>
                    </div>

                    {/* LIVE GRADE PREVIEW */}
                    <div className="live-grade-preview">
                        <GradeBadgeDisplay rawGrade={season.currentGrade} pips={previewPips} size="normal" />
                    </div>
                </div>

                {/* SURVIVOR STATUS GRID */}
                <div className="survivor-status-section">
                    <div className="survivor-header-bar">
                        <span className="inter-text-small uppercase">Survivor Status</span>
                    </div>

                    <div className="survivor-columns">
                        {[0, 1, 2, 3].map(colIndex => (
                            <div key={colIndex} className="survivor-col">
                                <h4 className="bebas-header-2 text-white text-center mb-4">SURVIVOR #{colIndex + 1}</h4>

                                {['sacrificed', 'hatch', 'escaped'].map(status => {
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

            </div>

            {/* === RIGHT PANEL (The Killer Showcase) === */}
            <div className="results-right-panel">
                <img
                    src={`/assets/Killer Portraits/${killer.killerName}.png`}
                    alt={killer.killerName}
                    className="results-killer-bg fade-in"
                />
                <button className="squareBtn complete-btn" onClick={handleSubmit}>
                    Complete Trial
                </button>
            </div>

        </div>
    );
};

export default TrialResultsOverlay;
