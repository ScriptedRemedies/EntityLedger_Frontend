import React from 'react';
import GradeBadgeDisplay from './GradeBadgeDisplay.jsx';
import KillerCard from './KillerCard.jsx';
import '../../styles/small-components/TrialComponent.scss';

const TrialListTable = ({ trials, variantType, onRowClick }) => {

    // --- VARIANT FLAGS ---
    const isAdept = variantType === 'ADEPT';
    const isFinancial = variantType === 'BLOOD_MONEY' || variantType === 'AFTERBURN';
    const isChaos = variantType === 'CHAOS_SHUFFLE';
    const isIronMan = variantType === 'IRON_MAN';

    // --- DYNAMIC GRID LAYOUT ---
    let gridCols = 'minmax(410px, 2.5fr) minmax(140px, 1fr) minmax(170px, 1fr) minmax(100px, 1fr)';
    if (isFinancial) gridCols = 'minmax(350px, 2.5fr) minmax(140px, 1fr) minmax(150px, 1fr) minmax(120px, 1fr) minmax(100px, 1fr)';
    if (isChaos) gridCols = 'minmax(410px, 2.5fr) minmax(140px, 1fr) minmax(170px, 1fr) minmax(100px, 1fr)'; // Replaces Addons with Tokens
    if (isIronMan) gridCols = 'minmax(350px, 2.5fr) minmax(140px, 1fr) minmax(150px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)';

    // --- LOCK LOGIC ---
    const isPerkLocked = (index) => isAdept && index === 3;
    const isAddonLocked = (trial) => isAdept && trial.currentGrade && !trial.currentGrade.startsWith('ASH');

    return (
        <div className="trials-table" style={{ '--grid-columns': gridCols }}>
            <div className="trials-table-header">
                <div className="table-col-1">Perks</div>
                <div className="table-col-center">{isChaos ? 'Tokens' : 'Add Ons'}</div>
                <div className="table-col-center">Survivor Status</div>
                {isFinancial && <div className="table-col-center">Ledger</div>}
                {isIronMan && <div className="table-col-center">Mulligan</div>}
                <div className="table-col-right">Grade</div>
            </div>

            {trials.map(trial => {
                const killerDiedInTrial = trial.survivors?.some(res => res.outcome.toUpperCase() === 'ESCAPED');
                const historicalStatus = killerDiedInTrial ? 'DEAD' : 'AVAILABLE';

                return (
                    <div key={trial.id || trial.trialId} onClick={() => onRowClick(trial)} className="trial-row">

                        <div className="trial-killer-info">
                            <div className="trial-list-card-wrapper">
                                <KillerCard
                                    killer={{ ...trial.killer, killerName: trial.killer?.name || trial.killerName, status: historicalStatus }}
                                    variantType={variantType}
                                    mode="active"
                                    isSelected={false}
                                />
                            </div>
                            <div className="trial-killer-details">
                                <p className="trial-killer-name"><span className="inter-text-normal">Trial #{trial.trialNumber} |</span> {trial.killer?.name || trial.killerName}</p>
                                <div className="trial-perks">
                                    {[0, 1, 2, 3].map(index => {
                                        const perk = trial.perks ? trial.perks[index] : null;
                                        const locked = isPerkLocked(index);
                                        return (
                                            <div key={index} className="trial-perk-slot">
                                                {locked ? (
                                                    <img src="/assets/Image Overlays/locked.png" className="locked-padlock-diamond" alt="Locked" />
                                                ) : perk ? (
                                                    <>
                                                        <img src={perk.iconUrl || `/assets/Perks/${perk.name}.png`} className="trial-perk-image" alt={perk.name} />
                                                        {isFinancial && <div className="item-price">${perk.cost}</div>}
                                                    </>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: Addons OR Chaos Tokens */}
                        {isChaos ? (
                            <div className="trial-tokens-col">
                                <img
                                    src="/assets/Variants/ReRollToken.png"
                                    className="token-icon"
                                    style={{ filter: trial.usedReRollToken ? 'none' : 'grayscale(100%) opacity(0.3)' }}
                                    alt="Reroll Token"
                                />
                                <div className="inter-text-small text-muted mt-1">Left: {trial.remainingTokens}</div>
                            </div>
                        ) : (
                            <div className="trial-addons">
                                {[0, 1].map(index => {
                                    const addon = trial.addons || trial.addOns ? (trial.addons || trial.addOns)[index] : null;
                                    const locked = isAddonLocked(trial);
                                    return (
                                        <div key={index} className="addon-wrapper">
                                            {index > 0 && <span className="addon-plus">+</span>}
                                            <div className="trial-addon-slot">
                                                {locked ? (
                                                    <img src="/assets/Image Overlays/locked.png" className="locked-padlock-square" alt="Locked" />
                                                ) : addon ? (
                                                    <>
                                                        <img src={`/assets/Addons/${trial.killer.name}/${addon.name.replace('%', '')}.png`} className="addon-image" alt={addon.name} />
                                                        {isFinancial && <div className="item-price">${addon.cost}</div>}
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* COLUMN 3: Survivors */}
                        <div className="trial-survivors">
                            {(trial.survivors || trial.survivorResults)?.map((res, i) => {
                                const outcome = typeof res === 'string' ? res : res.outcome;
                                return <img key={i} src={`/assets/Survivor Status/${outcome.toLowerCase()}.png`} className="trial-survivor-status" alt={outcome} />
                            })}
                        </div>

                        {/* COLUMN 4/5 (Dynamic): Financials */}
                        {isFinancial && (
                            <div className="trial-finances flex flex-col items-center">
                                <div className={`bebas-header-2 ${trial.netIncome > 0 ? 'text-white' : 'title-iri'}`}>
                                    {trial.netIncome > 0 ? `+$${trial.netIncome}` : `-$${Math.abs(trial.netIncome)}`}
                                </div>
                                <div className="inter-text-small text-muted">Bal: ${trial.runningBalance}</div>
                            </div>
                        )}

                        {/* COLUMN 4/5 (Dynamic): Iron Man Tokens */}
                        {isIronMan && (
                            <div className="trial-tokens-col flex justify-center">
                                <img
                                    src="/assets/Variants/ReRollToken.png"
                                    className="token-icon"
                                    style={{ width: '35px', filter: trial.burnedMulligan ? 'none' : 'grayscale(100%) opacity(0.3)' }}
                                    alt="Mulligan Token"
                                />
                            </div>
                        )}

                        {/* FINAL COLUMN: Grade */}
                        <div className="trial-grade">
                            <GradeBadgeDisplay
                                rawGrade={trial.resultingGrade || trial.currentGrade}
                                pips={trial.resultingPips || trial.currentPips}
                                size="small"
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default TrialListTable;
