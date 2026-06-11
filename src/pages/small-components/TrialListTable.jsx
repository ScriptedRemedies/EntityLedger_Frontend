import React from 'react';
import GradeBadgeDisplay from './GradeBadgeDisplay.jsx';
import '../../styles/small-components/TrialComponent.scss';

const TrialListTable = ({ trials, variantType, onRowClick }) => {

    const isAdept = variantType === 'ADEPT';
    const isFinancial = variantType === 'BLOOD_MONEY' || variantType === 'AFTERBURN';
    const isChaos = variantType === 'CHAOS_SHUFFLE';
    const isIronMan = variantType === 'IRON_MAN';

    return (
        <div className="trials-card-list">
            {trials.map((trial, index) => {
                const killerDiedInTrial = trial.survivors?.some(res => {
                    const outcome = typeof res === 'string' ? res : res.outcome;
                    return outcome.toUpperCase() === 'ESCAPED';
                });
                const historicalStatus = killerDiedInTrial ? 'DEAD' : 'AVAILABLE';
                const gradeStr = trial.currentGrade || trial.resultingGrade || 'ASH_IV';
                const isAddonsLocked = isAdept && !gradeStr.startsWith('ASH');
                const killerName = trial.killer?.name || trial.killerName;

                return (
                    <div key={trial.id || trial.trialId} onClick={() => onRowClick(trial)} className="trial-banner-row stagger-item" style={{ animationDelay: `${index * 25}ms` }}>

                        {/* 1. SQUARE PROFILE CROP */}
                        <div className={`banner-portrait ${historicalStatus === 'DEAD' ? 'portrait-dead' : ''}`}>
                            <img src={`/assets/Killers/${killerName}.png`} alt={killerName} />
                            {historicalStatus === 'DEAD' && <div className="dead-stamp bebas-header-2">DEAD</div>}
                        </div>

                        {/* 2. MATCH INFO & MINI-METRICS */}
                        <div className="banner-body">

                            <div className="banner-header">
                                <h3 className="bebas-header-2 text-white m-0 tracking-wide">
                                    <span className="text-normal mr-2">#{trial.trialNumber} |</span> {killerName}
                                </h3>

                                {/* Sleek Financial Tag */}
                                {isFinancial && (
                                    <div className="banner-finances">
                                        <span className={`bebas-header-2 m-0 ${trial.netIncome > 0 ? 'text-white' : 'title-iri'}`}>
                                            {trial.netIncome > 0 ? `+$${trial.netIncome}` : `-$${Math.abs(trial.netIncome || 0)}`}
                                        </span>
                                        <span className="inter-text-small text-muted">Bal: ${(trial.runningBalance || 0)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="banner-metrics">
                                {/* MINI PERKS */}
                                <div className="mini-metric-group">
                                    {[0, 1, 2, 3].map(i => {
                                        const perk = trial.perks ? trial.perks[i] : null;
                                        const locked = isAdept && i === 3;
                                        return (
                                            <div key={i} className="mini-slot-diamond">
                                                {locked ? (
                                                    <img className="locked-indicator" src="/assets/Image Overlays/locked.png" alt="Locked" />
                                                ) : perk ? (
                                                    <div className="mini-diamond-content">
                                                        <img src={perk.iconUrl || `/assets/Perks/${perk.name}.png`} alt={perk.name} />
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* MINI ADDONS / TOKENS */}
                                {isChaos ? (
                                    <div className="mini-metric-group ml-2" style={{ gap: '6px' }}>
                                        <img src="/assets/Variants/ReRollToken.png" className="mini-token" style={{ filter: trial.usedReRollToken ? 'none' : 'grayscale(100%) opacity(0.3)' }} alt="Reroll Token" />
                                        <span className="inter-text-small text-muted" style={{ fontSize: '11px' }}>{trial.remainingTokens || 0} Left</span>
                                    </div>
                                ) : (
                                    <div className="mini-metric-group ml-2">
                                        {[0, 1].map(i => {
                                            const addon = (trial.addons || trial.addOns || [])[i];
                                            return (
                                                <div key={i} className="mini-slot-square">
                                                    {isAddonsLocked ? (
                                                        <img className="locked-indicator" src="/assets/Image Overlays/locked.png" alt="Locked" />
                                                    ) : addon ? (
                                                        <img src={addon.iconUrl || `/assets/Addons/${killerName}/${addon.name.replace('%', '')}.png`} alt={addon.name} />
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* MINI SURVIVORS */}
                                <div className="mini-metric-group ml-4" style={{ gap: '4px' }}>
                                    {(trial.survivors || trial.survivorResults)?.map((res, i) => {
                                        const outcome = typeof res === 'string' ? res : res.outcome;
                                        return <img key={i} src={`/assets/Survivor Status/${outcome.toLowerCase()}.png`} className="mini-survivor" alt={outcome} />
                                    })}
                                </div>

                                {/* MINI MULLIGAN */}
                                {isIronMan && trial.burnedMulligan && (
                                    <div className="mini-metric-group ml-4">
                                        <img src="/assets/Variants/ReRollToken.png" className="mini-token" alt="Mulligan Burned" />
                                        <span className="inter-text-small title-iri ml-1" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Burned</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. RIGHT ALIGNED BADGE */}
                        <div className="banner-right">
                            <GradeBadgeDisplay rawGrade={trial.resultingGrade || trial.currentGrade} pips={trial.resultingPips || trial.currentPips} size="small" />
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default TrialListTable;
