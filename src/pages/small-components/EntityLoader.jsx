import React from 'react';
import '../../styles/Animations.scss';

const EntityLoader = ({ iconPath = '/assets/killerIcon.png' }) => {
    return (
        <div className="entity-loader-container fade-in">
            {/* 1. The dimmed background icon */}
            <img src={iconPath} alt="Loading..." className="loader-base-icon" />

            {/* 2. The Iridescent Red fill mask */}
            <div
                className="loader-fill-mask"
                style={{
                    WebkitMaskImage: `url('${iconPath}')`,
                    maskImage: `url('${iconPath}')`
                }}
            ></div>
        </div>
    );
};

export default EntityLoader;
