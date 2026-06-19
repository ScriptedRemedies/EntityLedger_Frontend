import React from 'react';
import '../../styles/small-components/KillerStatsCard.scss';

const KillerStatsCard = ({ title, killerName, primaryText, secondaryText, isNegative = false }) => {
    return (
        <div className="killer-award-card">
            <h4 className={`stats-title bebas-header-2 text-white ${isNegative ? "weakest-link-header" : ""}`}>
                {title}
            </h4>
            <img
                src={`/assets/Killers/${killerName}.png`}
                className={`stat-killer-slot ${isNegative ? "weakest-link-img" : ""}`}
                alt={killerName}
            />
            <div className="award-text">
                <p className="inter-text-small uppercase m-0">{primaryText}</p>
                <p className="inter-text-small m-0">{secondaryText}</p>
            </div>
        </div>
    );
};

export default KillerStatsCard;
