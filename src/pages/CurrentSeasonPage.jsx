import { useParams } from 'react-router-dom';
import '../styles/ChallengesPage.scss';
import '../styles/CurrentSeasonPage.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import { useEffect, useState, useRef } from "react";
import api from "../services/api.js";
import { useToast } from "../hooks/ToastContext.jsx";
import KillerCard from "./small-components/KillerCard.jsx";
import GradeBadgeDisplay from './small-components/GradeBadgeDisplay.jsx';
import TrialConfirmationOverlay from './overlays/TrialConfirmationOverlay';
import TrialResultsOverlay from './overlays/TrialResultsOverlay.jsx';
import TrialListTable from './small-components/TrialListTable.jsx';
import TrialDetailsModal from './modals/TrialDetailsModal.jsx';
import SeasonRecapOverlay from './overlays/SeasonRecapOverlay'
import MasterLoadout from "./small-components/MasterLoadout.jsx";
import {useCinematicNavigate} from "../hooks/NavigationContext.jsx";
import {SellKillerModal} from "./modals/AppModals.jsx";

const NAV_TABS = [
    { id: 'KILLERS', name: 'Killers' },
    { id: 'LOADOUT', name: 'Loadout' },
    { id: 'TRIALS', name: 'Trials' }
];

// ==========================================
// THE ENTITY'S TOLL (Killer Death Cinematic)
// ==========================================
const DeathCinematic = ({ killer, isRunEnding, onComplete }) => {
    const [isDead, setIsDead] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setIsDead(true), 1400);
        const t2 = setTimeout(() => setIsFadingOut(true), 3900);
        const t3 = setTimeout(() => onComplete(), 5100);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    // If the run is completely failing, hold the background at pure black. Only fade the card.
    const overlayClass = isFadingOut && !isRunEnding ? 'slow-fade-out' : 'cinematic-fade-in';
    const cardClass = `cinematic-card-wrapper ${isDead ? 'stamp-active' : ''} ${isFadingOut && isRunEnding ? 'slow-fade-out' : ''}`;

    return (
        <div className={`death-cinematic-overlay ${overlayClass}`}>
            <div className="content-fog-bg"></div>
            <div className={cardClass}>
                <KillerCard
                    killer={{ ...killer, status: isDead ? 'DEAD' : 'ACTIVE' }}
                    variantType="STANDARD"
                    mode="active"
                />
            </div>
        </div>
    );
};

// ==========================================
// THE RUN ENDING CINEMATIC (Victory & Void)
// ==========================================
const RunEndingCinematic = ({ outcome, recapData, isChained, onTriggerRecap, onComplete }) => {
    const [phase, setPhase] = useState(isChained ? 'blackout' : 'idle');

    useEffect(() => {
        let t1, t2, t3, t4, t5, t6, t7;

        // Because Crimson Ash mirrors the Void, the timing logic is 100% identical!
        if (isChained) {
            t3 = setTimeout(() => setPhase('verdict'), 100);
            t4 = setTimeout(() => onTriggerRecap(recapData), 2000);
            t5 = setTimeout(() => setPhase('ash'), 3500);
            t6 = setTimeout(() => setPhase('reveal'), 4500);
            t7 = setTimeout(() => onComplete(), 5500);
        } else {
            t1 = setTimeout(() => setPhase('vacuum'), 500);
            t2 = setTimeout(() => setPhase('blackout'), 1000);
            t3 = setTimeout(() => setPhase('verdict'), 2000);
            t4 = setTimeout(() => onTriggerRecap(recapData), 4000);
            t5 = setTimeout(() => setPhase('ash'), 5500);
            t6 = setTimeout(() => setPhase('reveal'), 6500);
            t7 = setTimeout(() => onComplete(), 7500);
        }

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); clearTimeout(t7); };
    }, []); // Strictly one-shot

    const isVictory = outcome === 'victory';

    return (
        <div className={`void-cinematic-overlay ${phase === 'vacuum' ? 'vacuum-active' : ''}`}>
            <div className={`void-blackout ${(phase === 'blackout' || phase === 'verdict' || phase === 'ash') ? 'blackout-active' : ''} ${phase === 'reveal' ? 'blackout-reveal' : ''}`}></div>

            {(phase === 'verdict' || phase === 'ash' || phase === 'reveal') && (
                <div className={isVictory
                    ? `victory-text ${phase === 'verdict' ? 'victory-burn-in' : 'victory-ash-fade'}`
                    : `verdict-text ${phase === 'verdict' ? 'verdict-burn-in' : 'verdict-ash-fade'}`
                }>
                    {isVictory ? 'CHALLENGE CONQUERED' : (recapData.status === 'FAILED_TIME' ? 'TIME EXPIRED' : 'ENTITY DISPLEASED')}
                </div>
            )}
        </div>
    );
};

