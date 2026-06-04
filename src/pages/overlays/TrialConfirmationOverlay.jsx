import React from 'react';
import GradeBadgeDisplay from '../small-components/GradeBadgeDisplay';
import '../../styles/overlays/TrialConfirmation.scss';
import '../../styles/ChallengesPage.scss';
import '../../styles/variant-loadouts/Loadouts.scss'; // Inherit exact loadout styles for pricing!

const TrialConfirmationOverlay = ({
                                      season,
                                      killer,
                                      selectedPerks = [],
                                      selectedAddons = [],
                                      trialCount,
                                      onCancel,
                                      onConfirm
                                  }) => {

    // --- FINANCIAL MATH ---
    const isFinancial = season.variantType === 'BLOOD_MONEY' || season.variantType === 'AFTERBURN';
    const killerCost = killer?.cost || 0;
    const perksCost = selectedPerks.reduce((sum, p) => sum + (p?.cost || 0), 0);
    const addonsCost = selectedAddons.reduce((sum, a) => sum + (a?.cost || 0), 0);
    const totalCost = killerCost + perksCost + addonsCost;

    // --- ANIMATION TIMING MATH ---
    const baseDelay = 0.2;
    const perkStartDelay = baseDelay + 0.2;
    const addonStartDelay = perkStartDelay + (4 * 0.2); // Assumes max 4 perks
    const buttonDelay = addonStartDelay + (2 * 0.2);    // Assumes max 2 addons

    return (
        <div className="trial-confirmation-overlay fade-in">
            <div className="login-fog-bg"></div>

            <div className="confirmation-content">

                {/* HEADER */}
                <div className="confirm-header" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <div className="flex items-center gap-4">
                        <GradeBadgeDisplay rawGrade={season.currentGrade} pips={season.currentPips} size="small" />
                        <span className="inter-text-normal text-normal uppercase">
                            {season.variantType.replace('_', ' ')} - Trial #{trialCount + 1}
                        </span>
                    </div>

                    {isFinancial && (
                        <div className="flex items-center gap-2">
                            <span className="inter-text-small uppercase">Total Trial Cost:</span>
                            <span className="bebas-header-2 title-iri" style={{ fontSize: '1.8rem', margin: 0 }}>-${totalCost}</span>
                        </div>
                    )}
                </div>

                {/* LOADOUT ROW */}
                <div className="confirm-loadout-row">

                    {/* KILLER */}
                    <div className="confirm-column">
                        <h3 className="bebas-header-2">KILLER</h3>
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

                    {/* PERKS */}
                    <div className="confirm-column mx-8">
                        <h3 className="bebas-header-2 mb-3">PERKS</h3>
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
                                                <img src={`/assets/Perks/${perk.name}.png`} alt={perk.name}/>
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

                    {/* ADD ONS */}
                    <div className="confirm-column">
                        <h3 className="bebas-header-2 mb-6">ADDONS</h3>
                        <div className="confirm-flex-row align-center">
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

                </div>

                {/* ACTION BUTTONS */}
                <div className="confirm-actions staggered-fade" style={{ animationDelay: `${buttonDelay}s` }}>
                    <button className="squareBtn" onClick={onConfirm}>Enter Results</button>
                    <button className="back-button" onClick={onCancel}>Cancel</button>
                </div>

            </div>
        </div>
    );
};

export default TrialConfirmationOverlay;
