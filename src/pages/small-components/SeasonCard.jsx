import React from 'react';
import GradeBadgeDisplay from './GradeBadgeDisplay.jsx';
import '../../styles/small-components/SeasonCard.scss';

const GRADE_PROGRESSION = [
    "ASH_IV", "ASH_III", "ASH_II", "ASH_I",
    "BRONZE_IV", "BRONZE_III", "BRONZE_II", "BRONZE_I",
    "SILVER_IV", "SILVER_III", "SILVER_II", "SILVER_I",
    "GOLD_IV", "GOLD_III", "GOLD_II", "GOLD_I",
    "IRIDESCENT_IV", "IRIDESCENT_III", "IRIDESCENT_II", "IRIDESCENT_I"
];

const SeasonCard = ({ season, onClick, hideOverlay = false }) => {
    // --- DATA FORMATTING ---
    const currentGradeRaw = season.currentGrade || "ASH_IV";
    const gradeName = currentGradeRaw.replace("_", " ");
    const seasonPips = season.currentPips || 0;
    const displayStatus = season.status === 'ACTIVE' ? 'IN_PROGRESS' : season.status;

    const currentIndex = GRADE_PROGRESSION.indexOf(currentGradeRaw);
    const nextGradeName = currentIndex !== -1 && currentIndex < GRADE_PROGRESSION.length - 1
        ? GRADE_PROGRESSION[currentIndex + 1].replace("_", " ")
        : "MAX RANK";

    const start = season.startDate ? new Date(season.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown';
    const completed = season.endDate ? new Date(season.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Current';
    const dateRange = `${start} - ${completed}`;

    const badge = currentGradeRaw.split("_")[0];
    const nextGradeColor = nextGradeName.split(" ")[0];

    // --- RESULT TEXT ---
    const getResultTitle = (grade) => {
        if (!grade) return "IN PROGRESS";
        if (grade.includes("ASH") || grade.includes("BRONZE III")) return "THE ENTITY HUNGERS";
        if (grade.includes("BRONZE II") || grade.includes("SILVER")) return "BRUTAL KILLER";
        if (grade.includes("GOLD") || grade.includes("IRIDESCENT II")) return "RUTHLESS KILLER";
        return "MERCILESS KILLER";
    };

    return (
        <div onClick={() => onClick(season)} className="season-card">
            <div className="season-card-base">
                <p className="season-date inter-text-small text-muted">
                    {displayStatus === 'IN_PROGRESS' ? 'Current' : dateRange}
                </p>
                <h3 className="bebas-header-2 text-center" style={{ color: `var(--color-${badge})` }}>
                    {gradeName}
                </h3>
                <GradeBadgeDisplay rawGrade={currentGradeRaw} pips={seasonPips} />
                <p className="season-next-grade inter-text-small">Next Grade</p>
                <p style={{ color: `var(--color-${nextGradeColor})` }}>{nextGradeName}</p>
            </div>
            {displayStatus !== "IN_PROGRESS" && !hideOverlay && (
                <div className="season-card-overlay">
                    <p className="season-result-label text-size-normal text-muted uppercase">Result</p>
                    <h2 className="bebas-header-1 season-result-title">{getResultTitle(gradeName)}</h2>
                </div>
            )}
        </div>
    );
};

export default SeasonCard;
