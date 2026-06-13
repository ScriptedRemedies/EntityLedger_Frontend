import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/variant-loadouts/Loadouts.scss';

const MasterLoadout = ({
                           currentKiller,
                           selectedPerks,
                           setSelectedPerks,
                           selectedAddons,
                           setSelectedAddons,
                           season,
                           setUsedReRollToken,
                           usedPerks = [],
                           usedAddOns = []
                       }) => {

    // ==========================================
    // 1. RULES ENGINE (Driven by Variant Type)
    // ==========================================
    const variantType = season?.variantType || 'STANDARD';
    const currentGrade = season?.currentGrade || 'ASH_IV';
    const isAshGrade = currentGrade.startsWith("ASH");
    const isChaos = variantType === 'CHAOS_SHUFFLE';
    const isIronMan = variantType === 'IRON_MAN';
    const isFinancialVariant = variantType === 'BLOOD_MONEY' || variantType === 'AFTERBURN';

    // --- BLOOD MONEY CALCULATIONS ---
    const startingBalance = season?.variantState?.balance || 0;
    const killerCost = currentKiller?.cost || 0;
    const loadoutCost = selectedPerks.reduce((sum, p) => sum + (p?.cost || 0), 0) +
        selectedAddons.reduce((sum, a) => sum + (a?.cost || 0), 0);
    const currentBalance = startingBalance - killerCost - loadoutCost;

    const rules = {
        maxPerks: variantType === 'ADEPT' ? 3 : 4,
        maxAddons: 2,
        perksLocked: variantType === 'ADEPT',
        addonsLocked: (variantType === 'ADEPT' && !isAshGrade) || isChaos,
        defaultTab: variantType === 'ADEPT' ? 'ADDONS' : 'PERKS',
        hasInventory: !isChaos
    };

    // ==========================================
    // 2. STATE & FETCHING
    // ==========================================
    const [allPerks, setAllPerks] = useState([]);
    const [killerAddons, setKillerAddons] = useState([]);
    const [activeInventory, setActiveInventory] = useState(rules.defaultTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isFading, setIsFading] = useState(false);
    const ITEMS_PER_PAGE = 15;

    // --- CHAOS SHUFFLE STATE ---
    const [localTokens, setLocalTokens] = useState(() => {
        const saved = localStorage.getItem('chaos_tokens');
        return saved !== null ? parseInt(saved) : (season?.variantState?.reRollTokens || 0);
    });
    const [hasRolled, setHasRolled] = useState(() => localStorage.getItem('chaos_hasRolled') === 'true');
    const [hasReRolled, setHasReRolled] = useState(() => localStorage.getItem('chaos_hasReRolled') === 'true');
    const [isRolling, setIsRolling] = useState(false);
    const initialFlip = localStorage.getItem('chaos_hasRolled') === 'true';
    const [flippedSlots, setFlippedSlots] = useState([initialFlip, initialFlip, initialFlip, initialFlip]);

    useEffect(() => {
        if (isChaos) {
            const savedPerks = localStorage.getItem('chaos_perks');
            if (savedPerks) {
                setSelectedPerks(JSON.parse(savedPerks));
            }
        }
    }, [isChaos, setSelectedPerks]);

    useEffect(() => {
        const fetchPerks = async () => {
            try {
                const response = await api.get('/reference-data/perks');
                let fetchedPerks = response.data;

                // --- Erase Dead/Sold Perks in Afterburn ---
                if (variantType === 'AFTERBURN') {
                    const deadAndSoldNames = season?.variantState?.deadAndSoldKillerNames || [];
                    if (deadAndSoldNames.length > 0) {
                        fetchedPerks = fetchedPerks.filter(p => {
                            // Account for DTO differences (either killerName or killer.name)
                            const pName = p.killerName || p.killer?.name;
                            return !deadAndSoldNames.includes(pName);
                        });
                    }
                }

                setAllPerks(fetchedPerks);
            } catch (err) { console.error("Failed to fetch perks:", err); }
        };
        fetchPerks();
    }, [variantType, season?.variantState?.deadAndSoldKillerNames]);

    useEffect(() => {
        const fetchAddons = async () => {
            if (!currentKiller) return;
            try {
                const response = await api.get('/reference-data/addons?killerId=' + currentKiller.killerId);
                setKillerAddons(response.data);
            } catch (err) { console.error("Failed to fetch addons:", err); }
        };
        fetchAddons();
    }, [currentKiller, setSelectedAddons]);

    // ==========================================
    // 3. VARIANT SPECIFIC ENFORCEMENT
    // ==========================================

    // Auto-Equip Adept Perks
    useEffect(() => {
        if (variantType === 'ADEPT' && allPerks.length > 0 && currentKiller) {
            const adeptPerks = allPerks.filter(p =>
                p.killerName === currentKiller.killerName || p.killer?.name === currentKiller.killerName
            );
            setSelectedPerks(adeptPerks);
        }
    }, [variantType, currentKiller, allPerks, setSelectedPerks]);

    // Force clear addons if they become locked
    useEffect(() => {
        if (rules.addonsLocked && selectedAddons.length > 0) {
            setSelectedAddons([]);
            setActiveInventory('PERKS');
            setCurrentPage(1);
        }
    }, [rules.addonsLocked, selectedAddons, setSelectedAddons]);

    // ==========================================
    // 4. INTERACTION LOGIC
    // ==========================================
    const handleToggleItem = (item, type) => {
        if (type === 'ADDONS') {
            if (rules.addonsLocked) return;
            setSelectedAddons(prev => {
                if (prev.find(a => a.id === item.id)) return prev.filter(a => a.id !== item.id);
                if (prev.length < rules.maxAddons) return [...prev, item];
                return prev;
            });
        } else if (type === 'PERKS') {
            if (rules.perksLocked) return;
            setSelectedPerks(prev => {
                if (prev.find(p => p.id === item.id)) return prev.filter(p => p.id !== item.id);
                if (prev.length < rules.maxPerks) return [...prev, item];
                return prev;
            });
        }
    };

    // --- CHAOS SHUFFLE ROLLER LOGIC ---
    const executeRoll = (isReRoll) => {
        if (isReRoll) {
            if (localTokens <= 0 || hasReRolled) return;
            const newTokens = localTokens - 1;

            setLocalTokens(newTokens);
            localStorage.setItem('chaos_tokens', newTokens.toString());
            if (setUsedReRollToken) setUsedReRollToken(true);

            setHasReRolled(true);
            localStorage.setItem('chaos_hasReRolled', 'true');
        }

        setHasRolled(true);
        localStorage.setItem('chaos_hasRolled', 'true');
        setIsRolling(true);
        setFlippedSlots([false, false, false, false]);

        const shuffled = [...allPerks].sort(() => 0.5 - Math.random());
        const picked = shuffled.slice(0, 4);
        setSelectedPerks(picked);

        localStorage.setItem('chaos_perks', JSON.stringify(picked));

        setTimeout(() => setFlippedSlots([true, false, false, false]), 150);
        setTimeout(() => setFlippedSlots([true, true, false, false]), 450);
        setTimeout(() => setFlippedSlots([true, true, true, false]), 750);
        setTimeout(() => setFlippedSlots([true, true, true, true]), 1050);

        setTimeout(() => setIsRolling(false), 1400);
    };

    // ==========================================
    // 5. RENDER HELPERS
    // ==========================================
    const activeData = activeInventory === 'ADDONS' ? killerAddons : allPerks;
    const filteredData = activeData.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const currentItems = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleJumpToItem = (e, item, type) => {
        // If they click an empty slot, let the event bubble up to the normal tab-switcher
        if (!item) return;

        e.stopPropagation(); // Prevent the parent container from overriding our logic

        // 1. Switch to the correct tab (respecting variant locks)
        if (type === 'ADDONS') {
            if (rules.addonsLocked) return;
            setActiveInventory('ADDONS');
        } else if (type === 'PERKS') {
            if (rules.perksLocked) return;
            setActiveInventory('PERKS');
        }

        // 2. Clear the search bar so the full list is visible, ensuring our math is 100% accurate
        setSearchQuery('');

        // 3. Find the exact page number based on the master arrays
        const dataList = type === 'ADDONS' ? killerAddons : allPerks;
        const itemIndex = dataList.findIndex(i => i.id === item.id);

        if (itemIndex !== -1) {
            // Because ITEMS_PER_PAGE is 15, index 14 is page 1, index 15 is page 2, etc.
            const targetPage = Math.floor(itemIndex / ITEMS_PER_PAGE) + 1;
            setCurrentPage(targetPage);
        }
    };

    const changePageWithFade = (newPage) => {
        if (newPage === currentPage) return;
        setIsFading(true);
        setTimeout(() => {
            setCurrentPage(newPage);
            setIsFading(false);
        }, 150); // Matches the 0.15s CSS transition perfectly
    };

    return (
        <div className="loadout">
            <div className="equipped-section">

                {/* === ADD-ONS ROW === */}
                <div className="loadout-row">
                    <h3 className="inter-text-normal text-muted">Add Ons</h3>
                    <div
                        className="slots-container"
                        onClick={() => {
                            if (!rules.addonsLocked) {
                                setActiveInventory('ADDONS');
                                setCurrentPage(1);
                            }
                        }}
                        style={{ cursor: rules.addonsLocked ? 'not-allowed' : 'pointer' }}
                    >
                        {[0, 1].map(index => {
                            const addon = selectedAddons[index];
                            return (
                                <div key={index} className="addon-wrapper flex flex-col items-center" onClick={(e) => handleJumpToItem(e, addon, 'ADDONS')}>
                                    <div className="addon-slot square-slot" style={{ position: 'relative', overflow: 'hidden' }}>
                                        {addon && <img src={`/assets/Addons/${currentKiller?.killerName}/${addon.name.replace('%', '')}.png`} alt={addon.name} />}
                                        {rules.addonsLocked && !addon && <img className="locked-indicator" src="/assets/Image Overlays/locked.png" alt="AddOn Slot Locked" />}
                                        {isFinancialVariant && addon && (
                                            <div className="loadout-financial-overlay">
                                                <div className="price-banner">${addon.cost}</div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* === PERKS ROW === */}
                <div className="loadout-row">
                    <h3 className="inter-text-normal text-muted">Perks</h3>
                    <div
                        className="slots-container perks-container"
                        onClick={() => {
                            if (!rules.perksLocked) {
                                setActiveInventory('PERKS');
                                setCurrentPage(1);
                            }
                        }}
                        style={{ cursor: rules.perksLocked ? 'not-allowed' : 'pointer' }}
                    >
                        {[0, 1, 2, 3].map(index => {
                            const isSlotLocked = index >= rules.maxPerks;
                            const perk = selectedPerks[index];
                            const isVisible = isChaos ? flippedSlots[index] : true;

                            return (
                                <div key={index} className="perk-wrapper flex flex-col items-center" onClick={(e) => handleJumpToItem(e, perk, 'PERKS')}>
                                    <div className="perk-slot diamond-slot" style={{ pointerEvents: rules.perksLocked ? 'none' : 'auto', position: 'relative', overflow: 'hidden' }}>
                                        {perk && !isSlotLocked && (
                                            <div className={`diamond-content ${isChaos && isVisible ? 'flip-in-y' : ''} ${isChaos && !isVisible ? 'hidden-opacity' : ''}`}>
                                                <img src={`/assets/Perks/${perk.name}.png`} alt={perk.name}/>
                                            </div>
                                        )}
                                        {isSlotLocked && (
                                            <div className="diamond-content flex items-center justify-center">
                                                <img className="locked-indicator" src="/assets/Image Overlays/locked.png" alt="Perk Slot Locked"/>
                                            </div>
                                        )}

                                        {isFinancialVariant && perk && (
                                            <div className="loadout-financial-overlay perk-mode">
                                                <div className="price-banner">${perk.cost}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* === DYNAMIC BOTTOM SECTION === */}
            {isChaos && (
                <div className="inventory-section flex flex-col items-center justify-center py-12">
                    <h2 className="bebas-header-1 title-white text-3xl mb-2">The Entity's Roulette</h2>

                    <div className="flex flex-col items-center mb-6">
                        <p className="inter-text-normal text-muted mb-2">Available Re-rolls</p>
                        <div className="token-container flex h-12 items-center justify-center">
                            {localTokens > 0 ? (
                                Array.from({ length: localTokens }).map((_, index) => (
                                    <img
                                        key={index}
                                        src="/assets/Variants/ReRollToken.png"
                                        alt="ReRoll Token"
                                        className="reRollTokenImage fade-in"
                                        style={{ width: '35px', objectFit: 'contain', marginLeft: index > 0 ? '-17px' : '0', zIndex: index }}
                                    />
                                ))
                            ) : (
                                <span className="inter-text-small text-muted">No tokens remaining</span>
                            )}
                        </div>
                    </div>

                    <button
                        className="squareBtn"
                        onClick={() => executeRoll(hasRolled)}
                        disabled={isRolling || hasReRolled || (hasRolled && localTokens === 0)}
                        style={{ width: '250px', opacity: (isRolling || hasReRolled || (hasRolled && localTokens === 0)) ? 0.5 : 1 }}
                    >
                        {hasRolled ? 'Re-Roll' : 'Roll For Perks'}
                    </button>
                </div>
            )}

            {/* Standard Inventory */}
            {rules.hasInventory && (
                <div className="inventory-section">
                    <div className="inventory-header">
                        <div className="text">
                            <h2 className="inter-text-normal">Inventory</h2>
                            <p className="inter-text-small text-muted">
                                {activeInventory === 'ADDONS' ? 'Add-ons' : 'Perks'}
                                {(activeInventory === 'ADDONS' && rules.addonsLocked) || (activeInventory === 'PERKS' && rules.perksLocked) ? " (Locked)" : ""}
                            </p>
                        </div>
                        {!(rules.perksLocked && rules.addonsLocked) && (
                            <input
                                type="text"
                                className="inventory-search"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                disabled={(activeInventory === 'ADDONS' && rules.addonsLocked) || (activeInventory === 'PERKS' && rules.perksLocked)}
                            />
                        )}
                    </div>

                    <div className="divider-line"></div>

                    <div className={`inventory-grid ${activeInventory === 'PERKS' ? 'grid-diamonds' : 'grid-squares'} ${isFading ? 'grid-fade-out' : ''}`}>                        {activeInventory === 'PERKS' && rules.perksLocked ? (
                            <div className="col-span-full flex justify-center py-10">
                                <p className="text-muted inter-text-normal text-center">Perks are automatically locked for the {variantType} challenge.</p>
                            </div>
                        ) : activeInventory === 'ADDONS' && rules.addonsLocked ? (
                            <div className="col-span-full flex justify-center py-10">
                                <p className="text-muted inter-text-normal text-center">Add-ons are strictly forbidden at your current grade.</p>
                            </div>
                        ) : (
                            currentItems.map(item => {
                                const isSelected = activeInventory === 'ADDONS'
                                    ? selectedAddons.some(a => a.id === item.id)
                                    : selectedPerks.some(p => p.id === item.id);

                                // Check if the current item is in the used arrays passed from the parent
                                const isUsed = isIronMan && (activeInventory === 'ADDONS'
                                    ? usedAddOns.includes(item.id.toString())
                                    : usedPerks.includes(item.id.toString()));

                                const isUnaffordable = isFinancialVariant && !isSelected && item.cost > currentBalance;
                                const isLocked = isUsed || isUnaffordable;

                                const imagePath = activeInventory === 'ADDONS'
                                    ? `/assets/Addons/${currentKiller?.killerName}/${item.name.replace('%', '')}.png`
                                    : `/assets/Perks/${item.name}.png`;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => !isLocked && handleToggleItem(item, activeInventory)}
                                        className={`inventory-item ${activeInventory === 'ADDONS' ? 'square-slot' : 'diamond-slot'} ${isSelected ? 'selected' : ''}`}
                                        style={{ cursor: isUsed ? 'not-allowed' : 'pointer' }}
                                    >
                                        <div className={`${activeInventory === 'PERKS' ? 'diamond-content' : ''}`} style={{ filter: isLocked ? 'grayscale(100%) brightness(0.5)' : 'none' }}>
                                            <img src={imagePath} alt={item.name} title={item.name} />
                                        </div>
                                        {isSelected && <div className="active-check"></div>}

                                        {/* Renders the padlock over the item if it has already been used */}
                                        {isLocked && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 10,
                                                transform: activeInventory === 'PERKS' ? 'rotate(-45deg)' : 'none'
                                            }}>
                                                <img
                                                    src="/assets/Image Overlays/locked.png"
                                                    alt="Locked"
                                                    style={{
                                                        width: activeInventory === 'PERKS' ? '70%' : '50%',
                                                        opacity: 0.8
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {isFinancialVariant && (
                                            <div className={`loadout-financial-overlay ${activeInventory === 'PERKS' ? 'perk-mode' : ''}`}>
                                                <div className="price-banner">${item.cost}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {totalPages > 1 && !(activeInventory === 'ADDONS' && rules.addonsLocked) && !(activeInventory === 'PERKS' && rules.perksLocked) && (
                        <div className="pagination-controls">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => changePageWithFade(pageNum)}
                                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MasterLoadout;
