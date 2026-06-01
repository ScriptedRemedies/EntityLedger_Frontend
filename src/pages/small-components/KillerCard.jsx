import React from 'react';
import '../../styles/small-components/KillerCard.scss';

const KillerCard = ({ killer, variantType, isSelected, onSelect, onSell, currentBalance = 0, mode = 'active', isVariantCooldown = false, isUnaffordable = false, isBankrupt = false }) => {

    // --- MODE CHECKS ---
    const isReviewMode = mode === 'review';

    // --- STATE LOGIC (Only applies if we are in an active game) ---
    const isDead = !isReviewMode && killer.status === 'DEAD';
    const isLockedDb = !isReviewMode && killer.status === 'LOCKED';
    const isCooldown = !isReviewMode && (killer.status === 'COOLDOWN' || isVariantCooldown);
    const isSold = !isReviewMode && killer.status === 'SOLD';

    // Financial logic for Blood Money / Afterburn
    const isFinancialVariant = variantType === 'BLOOD_MONEY' || variantType === 'AFTERBURN';
    const mustSell = isFinancialVariant && isBankrupt;
    const isPriced = isFinancialVariant && !isDead && !isSold && !isReviewMode;

    // --- NEW: Dynamic Lock for Unaffordable Killers ---
    // If they can't afford it, it functionally acts as a locked card
    const isLocked = isLockedDb || (!isReviewMode && isUnaffordable && !isSelected && !mustSell && !isDead && !isSold);

    // --- CLICK HANDLER ---
    const handleClick = () => {

        // 1. BANKRUPTCY OVERRIDE (Fires First)
        if (!isReviewMode && mustSell) {
            // You still cannot sell a killer that is already dead or sold
            if (isDead || isSold) return;

            if (onSell) {
                onSell(killer);
            }
            return;
        }

        // 2. NORMAL PLAY MODE RESTRICTIONS
        if (!isReviewMode && (isDead || isLockedDb || isCooldown || isSold || isLocked)) {
            return;
        }

        onSelect();
    };

    // --- DYNAMIC CLASSES ---
    let cardClasses = 'killer-card ';

    if (isReviewMode) {
        cardClasses += isSelected ? 'state-selected' : 'state-deselected';
    } else {
        if (isDead) cardClasses += 'state-dead';
        else if (isSold) cardClasses += 'state-sold';
        else if (isCooldown) cardClasses += 'state-cooldown';
        else if (isLocked) cardClasses += 'state-locked';
        else if (isSelected) cardClasses += 'state-selected';
        else cardClasses += 'state-available';
    }

    const renderOverlay = () => {
        const overlays = [];

        // 1. Core Status Overlays (Prioritizing Permanent States First)
        if (isDead) {
            overlays.push(<div key="dead" className="text-overlay-diagonal">DEAD</div>);
        } else if (isSold) {
            overlays.push(<div key="sold" className="text-overlay-diagonal">SOLD</div>);
        } else if (isCooldown) {
            overlays.push(
                <div key="cooldown" className="card-overlay-dim" title="Killer is on Cooldown.">
                    <img src="/assets/Image Overlays/cooldown.png" className="card-overlay-full" alt="Cooldown"/>
                </div>
            );
        } else if (isLocked) {
            overlays.push(
                <div key="locked" className="card-overlay-dim">
                    <img src="/assets/Image Overlays/locked.png" className="card-overlay-full" alt="Locked"/>
                </div>
            );
        }

        // 2. Financial Overlay (Stacks on top of the dim/padlock background)
        if (isPriced) {
            overlays.push(
                <div key="priced" className={`financial-overlay ${mustSell ? 'can-slide' : ''}`}>
                    <div className="price-banner">${killer.cost}</div>
                    {mustSell && <div className="sell-banner">SELL</div>}
                </div>
            );
        }

        return overlays;
    };

    return (
        <div
            onClick={handleClick}
            className={cardClasses}
            style={{ cursor: (isLocked && !mustSell) ? 'not-allowed' : 'pointer' }}
        >
            <img
                src={`/assets/Killers/${killer.killerName}.png`}
                alt={killer.killerName}
                className="killer-portrait"
                // Applies the grey filter dynamically without needing an extra SCSS block
                style={{ filter: isLocked ? 'grayscale(100%) brightness(0.5)' : '' }}
            />
            {renderOverlay()}
        </div>
    );
};

export default KillerCard;
