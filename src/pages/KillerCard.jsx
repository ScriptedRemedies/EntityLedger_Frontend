import React from 'react';
import '../styles/KillerCard.scss';

// Added 'mode' prop with a default of 'active'
const KillerCard = ({ killer, variantType, isSelected, onSelect, currentBalance = 0, mode = 'active' }) => {

    // --- MODE CHECKS ---
    const isReviewMode = mode === 'review';

    // --- STATE LOGIC (Only applies if we are in an active game) ---
    const isDead = !isReviewMode && killer.status === 'DEAD';
    const isLocked = !isReviewMode && killer.status === 'LOCKED';
    const isCooldown = !isReviewMode && killer.status === 'COOLDOWN';
    const isSold = !isReviewMode && killer.status === 'SOLD';

    // Financial logic for Blood Money / Afterburn
    const isFinancialVariant = variantType === 'BLOOD_MONEY' || variantType === 'AFTERBURN';
    const mustSell = isFinancialVariant && currentBalance < 0;
    const isPriced = isFinancialVariant && !isDead && !isSold && !isReviewMode;

    // --- CLICK HANDLER ---
    const handleClick = () => {
        // In an active game, prevent clicking dead/locked/sold killers
        if (!isReviewMode && (isDead || isLocked || isCooldown || isSold)) {
            return;
        }
        onSelect();
    };

    // --- DYNAMIC CLASSES ---
    // We build the CSS classes based on the calculated states
    let cardClasses = 'killer-card ';

    if (isReviewMode) {
        // Simple states for the Start Challenge / Review pages
        cardClasses += isSelected ? 'state-selected' : 'state-deselected';
    } else {
        // Complex states for the Current Season page
        if (isSelected) cardClasses += 'state-selected ';
        else if (isDead) cardClasses += 'state-dead ';
        else if (isSold) cardClasses += 'state-sold ';
        else cardClasses += 'state-available '; // Normal active state
    }

    // --- OVERLAY RENDERING ---
    const renderOverlay = () => {
        if (isReviewMode) return null; // Review screens never have locks or prices

        if (isLocked) {
            return <img src="/assets/icons/lock.png" className="card-overlay-icon" alt="Locked" />;
        }
        if (isCooldown) {
            return <img src="/assets/icons/stopwatch.png" className="card-overlay-icon" alt="Cooldown" />;
        }
        if (isPriced) {
            // If they are in debt, show the red SELL state on hover. Otherwise, just show the price.
            return (
                <div className={`price-overlay ${mustSell ? 'sell-mode' : ''}`}>
                    <span className="price-text">${killer.cost}</span>
                    {mustSell && <span className="sell-text">SELL</span>}
                </div>
            );
        }
        return null;
    };

    return (
        <div onClick={handleClick} className={`killer-card ${cardClasses}`}>
            <img
                src={`/assets/Killers/${killer.killerName}.png`}
                alt={killer.killerName}
                className="killer-portrait"
            />
            {renderOverlay()}
        </div>
    );
};

export default KillerCard;
