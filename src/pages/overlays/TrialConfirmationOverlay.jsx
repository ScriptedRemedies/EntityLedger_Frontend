import React, { useState } from 'react';
import GradeBadgeDisplay from '../small-components/GradeBadgeDisplay';
import '../../styles/overlays/TrialConfirmation.scss';
import '../../styles/ChallengesPage.scss';
import '../../styles/variant-loadouts/Loadouts.scss';
import '../../styles/Animations.scss';

const TrialConfirmationOverlay = ({
                                      season,
                                      killer,
                                      selectedPerks = [],
                                      selectedAddons = [],
                                      trialCount,
                                      onCancel,
                                      onConfirm
                                  }) => {

    const [isClosing, setIsClosing] = useState(false);
    const [isHeartbeating, setIsHeartbeating] = useState(false);

    // Handles the heartbeat animation
    const handleClose = (action) => {
        if (action === 'confirm') {
            setIsHeartbeating(true); // Trigger the heartbeat and blackout
            setTimeout(() => {
                onConfirm(); // Tell parent to swap to the loading screen
            }, 4000); // Matches the end of our Terror Radius CSS animation
        } else {
            setIsClosing(true); // Standard cancel animation
            setTimeout(() => onCancel(), 300);
        }
    };

    // --- FINANCIAL MATH ---
    const isFinancial = season.variantType === 'BLOOD_MONEY' || season.variantType === 'AFTERBURN';
    const killerCost = killer?.cost || 0;
    const perksCost = selectedPerks.reduce((sum, p) => sum + (p?.cost || 0), 0);
    const addonsCost = selectedAddons.reduce((sum, a) => sum + (a?.cost || 0), 0);
    const totalCost = killerCost + perksCost + addonsCost;

    // --- ANIMATION TIMING MATH ---
    const baseDelay = 0.2;
    const addonStartDelay = baseDelay + 0.2;
    const perkStartDelay = addonStartDelay + (2 * 0.2);
    const buttonDelay = perkStartDelay + (4 * 0.2);

    return (
        // THE FIX: Restored 'modal-backdrop' so the overlay actually pops up!
        <div className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'} ${isHeartbeating ? 'backdrop-blackout' : ''}`}>

            <div className={`modal-content-box confirm-modal-layout ${isHeartbeating ? 'heartbeat-active' : (isClosing ? 'modal-slam-out' : 'modal-slam')}`} style={{ width: '850px', height: 'auto', position: 'relative', zIndex: 10 }}>

                {/* MODAL HEADER */}
                <div className="confirm-modal-header">
                    <div className="flex items-center gap-2">
                        <span className="bebas-header-2 text-muted m-0">TRIAL #{trialCount + 1}</span>
                        <span className="bebas-header-2 text-muted m-0" style={{ paddingBottom: '2px' }}>|</span>
                        <span className="bebas-header-2 title-white m-0">{killer.killerName}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {isFinancial && (
                            <div className="flex items-center gap-2">
                                <span className="inter-text-small uppercase text-muted">Total Trial Cost:</span>
                                <span className="bebas-header-2 title-iri" style={{ fontSize: '1.8rem', margin: 0 }}>-${totalCost}</span>
                            </div>
                        )}
                        <GradeBadgeDisplay rawGrade={season.currentGrade} pips={season.currentPips} size="small" />
                    </div>
                </div>

                {/* MODAL BODY */}
                <div className="confirm-modal-body">

                    {/* LEFT: KILLER */}
                    <div className="confirm-column">
                        <div
                            className="staggered-fade confirm-slot killer-slot"
                            style={{ animationDelay: `${baseDelay}s` }}
                        >
                            <img src={`/assets/Killers/${killer.killerName}.png`} alt={killer.killerName} />
                            {isFinancial && (
                                <div className="loadout-financial-overlay">
                                    <div className="price-banner">${killerCost}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: ADDONS & PERKS */}
                    <div className="confirm-column flex-1">

                        {/* ADD ONS ROW */}
                        <div className="mb-4">
                            <h3 className="bebas-header-2 mb-2 text-muted" style={{ fontSize: '1.2rem' }}>EQUIPPED ADDONS</h3>
                            <div className="confirm-flex-row">
                                {[0, 1].map(index => {
                                    const addon = selectedAddons[index];
                                    return (
                                        <React.Fragment key={index}>
                                            {index > 0 && <span className="staggered-fade addon-plus text-muted" style={{ animationDelay: `${addonStartDelay}s` }}>+</span>}
                                            <div
                                                className="staggered-fade confirm-slot square-slot"
                                                style={{ animationDelay: `${addonStartDelay + (index * 0.2)}s` }}
                                            >
                                                {addon && (
                                                    <>
                                                        <img src={`/assets/Addons/${killer.killerName}/${addon.name.replace('%', '')}.png`} alt={addon.name} />
                                                        {isFinancial && (
                                                            <div className="loadout-financial-overlay">
                                                                <div className="price-banner">${addon.cost || 0}</div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>

                        {/* PERKS ROW */}
                        <div>
                            <h3 className="bebas-header-2 mb-2 text-muted" style={{ fontSize: '1.2rem' }}>EQUIPPED PERKS</h3>
                            <div className="confirm-flex-row">
                                {[0, 1, 2, 3].map(index => {
                                    const perk = selectedPerks[index];
                                    return (
                                        <div
                                            key={index}
                                            className="staggered-fade confirm-slot diamond-slot"
                                            style={{animationDelay: `${perkStartDelay + (index * 0.2)}s`}}
                                        >
                                            {perk && (
                                                <>
                                                    <div className="diamond-content">
                                                        <img src={`/assets/Perks/${perk.name}.png`} alt={perk.name}/>
                                                    </div>

                                                    {isFinancial && (
                                                        <div className="loadout-financial-overlay perk-mode">
                                                            <div className="price-banner">${perk.cost || 0}</div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* MODAL FOOTER / ACTIONS */}
                <div className="confirm-actions staggered-fade" style={{ animationDelay: `${buttonDelay}s` }}>
                    <button className="back-button" onClick={() => handleClose('cancel')}>Back</button>
                    <button className="squareBtn" onClick={() => handleClose('confirm')}>Enter Results</button>
                </div>

            </div>
        </div>
    );
};

export default TrialConfirmationOverlay;