const CurrentSeasonPage = () => {
    const navigate = useCinematicNavigate();
    const { addToast } = useToast();
    const { seasonId } = useParams();
    const [trialCount, setTrialCount] = useState(0);

    const scrollRef = useRef(null);
    const navView = useFadeTransition(NAV_TABS[0], 100, scrollRef);
    const [activeSeason, setActiveSeason] = useState(null);
    const [selectedKiller, setSelectedKiller] = useState(null);
    const [trials, setTrials] = useState([]);
    const [activeTrialOverlay, setActiveTrialOverlay] = useState(null);

    const [isConfirmingTrial, setIsConfirmingTrial] = useState(false);
    const [deathCinematic, setDeathCinematic] = useState(null);
    // Confirming sell killer states for blood money and afterburn
    const [killerToSellConfirm, setKillerToSellConfirm] = useState(null);
    const [isSellModalClosing, setIsSellModalClosing] = useState(false);
    const handleCloseSellModal = (confirm = false) => {
        setIsSellModalClosing(true);
        setTimeout(() => {
            if (confirm && killerToSellConfirm) {
                handleSellKiller(killerToSellConfirm);
            }
            setKillerToSellConfirm(null);
            setIsSellModalClosing(false);
        }, 300)
    }
    const [selectedPerks, setSelectedPerks] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [isViewingResults, setIsViewingResults] = useState(false);
    const [isResultsClosing, setIsResultsClosing] = useState(false);
    const [seasonRecap, setSeasonRecap] = useState(null);
    const [runEndingData, setRunEndingData] = useState(null);
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
                        setRunEndingData({
                            outcome: 'failure',
                            isChained: false,
                            recap: { status: 'FAILED_TIME', finalTrials: finalTrialsRes.data }
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
                if (status === 'hatch' || status === 'hatch_escape') return 'HATCH_ESCAPE';
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

            const isKillerActuallyDead = isKillerDead && !(isIronMan && mappedSurvivors.includes('ESCAPED') && trialResult.seasonStatus === 'ACTIVE');

            // --- Identify if the run ended IN ANY WAY (Win or Lose) ---
            const isRunEnding = trialResult.seasonStatus && trialResult.seasonStatus !== 'ACTIVE';

            const refreshPromise = fetchSeasonData();

            const finalTrialsPromise = isRunEnding
                ? api.get(`/seasons/${activeSeason.seasonId}/trials`)
                : null;

            const finishSubmission = async () => {
                setSelectedPerks([]);
                setSelectedAddons([]);
                setSelectedKiller(null);

                if (typeof setUsedReRollTokens !== 'undefined') setUsedReRollTokens(false);
                localStorage.removeItem('chaos_tokens');
                localStorage.removeItem('chaos_hasRolled');
                localStorage.removeItem('chaos_hasReRolled');
                localStorage.removeItem('chaos_perks');

                if (isRunEnding) {
                    const finalTrialsRes = await finalTrialsPromise;

                    if (trialResult.seasonStatus !== 'COMPLETED') {
                        // THE VOID COLLAPSE
                        setRunEndingData({
                            outcome: 'failure',
                            isChained: isKillerActuallyDead,
                            recap: { status: trialResult.seasonStatus, finalTrials: finalTrialsRes.data }
                        });
                    } else {
                        // THE CRIMSON ASH
                        setRunEndingData({
                            outcome: 'victory',
                            isChained: isKillerActuallyDead,
                            recap: { status: trialResult.seasonStatus, finalTrials: finalTrialsRes.data }
                        });
                    }
                } else {
                    navView.triggerTransition(NAV_TABS[0]);
                }
            };

            // --- TOAST LOGIC ---
            if (isIronMan && mappedSurvivors.includes('ESCAPED') && trialResult.seasonStatus === 'ACTIVE') {
                addToast("Mulligan used! Your run was saved.", "warning");
            } else if (!isKillerActuallyDead && !isRunEnding) {
                addToast("Trial complete! The Entity is pleased.", "success");
            }

            if (isKillerActuallyDead) {
                setDeathCinematic({
                    killer: currentKiller,
                    isRunEnding: isRunEnding, // Tell the Death Cinematic to hold the black background!
                    onComplete: async () => {
                        await refreshPromise;
                        if (!isRunEnding) {
                            // Standard Death: Normal Unmount
                            setDeathCinematic(null);
                            finishSubmission();
                        } else {
                            // Run Failed: Trigger Void Cinematic over top, then silently delete Death Cinematic 1.5s later
                            finishSubmission();
                            setTimeout(() => setDeathCinematic(null), 1500);
                        }
                    }
                });

                setTimeout(() => {
                    setIsViewingResults(false);
                }, 1000);
            } else {
                if (isRunEnding) {
                    await refreshPromise;
                    finishSubmission(); // This spawns the Crimson Ash cinematic ON TOP of the results

                    // Silently delete the results overlay behind the black fog after 1.5 seconds
                    setTimeout(() => {
                        setIsViewingResults(false);
                    }, 1500);
                } else {
                    // Normal Path (Run continues)
                    setIsViewingResults(false);
                    await refreshPromise;
                    finishSubmission();
                }
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

            // Check if the sale mathematically ended the run
            if (updatedSeason.status && updatedSeason.status !== 'ACTIVE') {
                const finalTrialsRes = await api.get(`/seasons/${activeSeason.seasonId}/trials`);

                if (updatedSeason.status !== 'COMPLETED') {
                    setRunEndingData({
                        outcome: 'failure',
                        isChained: false,
                        recap: { status: updatedSeason.status, finalTrials: finalTrialsRes.data }
                    });
                } else {
                    setSeasonRecap({ status: updatedSeason.status, finalTrials: finalTrialsRes.data });
                }
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

                            <div className="tab-content-wrapper hide-scrollbar" ref={scrollRef} style={navView.display.id === 'TRIALS' ? {display: 'flex', flexDirection: 'column', overflowY: 'hidden'} : {}}>

                                {/* KILLER LIST */}
                                {navView.display.id === 'KILLERS' && (
                                    <div className="killer-grid hide-scrollbar">
                                        {[...activeSeason.roster]
                                            .sort((a, b) => parseInt(a.killerId) - parseInt(b.killerId))
                                            .map((rosterItem, index) => (
                                                <div key={rosterItem.killerId} className="stagger-item" style={{ animationDelay: `${index * 25}ms` }}>
                                                    <KillerCard
                                                        killer={rosterItem}
                                                        variantType={activeSeason.variantType}
                                                        isSelected={currentKiller?.killerId === rosterItem.killerId}
                                                        onSelect={() => {
                                                            setSelectedKiller(rosterItem);
                                                            setSelectedAddons([]);
                                                        }}
                                                        onSell={(k) => setKillerToSellConfirm(k)}
                                                        mode="active"
                                                        currentBalance={projectedBalance}
                                                        isVariantCooldown={isKillerOnCooldown(rosterItem.killerId.toString())}
                                                        isUnaffordable={isFinancialVariant && rosterItem.cost > startingBalance}
                                                        isBankrupt={isBankrupt}
                                                    />
                                                </div>
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
                                    trials && trials.length > 0 ? (
                                            <TrialListTable
                                                trials={trials}
                                                variantType={activeSeason.variantType}
                                                onRowClick={setActiveTrialOverlay}
                                            />
                                        ) : (
                                        <div className="empty-state-container flex flex-col fade-in">
                                            <h3 className="bebas-header-2">The Ledger is Empty</h3>
                                            <p className="inter-text-small text-center" style={{ maxWidth: '350px' }}>
                                                No trials have been documented yet. Start a trial to offer your first sacrifice to the Entity.
                                            </p>
                                        </div>
                                    )


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
                <SellKillerModal
                    killer={killerToSellConfirm}
                    projectedBalance={projectedBalance}
                    onClose={(confirm) => {
                        if (confirm) handleSellKiller(killerToSellConfirm);
                        setKillerToSellConfirm(null);
                    }}
                />
            )}

            <TrialDetailsModal
                trial={activeTrialOverlay}
                trials={trials}
                variantType={activeSeason?.variantType}
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
                <div className={isResultsClosing ? 'fade-out' : ''} style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                    <TrialResultsOverlay
                        season={activeSeason}
                        killer={currentKiller}
                        selectedAddons={selectedAddons}
                        selectedPerks={selectedPerks}
                        trialCount={trialCount}
                        onSubmit={handleTrialSubmit}
                    />
                </div>
            )}

            {deathCinematic && (
                <DeathCinematic
                    killer={deathCinematic.killer}
                    isRunEnding={deathCinematic.isRunEnding}
                    onComplete={deathCinematic.onComplete}
                />
            )}

            {runEndingData && (
                <RunEndingCinematic
                    outcome={runEndingData.outcome}
                    recapData={runEndingData.recap}
                    isChained={runEndingData.isChained}
                    onTriggerRecap={(data) => setSeasonRecap(data)} // Renders the overlay silently in the background
                    onComplete={() => setRunEndingData(null)}
                />
            )}

            {seasonRecap && (
                <SeasonRecapOverlay
                    season={activeSeason}
                    recapData={seasonRecap}
                    actionText="Return to Dashboard"
                    onAction={() => navigate('/dashboard')}
                    stayOpenOnAction={true}
                />
            )}
        </div>
    );
};

export default CurrentSeasonPage;
