import React from 'react';

const GradeBadgeDisplay = ({ rawGrade = "ASH_IV", pips = 0, size = "normal" }) => {
    const gradeParts = rawGrade.split("_");
    const badgeTier = gradeParts[0];
    const romanNum = gradeParts[1] || 'IV';

    let maxPips = 5;
    if (badgeTier === "ASH") maxPips = 3;
    else if (badgeTier === "BRONZE") maxPips = 4;

    return (
        // Dynamically inject the size parameter as a CSS class (e.g., "size-small")
        <div className={`grade-badge-display size-${size}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="badge">
                <img src={`/assets/Grades/${badgeTier}.png`} alt={romanNum} className="season-badge-image" />
                <p className="season-gradeNum" style={{ color: `var(--color-${badgeTier})` }}>{romanNum}</p>
            </div>

            {/* PIPS DISPLAY */}
            {rawGrade !== 'IRIDESCENT_I' && (
                <div className="pips-container">
                    {Array.from({ length: maxPips }).map((_, index) => {
                        const isFilled = index < pips;
                        return (
                            <div
                                key={index}
                                className={`pip ${isFilled ? 'filled' : 'empty'}`}
                                style={isFilled ? {
                                    backgroundColor: `var(--color-${badgeTier})`,
                                    border: `1px solid var(--color-${badgeTier})`,
                                    boxShadow: `0 0 5px var(--color-${badgeTier})`
                                } : {
                                    border: `1px solid var(--color-${badgeTier})`
                                }}
                            ></div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GradeBadgeDisplay;
