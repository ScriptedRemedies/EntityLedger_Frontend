import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ChallengesPage.scss';
import '../styles/CurrentSeasonPage.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useToast } from "../hooks/ToastContext.jsx";
import KillerCard from "./small-components/KillerCard.jsx";
import GradeBadgeDisplay from './small-components/GradeBadgeDisplay.jsx';
import TrialConfirmationOverlay from './overlays/TrialConfirmationOverlay';
import TrialResultsOverlay from './overlays/TrialResultsOverlay.jsx';
import TrialListTable from './small-components/TrialListTable.jsx';
import TrialDetailsOverlay from './overlays/TrialDetailsOverlay';
import SeasonRecapOverlay from './overlays/SeasonRecapOverlay'
import MasterLoadout from "./small-components/MasterLoadout.jsx";

const NAV_TABS = [
    { id: 'KILLERS', name: 'Killers' },
    { id: 'LOADOUT', name: 'Loadout' },
    { id: 'TRIALS', name: 'Trials' }
];

const CurrentSeasonPage = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { seasonId } = useParams();
    const [trialCount, setTrialCount] = useState(0);

    const navView = useFadeTransition(NAV_TABS[0]);
    const [activeSeason, setActiveSeason] = useState(null);
    const [selectedKiller, setSelectedKiller] = useState(null);
    const [trials, setTrials] = useState([]);
    const [activeTrialOverlay, setActiveTrialOverlay] = useState(null);

    const [isConfirmingTrial, setIsConfirmingTrial] = useState(false);
    // Confirming sell killer states for blood money and afterburn
    const [killerToSellConfirm, setKillerToSellConfirm] = useState(null);
    const [selectedPerks, setSelectedPerks] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [isViewingResults, setIsViewingResults] = useState(false);
    const [seasonRecap, setSeasonRecap] = useState(null);
    const [usedReRollTokens, setUsedReRollTokens] = useState(false);
    const [allPerks, setAllPerks] = useState([]);

    // --- MARATHON TIMER STATE ---
    const [timeLeft, setTimeLeft] = useState(null);
    const [isTimerDanger, setIsTimerDanger] = useState(false);

    const fetchSeasonData = async () => {
        if (!seasonId) return;
        try {
            const response = await api.get(`/seasons/active`);
            setActiveSeason(response.data);

            if (response.data && response.data.seasonId) {
                const trialsRes = await api.get(`/seasons/${response.data.seasonId}/trials`);
                setTrialCount(trialsRes.data.length);
                setTrials(trialsRes.data);
            }
            console.log(response.data.roster);
        } catch (error) {
            console.error("Failed to fetch season or trials:", error);
        }
    };

    useEffect(() => {
        fetchSeasonData();
    }, [seasonId]);

    useEffect(() => {
        if (activeSeason?.variantType === 'ADEPT') {
            const fetchPerks = async () => {
                try {
                    const response = await api.get('/reference-data/perks');
                    setAllPerks(response.data);
                } catch (err) {
                    console.error("Failed to preload perks for Adept variant:", err);
                }
            };
            fetchPerks();
        }
    }, [activeSeason?.variantType]);

    // --- MARATHON TIMER LOGIC ---
    useEffect(() => {
        if (activeSeason?.variantType !== 'IRON_MAN') return;
        const lastEndTimeStr = activeSeason?.variantState?.lastTrialEndTime;
        if (!lastEndTimeStr) return;

        const timerInterval = setInterval(() => {
            const lastEndTime = new Date(lastEndTimeStr).getTime();
            const now = new Date().getTime();
            const diffMs = now - lastEndTime;
            const maxMs = 75 * 60 * 1000; // 75 minutes
            const remainingMs = maxMs - diffMs;

            if (remainingMs <= 0) {
                setTimeLeft('00:00');
                setIsTimerDanger(true);
                clearInterval(timerInterval);

                api.post(`/seasons/${activeSeason.seasonId}/fail`)
                    .then(() => api.get(`/seasons/${activeSeason.seasonId}/trials`))
                    .then(finalTrialsRes => {
                        setSeasonRecap({
                            status: 'FAILED_TIME',
                            finalTrials: finalTrialsRes.data
                        });
                        addToast("Time's up! The Entity has claimed your run.", "error");
                    })
                    .catch(err => console.error("Failed to automatically end season:", err));

            } else {
                const mins = Math.floor(remainingMs / 60000);
                const secs = Math.floor((remainingMs % 60000) / 1000);
                setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
                setIsTimerDanger(mins < 5); // Turns red when under 5 minutes
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [activeSeason]);

    // --- ROSTER CYCLING LOGIC ---
    const isIronMan = activeSeason?.variantType === 'IRON_MAN';
    const isAfterburn = activeSeason?.variantType === 'AFTERBURN';
    const playedKillers = activeSeason?.variantState?.playedKillers || [];
    const lastPlayedId = activeSeason?.variantState?.lastPlayedKillerId;

    const isKillerOnCooldown = (killerIdStr) => {
        if (isIronMan) return playedKillers.includes(killerIdStr);
        if (isAfterburn) {
            const cooldowns = activeSeason?.variantState?.cooldowns || {};
            return cooldowns[killerIdStr] > 0;
        }
        // Default to Blood Money's single ID tracker
        return activeSeason?.variantState?.cooldownKillerId === killerIdStr;
    };

    // 1. Initial Independent Variables
    const isBloodMoney = activeSeason?.variantType === 'BLOOD_MONEY';
    const isFinancialVariant = isBloodMoney || activeSeason?.variantType === 'AFTERBURN';
    const startingBalance = activeSeason?.variantState?.balance || 0;

    const loadoutCost = selectedPerks.reduce((sum, p) => sum + (p?.cost || 0), 0) +
        selectedAddons.reduce((sum, a) => sum + (a?.cost || 0), 0);

    // 2. Define playable killers, EXPLICITLY sorted by ID to maintain a consistent visual "First Available" order
    const playableKillers = [...(activeSeason?.roster || [])]
        .sort((a, b) => parseInt(a.killerId) - parseInt(b.killerId))
        .filter(k =>
            k.status !== 'DEAD' && k.status !== 'SOLD' &&
            !isKillerOnCooldown(k.killerId.toString())
        );

    // 3. Identify the "Last Played" killer
    // Iron Man uses variantState. Other variants rely on the backend's characterName tracking.
    const lastPlayed = playableKillers.find(k =>
        lastPlayedId ? k.killerId.toString() === lastPlayedId.toString() : k.killerName === activeSeason?.characterName
    );

    // 4. Determine default killer based on exact hierarchy rules
    let defaultKiller = null;
    let isBankrupt = false;

    if (isFinancialVariant) {
        const cheapestKiller = [...playableKillers].sort((a, b) => a.cost - b.cost)[0];
        const canAffordCheapest = cheapestKiller && (startingBalance - loadoutCost - cheapestKiller.cost >= 0);

        // Bankrupt if in debt, or cannot even afford the absolute cheapest option
        isBankrupt = (startingBalance - loadoutCost < 0) || !canAffordCheapest;

        if (isBankrupt) {
            defaultKiller = null; // Force "Sell Mode"
        } else {
            // Priority 1: Last played killer (if playable AND affordable)
            const canAffordLastPlayed = lastPlayed && (startingBalance - loadoutCost - lastPlayed.cost >= 0);

            if (canAffordLastPlayed) {
                defaultKiller = lastPlayed;
            } else {
                // Priority 2: Next available killer (First available from left to right that is affordable)
                const firstAvailable = playableKillers.find(k => (startingBalance - loadoutCost - k.cost >= 0));

                // Priority 3: The Cheapest Killer (Acts as the penalty selection if coming out of bankruptcy)
                defaultKiller = firstAvailable || cheapestKiller || null;
            }
        }
    } else {
        // Standard non-financial variants: Priority 1 (Last Played) -> Priority 2 (First Available)
        defaultKiller = lastPlayed || playableKillers[0] || null;
    }

    // 5. Safely set Current Killer
    const currentKiller = selectedKiller || defaultKiller;

    // 6. Calculate Final Financials for the Header and UI State
    const killerCost = currentKiller?.cost || 0;
    const projectedBalance = startingBalance - killerCost - loadoutCost;

    useEffect(() => {
        if (activeSeason?.variantType === 'ADEPT' && currentKiller && allPerks.length > 0) {
            const adeptPerks = allPerks.filter(p =>
                p.killerName === currentKiller.killerName ||
                p.killer?.name === currentKiller.killerName
            );
            setSelectedPerks(adeptPerks);
        }
    }, [currentKiller, allPerks, activeSeason?.variantType]);

    if (!activeSeason) {
        return (
            <div className="main-container review-container relative flex items-center justify-center">
                <div className="text-center">
                    <h2 className="bebas-header-1 title-white text-2xl animate-pulse">Summoning The Entity...</h2>
                </div>
            </div>
        );
    }

    const displayImageUrl = currentKiller
        ? `/assets/Killer Portraits/${currentKiller.killerName}.png`
        : activeSeason.characterImageUrl;

    const displayCharacterName = currentKiller
        ? currentKiller.killerName
        : activeSeason.characterName;

    // --- TRIAL SUBMISSION LOGIC ---
    const handleTrialSubmit = async (resultsPayload) => {
        try {
            const isKillerDead = resultsPayload.survivors.includes('escaped');

            const mappedSurvivors = resultsPayload.survivors.map(status => {
                if (status === 'hatch') return 'HATCH_ESCAPE';
                return status.toUpperCase();
            });

            const killCount = mappedSurvivors.filter(s =>
                s === 'SACRIFICED' || s === 'KILLED'
            ).length;

            const payload = {
                killerId: currentKiller.killerId,
                pipProgression: resultsPayload.pipChange,
                perkIds: selectedPerks.filter(Boolean).map(p => p.id),
                addOnIds: selectedAddons.filter(Boolean).map(a => a.id),
                survivorOutcomes: mappedSurvivors,
                usedReRollToken: localStorage.getItem('chaos_hasReRolled') === 'true',
                emblems: resultsPayload.emblems.map(e => ({
                    category: e.category,
                    quality: e.quality,
                    points: e.points
                }))
            };

            if (['BLOOD_MONEY', 'AFTERBURN', 'CHAOS_SHUFFLE', 'IRON_MAN'].includes(activeSeason.variantType)) {
                payload.kills = killCount;
                payload.gensLeft = resultsPayload.gensLeft || 0;
                payload.closedHatch = resultsPayload.closedHatch || false;
                payload.genBeforeHook = resultsPayload.genBeforeHook || false;
                payload.lastGenCompleted = mappedSurvivors.includes('ESCAPED');
                payload.gateOpened = mappedSurvivors.includes('ESCAPED');
            }

            const response = await api.post(`/trials`, payload);
            const trialResult = response.data;

            // --- UI FEEDBACK INTERCEPT ---
            // If they are playing Iron Man, a gate escape happened, AND the season is still active... a Mulligan saved them!
            if (isIronMan && mappedSurvivors.includes('ESCAPED') && trialResult.seasonStatus === 'ACTIVE') {
                addToast("Mulligan used! Your run was saved.", "warning");
            } else if (isKillerDead) {
                addToast(`${currentKiller.killerName} was consumed by The Entity.`, "error");
            } else {
                addToast("Trial complete! The Entity is pleased.", "success");
            }

            setSelectedPerks([]);
            setSelectedAddons([]);
            setSelectedKiller(null);

            if (typeof setUsedReRollTokens !== 'undefined') setUsedReRollTokens(false);
            localStorage.removeItem('chaos_tokens');
            localStorage.removeItem('chaos_hasRolled');
            localStorage.removeItem('chaos_hasReRolled');
            localStorage.removeItem('chaos_perks');

            if (trialResult.seasonStatus && trialResult.seasonStatus !== 'ACTIVE') {
                const finalTrialsRes = await api.get(`/seasons/${activeSeason.seasonId}/trials`);

                setSeasonRecap({
                    status: trialResult.seasonStatus,
                    finalTrials: finalTrialsRes.data
                });

                setIsViewingResults(false);
            } else {
                setIsViewingResults(false);
                navView.triggerTransition(NAV_TABS[0]);
                await fetchSeasonData();
            }

        } catch (error) {
            console.error("Failed to submit trial:", error);
            addToast("Failed to submit trial data.", "error");
        }
    };

    const handleSellKiller = async (killerToSell) => {
        try {
            // Capture the response so we can check the status
            const response = await api.put(`/seasons/${activeSeason.seasonId}/sell/${killerToSell.killerId}`);
            const updatedSeason = response.data;

            addToast(`${killerToSell.killerName} was sold for $${killerToSell.cost}!`, "success");

            // --- NEW: Check if the sale mathematically ended the run ---
            if (updatedSeason.status && updatedSeason.status !== 'ACTIVE') {
                const finalTrialsRes = await api.get(`/seasons/${activeSeason.seasonId}/trials`);

                setSeasonRecap({
                    status: updatedSeason.status,
                    finalTrials: finalTrialsRes.data
                });
            } else {
                // If they can still afford to play, carry on as normal
                await fetchSeasonData();
                if (currentKiller?.killerId === killerToSell.killerId) {
                    setSelectedKiller(null);
                    setSelectedPerks([]);
                    setSelectedAddons([]);
                }
            }
        } catch (error) {
            console.error("Failed to sell killer:", error);
            addToast("Failed to process sale.", "error");
        }
    };

    const handleStartTrialClick = () => {
        if (isBloodMoney && isBankrupt) {
            addToast("Insufficient funds! Sell a killer or adjust your loadout to afford the trial.", "error");
            return;
        }

        if (activeSeason?.variantType === 'CHAOS_SHUFFLE') {
            const hasRolled = localStorage.getItem('chaos_hasRolled') === 'true';

            if (!hasRolled) {
                addToast("You must roll for your perks before starting the trial!", "error");
                navView.triggerTransition(NAV_TABS[1]);
                return;
            }
        }
        setIsConfirmingTrial(true);
    };

    const renderLoadoutView = () => {
        return (
            <MasterLoadout
                currentKiller={currentKiller}
                selectedPerks={selectedPerks}
                setSelectedPerks={setSelectedPerks}
                selectedAddons={selectedAddons}
                setSelectedAddons={setSelectedAddons}
                season={activeSeason}
                setUsedReRollToken={setUsedReRollTokens}
                // Pass down the used arrays for the singleton locks
                usedPerks={activeSeason?.variantState?.usedPerks || []}
                usedAddOns={activeSeason?.variantState?.usedAddOns || []}
            />
        )
    };

    return (
        <div className="main-container review-container relative">

            {/* === LEFT NAV === */}
            <div className="nav">
                <div className="nav-fog-wrapper">
                    <div className="nav-fog-bg"></div>
                </div>

                <div className="nav-icons-list hide-scrollbar">
                    {NAV_TABS.map((tab) => (
                        <div
                            key={tab.id}
                            className="variantIconContainer"
                            onClick={() => navView.triggerTransition(tab)}
                        >
                            {navView.active?.id === tab.id && (
                                <div className="variantIconActive fade-in"></div>
                            )}

                            <img
                                src={`/assets/Nav/${tab.name}Selection.png`}
                                alt={tab.name}
                                className="variantIcon"
                            />
                        </div>
                    ))}
                </div>

                <button onClick={() => navigate("/dashboard")} className="back-button">Back</button>
            </div>

            {/* === MIDDLE CONTENT AREA === */}
            {/* TODO: Put a max and min width on Middle-content with overflow-x auto, make sure the min width doesn't effect the overflow of y */}
            <div className="middle-content">
                {navView.display && (
                    <div key={navView.display.id} className={`variant-view-wrapper ${navView.isTransitioning ? 'fade-out' : 'fade-in'}`}>
                        <div className="content-fog-bg"></div>

                        <div className="variant-content-area">

                            {/* UPDATED HEADER: Includes the Ledger and Marathon Timer */}
                            <div className="variant-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="flex items-center">
                                    <h1 className="bebas-header-1 title-white m-0">{navView.display.name}</h1>

                                    {/* LIVE BLOOD MONEY LEDGER */}
                                    {isFinancialVariant && (
                                        <div className="blood-money-ledger flex items-end gap-3 ml-6 pb-1">
                                            <div className="ledger-item flex flex-col items-center border-l border-gray-700 pl-3">
                                                <span className="text-gray-500 bebas-header-2 text-2xl m-0 leading-none">${startingBalance}</span>
                                                <span className="text-gray-600 text-[10px] uppercase leading-none mt-1">Starting</span>
                                            </div>
                                            <div className="ledger-item flex flex-col items-center border-l border-gray-700 pl-3">
                                                <span className="text-red-500 bebas-header-2 text-2xl m-0 leading-none">-${killerCost}</span>
                                                <span className="text-gray-600 text-[10px] uppercase leading-none mt-1">Killer</span>
                                            </div>
                                            <div className="ledger-item flex flex-col items-center border-l border-gray-700 pl-3">
                                                <span className="text-red-500 bebas-header-2 text-2xl m-0 leading-none">-${loadoutCost}</span>
                                                <span className="text-gray-600 text-[10px] uppercase leading-none mt-1">LoadOut</span>
                                            </div>
                                            <div className="ledger-total flex items-end gap-2 ml-6">
                                                <span className="text-gray-500 text-xs uppercase mb-1">Total</span>
                                                <span className={`bebas-header-1 text-4xl m-0 leading-none ${isBankrupt ? 'text-red-500' : 'text-white'}`}>
                                                    ${projectedBalance}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isIronMan && timeLeft && (
                                    <div className="marathon-timer flex items-center gap-4">
                                        <div className="text-right leading-tight">
                                            <p className="inter-text-small text-muted m-0">Time Remaining</p>
                                            <p className="inter-text-small text-muted m-0">until next trial submission</p>
                                        </div>
                                        <h2 className={`bebas-header-1 text-5xl m-0 ${isTimerDanger ? 'text-red-500' : 'text-white'}`}>
                                            {timeLeft}
                                        </h2>
                                    </div>
                                )}
                            </div>

                            <div className="tab-content-wrapper hide-scrollbar" style={navView.display.id === 'TRIALS' ? {display: 'flex', flexDirection: 'column', overflowY: 'hidden'} : {}}>

                                {/* KILLER LIST */}
                                {navView.display.id === 'KILLERS' && (
                                    <div className="killer-grid hide-scrollbar">
                                        {[...activeSeason.roster]
                                            .sort((a, b) => parseInt(a.killerId) - parseInt(b.killerId))
                                            .map(rosterItem => (
                                                <KillerCard
                                                    key={rosterItem.killerId}
                                                    killer={rosterItem}
                                                    variantType={activeSeason.variantType}
                                                    isSelected={currentKiller?.killerId === rosterItem.killerId}
                                                    onSelect={() => {
                                                        setSelectedKiller(rosterItem);
                                                        setSelectedAddons([]);
                                                    }}
                                                    onSell={(k) => setKillerToSellConfirm(k)}
                                                    mode="active"
                                                    currentBalance={projectedBalance} // <--- Triggers the SELL overlay if negative!
                                                    isVariantCooldown={isKillerOnCooldown(rosterItem.killerId.toString())}
                                                    isUnaffordable={isFinancialVariant && rosterItem.cost > startingBalance}
                                                    isBankrupt={isBankrupt}
                                                />
                                            ))}
                                    </div>
                                )}

                                {/* LOADOUT */}
                                {navView.display.id === 'LOADOUT' && (
                                    <div className="loadout-container">
                                        {renderLoadoutView()}
                                    </div>
                                )}

                                {/* TRIALS */}
                                {navView.display.id === 'TRIALS' && (
                                    <TrialListTable
                                        trials={trials}
                                        variantType={activeSeason.variantType}
                                        onRowClick={setActiveTrialOverlay}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* === RIGHT PANEL === */}
            <div className="right-panel">
                <button className="squareBtn" onClick={handleStartTrialClick}>
                    Start Trial
                </button>

                <div className="global-season-info">

                    <GradeBadgeDisplay
                        rawGrade={activeSeason.currentGrade}
                        pips={activeSeason.currentPips}
                    />

                    <div className="global-season-text">
                        <h3 key={displayCharacterName} className="bebas-header-1 global-character-name fade-in">{displayCharacterName}</h3>
                        <p className="inter-text-small">{activeSeason.variantType.replace('_', ' ')}</p>
                        <p className="inter-text-small global-days-left">{activeSeason.daysLeft} Days Left</p>

                        {/* Mulligan token indicator */}
                        {isIronMan && (
                            <div
                                className="mulligan-indicator flex items-center gap-2 fade-in"
                                style={{ opacity: activeSeason?.variantState?.mulliganCount > 0 ? 1 : 0.4 }}
                            >
                                <img
                                    src="/assets/Variants/ReviveToken.png"
                                    alt="Mulligan Token"
                                    style={{ width: '22px', objectFit: 'contain' }}
                                />
                                <p className="inter-text-small m-0 text-white">
                                    {activeSeason?.variantState?.mulliganCount > 0 ? 'Mulligan Available' : 'No Mulligan'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <img
                    key={displayImageUrl}
                    src={displayImageUrl}
                    className="global-character-bg fade-in"
                    alt={displayCharacterName}
                />
            </div>

            {/* === CUSTOM SELL CONFIRMATION MODAL === */}
            {killerToSellConfirm && (
                <div className="modal-backdrop fade-in">
                    <div className="modal-content-box confirm-modal" style={{ height: 'auto', minHeight: '250px', width: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                        <div>
                            <h2 className="bebas-header-1 title-white modal-title">Confirm Sale</h2>
                            <div className="modal-divider"></div>
                            <p className="inter-text-normal">
                                Are you sure you want to sell <span className="title-iri">{killerToSellConfirm.killerName}</span> for <span className="title-iri">${killerToSellConfirm.cost}</span>?
                            </p>
                            <p className="inter-text-normal">Your new balance will be <span className="title-iri">${startingBalance + killerToSellConfirm.cost}</span></p>
                            <p className="inter-text-small text-muted">
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="modal-actions" style={{ marginTop: '30px' }}>
                            <button className="back-button" onClick={() => setKillerToSellConfirm(null)}>Cancel</button>
                            <button className="squareBtn" onClick={() => {
                                handleSellKiller(killerToSellConfirm);
                                setKillerToSellConfirm(null);
                            }}>Confirm Sale</button>
                        </div>

                    </div>
                </div>
            )}

            <TrialDetailsOverlay
                trial={activeTrialOverlay}
                onClose={() => setActiveTrialOverlay(null)}
            />

            {isConfirmingTrial && (
                <TrialConfirmationOverlay
                    season={activeSeason}
                    killer={currentKiller}
                    selectedPerks={selectedPerks}
                    selectedAddons={selectedAddons}
                    trialCount={trialCount}
                    onCancel={() => setIsConfirmingTrial(false)}
                    onConfirm={() => {
                        setIsConfirmingTrial(false);
                        setIsViewingResults(true);
                    }}
                />
            )}

            {isViewingResults && (
                <TrialResultsOverlay
                    season={activeSeason}
                    killer={currentKiller}
                    trialCount={trialCount}
                    onSubmit={handleTrialSubmit}
                />
            )}

            {seasonRecap && (
                <SeasonRecapOverlay
                    season={activeSeason}
                    recapData={seasonRecap}
                    actionText="Return to Dashboard"
                    onAction={() => navigate('/dashboard')}
                />
            )}
        </div>
    );
};

export default CurrentSeasonPage;
