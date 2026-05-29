import React from 'react';
import GradeBadgeDisplay from '../small-components/GradeBadgeDisplay';
import '../../styles/overlays/TrialConfirmation.scss';
import '../../styles/ChallengesPage.scss';

const TrialConfirmationOverlay = ({
                                      season,
                                      killer,
                                      selectedPerks = [],
                                      selectedAddons = [],
                                      trialCount,
                                      onCancel,
                                      onConfirm
                                  }) => {

    // --- ANIMATION TIMING MATH ---
    const baseDelay = 0.2;
    const perkStartDelay = baseDelay + 0.2;
    const addonStartDelay = perkStartDelay + (4 * 0.2); // Assumes max 4 perks
    const buttonDelay = addonStartDelay + (2 * 0.2);    // Assumes max 2 addons

    return (
        <div className="trial-confirmation-overlay fade-in">
            {/* Background Fog overlay */}
            <div className="login-fog-bg"></div>

            <div className="confirmation-content">

                {/* HEADER (Standard Fade) */}
                <div className="confirm-header">
                    <GradeBadgeDisplay rawGrade={season.currentGrade} pips={season.currentPips} size="small" />
                    <span className="inter-text-normal text-normal uppercase">
                        {season.variantType.replace('_', ' ')} - Trial #{trialCount + 1}
                    </span>
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
                        </div>
                    </div>

                    {/* PERKS */}
                    {/* TODO: Make the perks locked if they are locked in the UI */}
                    <div className="confirm-column mx-8">
                        <h3 className="bebas-header-2 mb-3">PERKS</h3>
                        <div className="confirm-flex-row">
                            {/* Loop 4 times to ensure empty slots still render as blank diamonds if needed */}
                            {[0, 1, 2, 3].map(index => {
                                const perk = selectedPerks[index];
                                return (
                                    <>
                                        <div
                                            key={index}
                                            className="staggered-fade confirm-slot diamond-slot"
                                            style={{animationDelay: `${perkStartDelay + (index * 0.2)}s`}}
                                        >
                                            {perk && <img src={`/assets/Perks/${perk.name}.png`} alt={perk.name}/>}
                                        </div>
                                    </>
                                );
                            })}
                        </div>
                    </div>

                    {/* ADD ONS */}
                    {/* TODO: Make the addons locked if they are locked in the UI */}
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
                                            {addon && <img src={`/assets/Addons/${killer.killerName}/${addon.name.replace('%', '')}.png`} alt={addon.name} />}
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
