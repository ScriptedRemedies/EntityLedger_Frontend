import React from 'react';
import GradeBadgeDisplay from './GradeBadgeDisplay.jsx';
import KillerCard from './KillerCard.jsx';
import '../../styles/small-components/TrialComponent.scss';
import '../../styles/variant-loadouts/Loadouts.scss'; // Inherit exact loadout styles for pricing/locks!

const TrialListTable = ({ trials, variantType, onRowClick }) => {

    // --- VARIANT FLAGS ---
    const isAdept = variantType === 'ADEPT';
    const isFinancial = variantType === 'BLOOD_MONEY' || variantType === 'AFTERBURN';
    const isChaos = variantType === 'CHAOS_SHUFFLE';
    const isIronMan = variantType === 'IRON_MAN';

    return (
        <div className="trials-card-list">
            {trials.map(trial => {
                // Historical Death Check
                const killerDiedInTrial = trial.survivors?.some(res => {
                    const outcome = typeof res === 'string' ? res : res.outcome;
                    return outcome.toUpperCase() === 'ESCAPED';
                });
                const historicalStatus = killerDiedInTrial ? 'DEAD' : 'AVAILABLE';

                // Addon Lock Check
                const gradeStr = trial.currentGrade || trial.resultingGrade || 'ASH_IV';
                const isAddonsLocked = isAdept && !gradeStr.startsWith('ASH');

                return (
                    <div key={trial.id || trial.trialId} onClick={() => onRowClick(trial)} className="trial-card-row">

                        {/* --- LEFT: Killer Portrait --- */}
                        <div className="trial-card-left">
                            <div className="trial-list-card-wrapper">
                                <KillerCard
                                    killer={{ ...trial.killer, killerName: trial.killer?.name || trial.killerName, status: historicalStatus }}
                                    variantType={variantType}
                                    mode="active"
                                    isSelected={false}
                                />
                            </div>
                        </div>

                        {/* --- CENTER: Details & Metrics --- */}
                        <div className="trial-card-body">

                            {/* TOP ROW: Title & Finances */}
                            <div className="trial-card-header">
                                <h3 className="bebas-header-2 text-white m-0">
                                    <span className="text-normal">Trial #{trial.trialNumber} |</span> {trial.killer?.name || trial.killerName}
                                </h3>

                                {isFinancial && (
                                    <div className="trial-finances-inline">
                                        <span className={`bebas-header-2 ${trial.netIncome > 0 ? 'text-white' : 'title-iri'}`}>
                                            {trial.netIncome > 0 ? `+$${trial.netIncome}` : `-$${Math.abs(trial.netIncome || 0)}`}
                                        </span>
                                        <span className="inter-text-small text-muted ml-3">Bal: ${trial.runningBalance || 0}</span>
                                    </div>
                                )}
                            </div>

                            {/* BOTTOM ROW: The Loadout & Match Results */}
                            <div className="trial-card-metrics">

                                {/* PERKS */}
                                <div className="metric-group">
                                    <div className="trial-perks">
                                        {[0, 1, 2, 3].map(index => {
                                            const perk = trial.perks ? trial.perks[index] : null;
                                            const locked = isAdept && index === 3;
                                            return (
                                                <div key={index} className="trial-perk-slot">
                                                    {locked ? (
                                                        <div className="diamond-content flex items-center justify-center">
                                                            <img className="locked-indicator" src="/assets/Image Overlays/locked.png" alt="Locked" style={{ width: '60%' }} />
                                                        </div>
                                                    ) : perk ? (
                                                        <>
                                                            <div className="diamond-content">
                                                                <img src={perk.iconUrl || `/assets/Perks/${perk.name}.png`} alt={perk.name} />
                                                            </div>
                                                            {isFinancial && (
                                                                <div className="loadout-financial-overlay perk-mode">
                                                                    <div className="price-banner">${perk.cost || 0}</div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ADDONS OR CHAOS TOKENS */}
                                {isChaos ? (
                                    <div className="metric-group tokens-group ml-2">
                                        <img
                                            src="/assets/Variants/ReRollToken.png"
                                            className="token-icon"
                                            style={{ filter: trial.usedReRollToken ? 'none' : 'grayscale(100%) opacity(0.3)' }}
                                            alt="Reroll Token"
                                            title={trial.usedReRollToken ? "Token Used" : "Token Not Used"}
                                        />
                                        <div className="inter-text-small text-muted mt-1">Left: {trial.remainingTokens || 0}</div>
                                    </div>
                                ) : (
                                    <div className="metric-group ml-2">
                                        <div className="trial-addons">
                                            {[0, 1].map(index => {
                                                const addonList = trial.addons || trial.addOns || [];
                                                const addon = addonList[index];
                                                return (
                                                    <div key={index} className="addon-wrapper">
                                                        {index > 0 && <span className="addon-plus">+</span>}
                                                        <div className="trial-addon-slot">
                                                            {isAddonsLocked ? (
                                                                <img className="locked-indicator" src="/assets/Image Overlays/locked.png" alt="Locked" style={{ width: '60%' }} />
                                                            ) : addon ? (
                                                                <>
                                                                    <img src={addon.iconUrl || `/assets/Addons/${trial.killer?.name || trial.killerName}/${addon.name.replace('%', '')}.png`} alt={addon.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
                                                                    {isFinancial && (
                                                                        <div className="loadout-financial-overlay">
                                                                            <div className="price-banner">${addon.cost || 0}</div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* SURVIVORS */}
                                <div className="metric-group ml-4">
                                    <div className="trial-survivors">
                                        {(trial.survivors || trial.survivorResults)?.map((res, i) => {
                                            const outcome = typeof res === 'string' ? res : res.outcome;
                                            return <img key={i} src={`/assets/Survivor Status/${outcome.toLowerCase()}.png`} className="trial-survivor-status" alt={outcome} />
                                        })}
                                    </div>
                                </div>

                                {/* IRON MAN MULLIGAN */}
                                {isIronMan && (
                                    <div className="metric-group tokens-group ml-4">
                                        <img
                                            src="/assets/Variants/ReRollToken.png"
                                            className="token-icon"
                                            style={{ filter: trial.burnedMulligan ? 'none' : 'grayscale(100%) opacity(0.3)' }}
                                            alt="Mulligan Token"
                                            title={trial.burnedMulligan ? "Mulligan Burned" : "Mulligan Intact"}
                                        />
                                        <div className="inter-text-small text-muted mt-1">Burned</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- RIGHT: Grade --- */}
                        <div className="trial-card-right">
                            <GradeBadgeDisplay
                                rawGrade={trial.resultingGrade || trial.currentGrade}
                                pips={trial.resultingPips || trial.currentPips}
                                size="normal"
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default TrialListTable;
