import React from 'react';
import GradeBadgeDisplay from './GradeBadgeDisplay.jsx';
import KillerCard from './KillerCard.jsx';
import '../../styles/small-components/TrialComponent.scss';

const TrialListTable = ({ trials, variantType, onRowClick }) => {
    return (
        <div className="trials-table">
            <div className="trials-table-header">
                <div className="table-col-1">Perks</div>
                <div className="table-col-center">Add Ons</div>
                <div className="table-col-center">Survivor Status</div>
                <div className="table-col-right">Grade</div>
            </div>

            {trials.map(trial => {
                const killerDiedInTrial = trial.survivors?.some(
                    res => res.outcome.toUpperCase() === 'ESCAPED'
                );
                const historicalStatus = killerDiedInTrial ? 'DEAD' : 'AVAILABLE';

                return (
                    <div key={trial.id} onClick={() => onRowClick(trial)} className="trial-row">

                        <div className="trial-killer-info">
                            <div className="trial-list-card-wrapper">
                                <KillerCard
                                    killer={{ ...trial.killer, killerName: trial.killer.name, status: historicalStatus }}
                                    variantType={variantType}
                                    mode="active"
                                    isSelected={false}
                                />
                            </div>
                            <div className="trial-killer-details">
                                <p className="trial-killer-name"><span className="inter-text-normal">Trial #{trial.trialNumber} |</span> {trial.killer.name}</p>
                                <div className="trial-perks">
                                    {[0, 1, 2, 3].map(index => {
                                        const perk = trial.perks ? trial.perks[index] : null;
                                        return (
                                            <div key={index} className="trial-perk-slot">
                                                {perk && <img src={`/assets/Perks/${perk.name}.png`} className="trial-perk-image" alt={perk.name} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="trial-addons">
                            {[0, 1].map(index => {
                                const addon = trial.addOns ? trial.addOns[index] : null;
                                return (
                                    <div key={index} className="addon-wrapper">
                                        {index > 0 && <span className="addon-plus">+</span>}
                                        <div className="trial-addon-slot">
                                            {addon && <img src={`/assets/Addons/${trial.killer.name}/${addon.name.replace('%', '')}.png`} className="addon-image" alt={addon.name} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="trial-survivors">
                            {trial.survivors?.map((res, i) => (
                                <img key={i} src={`/assets/Survivor Status/${res.outcome.toLowerCase()}.png`} className="trial-survivor-status" alt={res.outcome} />
                            ))}
                        </div>

                        <div className="trial-grade">
                            <GradeBadgeDisplay
                                rawGrade={trial.resultingGrade}
                                pips={trial.resultingPips}
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
