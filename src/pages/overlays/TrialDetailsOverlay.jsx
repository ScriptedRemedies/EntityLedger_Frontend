import React from 'react';
import GradeBadgeDisplay from '../small-components/GradeBadgeDisplay';
import '../../styles/small-components/TrialComponent.scss';

// Maps for survivor result and emblems
const SURVIVOR_DISPLAY_MAP = {
    'SACRIFICED' : 'Sacrificed',
    'KILLED' : 'Killed',
    'ESCAPED' : 'Escaped',
    'HATCH_ESCAPE' : 'Hatch'
};

const EMBLEM_DISPLAY_MAP = {
    'GATEKEEPER' : 'Gatekeeper',
    'DEVOUT' : 'Devout',
    'MALICIOUS' : 'Malicious',
    'CHASER' : 'Chaser'
};

const TrialDetailsOverlay = ({ trial, onClose }) => {
    if (!trial) return null;

    return (
        <div className="trial-overlay hide-scrollbar animation-slide-in">
            <div className="overlay-header">
                <div className="overlay-header-text">
                    <h2 className="bebas-header-1 title-white">{trial.killer?.name || "Unknown Killer"}</h2>
                    <p className="inter-text-small">Trial #{trial.trialNumber}</p>
                </div>
                <div className="overlay-badge">
                    <GradeBadgeDisplay
                        rawGrade={trial.resultingGrade}
                        pips={trial.resultingPips}
                        size="small"
                    />
                </div>
                <button onClick={onClose} className="close-overlay-btn">✕</button>
            </div>

            {/* PERKS */}
            <div className="overlay-section">
                <h4 className="bebas-header-1 section-title">PERKS</h4>
                <div className="overlay-perks">
                    {[0,1,2,3].map(index => {
                        const perk = trial.perks ? trial.perks[index] : null;

                        return(
                            <div key={index} className="overlay-item">
                                {perk ? (
                                    <img src={`/assets/Perks/${perk.name}.png`} className="perk-icon" alt={perk.name} />
                                ) : (
                                    <div className="empty-perk-icon"></div>
                                )}
                                <span className="overlay-item-name">{perk ? perk.name : 'Empty'}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ADD ONS */}
            <div className="overlay-section">
                <h4 className="bebas-header-1 section-title">ADD ONS</h4>
                <div className="overlay-addons">
                    {[0,1].map(index => {
                        const addon = trial.addOns ? trial.addOns[index] : null;
                        return (
                            <div key={index} className="overlay-addon-wrapper">
                                {index > 0 && <span className="addon-plus">+</span>}
                                <div className="overlay-item">
                                    {addon ? (
                                        <img src={`/assets/Addons/${trial.killer.name}/${addon.name.replace('%', '')}.png`} className="addon-icon" alt={addon.name} />
                                    ): (
                                        <div className="empty-addon-icon"></div>
                                    )}
                                    <span className="overlay-item-name">{addon ? addon.name: 'Empty'}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* SURVIVOR RESULTS */}
            <div className="overlay-section">
                <h4 className="bebas-header-1 section-title uppercase">SURVIVOR RESULT</h4>
                <div className="overlay-survivors">
                    {trial.survivors?.map((res, i) => (
                        <div key={i} className="overlay-item">
                            <img src={`/assets/Survivor Status/${res.outcome.toLowerCase()}.png`} className="survivor-icon" alt={res.outcome} />
                            <span className="overlay-item-name">
                                {SURVIVOR_DISPLAY_MAP[res.outcome] || res.outcome}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* EMBLEMS */}
            <div className="overlay-section">
                <h4 className="bebas-header-1 section-title uppercase">
                    EMBLEMS {trial.pipProgression > 0 ? `+${trial.pipProgression} PIPS` : ''}
                </h4>
                <div className="overlay-emblems">
                    {trial.emblems?.map((emb, i) => {
                        const path = `/assets/Emblems/${emb.category}_${emb.type}.png`;
                        return (
                            <div key={i} className="overlay-item">
                                <img src={path} className="overlay-icon emblem-icon" alt={emb.category} />
                                <span className="overlay-item-name">
                                    {EMBLEM_DISPLAY_MAP[emb.category] || emb.category}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TrialDetailsOverlay;
