import React, { useState, useEffect } from 'react';
import GradeBadgeDisplay from '../small-components/GradeBadgeDisplay.jsx';
import '../../styles/small-components/TrialComponent.scss';
import '../../styles/small-components/Modals.scss';

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

const TrialDetailsModal = ({ trial, trials = [], variantType, onClose }) => {

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (trial && trials.length > 0) {
            const index = trials.findIndex(t => (t.id || t.trialId) === (trial.id || trial.trialId));
            if (index !== -1) setActiveIndex(index);
        }
    }, [trial, trials]);

    if (!trial) return null;

    const activeTrial = trials.length > 0 ? trials[activeIndex] : trial;
    if (!activeTrial) return null;

    const isAdept = variantType === 'ADEPT';
    const isFinancial = variantType === 'BLOOD_MONEY' || variantType === 'AFTERBURN';
    const isChaos = variantType === 'CHAOS_SHUFFLE';
    const isIronMan = variantType === 'IRON_MAN';

    const gradeStr = activeTrial.currentGrade || activeTrial.resultingGrade || 'ASH_IV';
    const isAddonsLocked = isAdept && !gradeStr.startsWith('ASH');

    const handlePrev = () => { if (activeIndex > 0) setActiveIndex(activeIndex - 1); };
    const handleNext = () => { if (activeIndex < trials.length - 1) setActiveIndex(activeIndex + 1); };

    const trialCost = (activeTrial.killer?.cost || activeTrial.killerCost || 0) +
        (activeTrial.perks || []).reduce((sum, p) => sum + (p?.cost || 0), 0) +
        (activeTrial.addons || activeTrial.addOns || []).reduce((sum, a) => sum + (a?.cost || 0), 0);

    // Match Revenue is the raw gameplay earnings minus gameplay penalties
    const matchRevenue = (activeTrial.netIncome || 0) + trialCost;

    return (
        <div className="modal-backdrop fade-in">
            <div className="modal-content-box modal-slam" style={{ width: '90vw', maxWidth: '850px', maxHeight: '90vh', padding: 0 }}>

                {/* === HEADER === */}
                <div className="modal-header">
                    <h2 className="bebas-header-1 title-white m-0 text-3xl flex items-center">
                        <span className="text-normal mr-2">TRIAL #{activeTrial.trialNumber} |</span> {activeTrial.killer?.name || activeTrial.killerName}
                        {isFinancial && (
                            <span className="title-iri ml-3">${activeTrial.killer?.cost || activeTrial.killerCost || 0}</span>
                        )}
                    </h2>

                    <div className="flex items-center gap-6">
                        {isFinancial && (
                            <div className="text-right">
                                <div className={`bebas-header-2 m-0 ${activeTrial.netIncome > 0 ? 'text-white' : 'title-iri'}`}>
                                    {activeTrial.netIncome > 0 ? `+$${activeTrial.netIncome}` : `-$${Math.abs(activeTrial.netIncome || 0)}`}
                                </div>
                                <div className="inter-text-small text-muted">Bal: ${(activeTrial.runningBalance || 0) + (activeTrial.netIncome || 0)}</div>
                            </div>
                        )}
                        <GradeBadgeDisplay rawGrade={activeTrial.resultingGrade || activeTrial.currentGrade} pips={activeTrial.resultingPips || activeTrial.currentPips} size="small" />
                        <button onClick={onClose} className="close-modal-btn">✕</button>
                    </div>
                </div>

                {/* === MODAL BODY === */}
                <div className="modal-body td-body hide-scrollbar">

                    <div className="td-col-left flex flex-col gap-8">

                        {/* PERKS */}
                        <div>
                            <h4 className="bebas-header-2 td-section-title">EQUIPPED PERKS</h4>
                            <div className="td-grid-2x2">
                                {[0, 1, 2, 3].map(index => {
                                    const perk = activeTrial.perks ? activeTrial.perks[index] : null;
                                    const locked = isAdept && index === 3;

                                    return (
                                        <div key={index} className="td-item-row">
                                            <div className="td-slot-diamond">
                                                {locked ? (
                                                    <img src="/assets/Image%20Overlays/locked.png" alt="Locked" style={{ width: '50%', transform: 'rotate(-45deg)', opacity: 0.5 }} />
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
                                            <span className="td-item-text">{locked ? 'Restricted Slot' : perk ? perk.name : 'Empty Slot'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ADDONS OR TOKENS */}
                        {isChaos ? (
                            <div>
                                <h4 className="bebas-header-2 td-section-title">THE ENTITY'S ROULETTE</h4>
                                <div className="td-item-row mt-4">
                                    <img
                                        src="/assets/Variants/ReRollToken.png"
                                        alt="Reroll Token"
                                        style={{ width: '50px', objectFit: 'contain', filter: activeTrial.usedReRollToken ? 'none' : 'grayscale(100%) opacity(0.3)' }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="td-item-text text-white">Re-roll Token {activeTrial.usedReRollToken ? 'Used' : 'Not Used'}</span>
                                        <span className="td-item-text">{activeTrial.remainingTokens || 0} Tokens Remaining</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h4 className="bebas-header-2 td-section-title">EQUIPPED ADD ONS</h4>
                                <div className="td-grid-2x2">
                                    {[0, 1].map(index => {
                                        const addonList = activeTrial.addons || activeTrial.addOns || [];
                                        const addon = addonList[index];

                                        return (
                                            <div key={index} className="td-item-row">
                                                <div className="td-slot-square">
                                                    {isAddonsLocked ? (
                                                        <img src="/assets/Image%20Overlays/locked.png" alt="Locked" style={{ width: '50%', opacity: 0.5 }} />
                                                    ) : addon ? (
                                                        <>
                                                            <img src={addon.iconUrl || `/assets/Addons/${activeTrial.killer?.name || activeTrial.killerName}/${addon.name.replace('%', '')}.png`} alt={addon.name} />
                                                            {isFinancial && (
                                                                <div className="loadout-financial-overlay">
                                                                    <div className="price-banner">${addon.cost || 0}</div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : null}
                                                </div>
                                                <span className="td-item-text">{isAddonsLocked ? 'Restricted at current grade' : addon ? addon.name : 'Empty Slot'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* --- ECONOMY LEDGER --- */}
                        {isFinancial && (
                            <div>
                                <h4 className="bebas-header-2 td-section-title">ECONOMY LEDGER</h4>
                                <div className="td-item-row mt-4" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                    <div className="flex justify-between w-full pr-8">
                                        <span className="td-item-text">Total Trial Cost</span>
                                        <span className="td-item-text title-iri">-${trialCost}</span>
                                    </div>
                                    <div className="flex justify-between w-full pr-8">
                                        <span className="td-item-text">Match Revenue (Earnings - Penalties)</span>
                                        <span className={`td-item-text ${matchRevenue >= 0 ? 'text-white' : 'title-iri'}`}>
                                                {matchRevenue >= 0 ? `+$${matchRevenue}` : `-$${Math.abs(matchRevenue)}`}
                                            </span>
                                    </div>
                                    <div className="w-full pr-8"><div className="w-full h-px bg-white opacity-20 my-1"></div></div>
                                    <div className="flex justify-between w-full pr-8 items-end">
                                        <span className="td-item-text text-white">Net Profit</span>
                                        <span className={`bebas-header-2 m-0 text-2xl ${activeTrial.netIncome >= 0 ? 'text-white' : 'title-iri'}`}>
                                                {activeTrial.netIncome >= 0 ? `+$${activeTrial.netIncome}` : `-$${Math.abs(activeTrial.netIncome || 0)}`}
                                            </span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="td-col-right flex flex-col gap-8">

                        {/* SURVIVORS */}
                        <div>
                            <h4 className="bebas-header-2 td-section-title">SURVIVOR OUTCOMES</h4>
                            <div className="td-grid-2x2">
                                {(activeTrial.survivors || activeTrial.survivorResults)?.map((res, i) => {
                                    const outcome = typeof res === 'string' ? res : res.outcome;
                                    return (
                                        <div key={i} className="td-item-row">
                                            <img src={`/assets/Survivor Status/${outcome.toLowerCase()}.png`} style={{ width: '45px', objectFit: 'contain' }} alt={outcome} />
                                            <span className="td-item-text text-white">{SURVIVOR_DISPLAY_MAP[outcome] || outcome}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* EMBLEMS */}
                        <div>
                            <h4 className="bebas-header-2 td-section-title">
                                EARNED EMBLEMS <span className="text-normal text-lg ml-2">{activeTrial.pipProgression > 0 ? `+${activeTrial.pipProgression} Pips` : ''}</span>
                            </h4>
                            <div className="td-grid-2x2">
                                {activeTrial.emblems?.map((emb, i) => {
                                    const path = emb.iconUrl || `/assets/Emblems/${emb.category}_${emb.type}.png`;
                                    return (
                                        <div key={i} className="td-item-row">
                                            <img src={path} style={{ width: '55px', objectFit: 'contain' }} alt={emb.category} />
                                            <span className="td-item-text text-white">{EMBLEM_DISPLAY_MAP[emb.category] || emb.category}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* IRON MAN MULLIGAN */}
                        {isIronMan && (
                            <div>
                                <h4 className="bebas-header-2 td-section-title">MULLIGAN STATUS</h4>
                                <div className="td-item-row mt-4">
                                    <img
                                        src="/assets/Variants/ReRollToken.png"
                                        alt="Mulligan Token"
                                        style={{ width: '50px', objectFit: 'contain', filter: activeTrial.burnedMulligan ? 'none' : 'grayscale(100%) opacity(0.3)' }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="td-item-text text-white">Mulligan {activeTrial.burnedMulligan ? 'Burned' : 'Intact'}</span>
                                        <span className="td-item-text">{activeTrial.flawlessTrial ? 'Flawless Trial Achieved!' : 'Standard Performance'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* === NEW MODAL FOOTER === */}
                <div className="modal-footer">
                    <button className="back-button m-0" disabled={activeIndex === 0} onClick={handlePrev}>Previous</button>
                    <span className="inter-text-small">{activeIndex + 1} of {trials.length}</span>
                    <button className="squareBtn m-0" disabled={activeIndex === trials.length - 1} onClick={handleNext}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default TrialDetailsModal;
