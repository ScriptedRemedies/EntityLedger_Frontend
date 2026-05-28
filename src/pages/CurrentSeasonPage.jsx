import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ChallengesPage.scss';
import '../styles/CurrentSeasonPage.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useToast } from "../hooks/ToastContext.jsx";
import KillerCard from "./small-components/KillerCard.jsx";
import StandardLoadout from "./variant-loadouts/StandardLoadout.jsx";
import GradeBadgeDisplay from './small-components/GradeBadgeDisplay.jsx';
import TrialConfirmationOverlay from './overlays/TrialConfirmationOverlay';
import TrialResultsOverlay from './overlays/TrialResultsOverlay.jsx';
import TrialListTable from './small-components/TrialListTable.jsx';
import TrialDetailsOverlay from './overlays/TrialDetailsOverlay';
import SeasonRecapOverlay from './overlays/SeasonRecapOverlay'
import AdeptLoadout from "./variant-loadouts/AdeptLoadout.jsx";

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
    const [selectedPerks, setSelectedPerks] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [isViewingResults, setIsViewingResults] = useState(false);
    const [seasonRecap, setSeasonRecap] = useState(null);

    const fetchSeasonData = async () => {
        if (!seasonId) return;
        try {
            const response = await api.get(`/seasons/active`);
            setActiveSeason(response.data);

            // Fetch the trials for this season to count them
            if (response.data && response.data.seasonId) {
                const trialsRes = await api.get(`/seasons/${response.data.seasonId}/trials`);
                setTrialCount(trialsRes.data.length);
                setTrials(trialsRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch season or trials:", error);
        }
    };

    // 2. Call it once when the page first loads
    useEffect(() => {
        fetchSeasonData();
    }, [seasonId]);

    // Loading Guard
    if (!activeSeason) {
        return (
            <div className="main-container review-container relative flex items-center justify-center">
                <div className="text-center">
                    <h2 className="bebas-header-1 title-white text-2xl animate-pulse">Summoning The Entity...</h2>
                </div>
            </div>
        );
    }

    // Check the backend's variant state first. If null, fallback to the season's starting character.
    const lastPlayedId = activeSeason.variantState?.lastPlayedKillerId;

    const defaultKiller = lastPlayedId
        ? activeSeason.roster.find(k => k.killerId.toString() === lastPlayedId.toString())
        : activeSeason.roster.find(k => k.killerName === activeSeason.characterName);

    const currentKiller = selectedKiller || defaultKiller;

    // If they clicked someone, show that killer. If not, fallback to the backend's default.
    const displayImageUrl = currentKiller
        ? `/assets/Killer Portraits/${currentKiller.killerName}.png`
        : activeSeason.characterImageUrl;

    const displayCharacterName = currentKiller
        ? currentKiller.killerName
        : activeSeason.characterName;

    // --- TRIAL SUBMISSION LOGIC ---
    const handleTrialSubmit = async (resultsPayload) => {
        try {
            // 1. Determine Killer Fate for UI feedback
            const isKillerDead = resultsPayload.survivors.includes('escaped');

            // 2. Map UI Survivor statuses to your Java Backend Enums
            const mappedSurvivors = resultsPayload.survivors.map(status => {
                if (status === 'hatch') return 'HATCH_ESCAPE';
                return status.toUpperCase(); // 'SACRIFICED', 'ESCAPED', etc.
            });

            // 3. Calculate Kills for the DTO
            const killCount = mappedSurvivors.filter(s =>
                s === 'SACRIFICED' || s === 'KILLED'
            ).length;

            // 4. Build the BASE Payload (Required for ALL variants)
            const payload = {
                killerId: currentKiller.killerId,
                pipProgression: resultsPayload.pipChange,
                perkIds: selectedPerks.filter(Boolean).map(p => p.id),
                addOnIds: selectedAddons.filter(Boolean).map(a => a.id),
                survivorOutcomes: mappedSurvivors,
                emblems: resultsPayload.emblems.map(e => ({
                    category: e.category,
                    quality: e.quality,
                    points: e.points
                }))
            };

            // 5. Conditionally append BLOOD_MONEY specific rules
            if (activeSeason.variantType === 'BLOOD_MONEY') {
                payload.kills = killCount;
                // TODO: Add UI input for Blood Money Results
                payload.gensLeft = 0;
                // TODO: Add UI input for Blood Money Results
                payload.closedHatch = false;
                // TODO: Add UI input for Blood Money Results
                payload.genBeforeHook = false;
                payload.lastGenCompleted = mappedSurvivors.includes('ESCAPED');
                payload.gateOpened = mappedSurvivors.includes('ESCAPED');
            }

            // 6. Send to Backend
            const response = await api.post(`/trials`, payload);
            const trialResult = response.data;

            // 7. Provide specific feedback
            if (isKillerDead) {
                addToast(`${currentKiller.killerName} was consumed by The Entity.`, "error");
            } else {
                addToast("Trial complete! The Entity is pleased.", "success");
            }

            // 8. Clean up UI
            // (Removed setIsViewingResults from here so the overlay stays visible while loading!)
            setSelectedPerks([]);
            setSelectedAddons([]);
            setSelectedKiller(null);

            // 9. CHECK FOR TERMINAL STATE (The Trap)
            if (trialResult.seasonStatus && trialResult.seasonStatus !== 'ACTIVE') {
                const finalTrialsRes = await api.get(`/seasons/${activeSeason.seasonId}/trials`);

                setSeasonRecap({
                    status: trialResult.seasonStatus,
                    finalTrials: finalTrialsRes.data
                });

                // Cross-fade: Hide the results ONLY AFTER the recap data is locked and loaded
                setIsViewingResults(false);
            } else {
                // Normal flow - Season is still active
                setIsViewingResults(false);
                navView.triggerTransition(NAV_TABS[0]);
                await fetchSeasonData();
            }

        } catch (error) {
            console.error("Failed to submit trial:", error);
            addToast("Failed to submit trial data.", "error");
        }
    };

    const renderLoadoutView = () => {
        switch (activeSeason.variantType) {
            case 'ADEPT':
                return (
                    <AdeptLoadout
                        currentKiller={currentKiller}
                        selectedPerks={selectedPerks}
                        setSelectedPerks={setSelectedPerks}
                        selectedAddons={selectedAddons}
                        setSelectedAddons={setSelectedAddons}
                        season={activeSeason}
                    />
                );
            default: // STANDARD
                return (
                    <StandardLoadout
                        currentKiller={currentKiller}
                        selectedPerks={selectedPerks}
                        setSelectedPerks={setSelectedPerks}
                        selectedAddons={selectedAddons}
                        setSelectedAddons={setSelectedAddons}
                    />
                );
        }
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

                            <div className="variant-header">
                                <h1 className="bebas-header-1 title-white">{navView.display.name}</h1>
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
                                                    onSelect={() => setSelectedKiller(rosterItem)}
                                                    mode="active"
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
                <button className="squareBtn" onClick={() => setIsConfirmingTrial(true)}>
                    Start Trial
                </button>

                <div className="global-season-info">

                    <GradeBadgeDisplay
                        rawGrade={activeSeason.currentGrade}
                        pips={activeSeason.currentPips}
                    />

                    <div className="global-season-text">
                        {/* Dynamically uses the selected killer's name */}
                        <h3 key={displayCharacterName} className="bebas-header-1 global-character-name fade-in">{displayCharacterName}</h3>
                        <p className="inter-text-small">{activeSeason.variantType}</p>
                        <p className="inter-text-small global-days-left">{activeSeason.daysLeft} Days Left</p>
                    </div>
                </div>

                {/* Dynamically uses the selected killer's image */}
                <img
                    key={displayImageUrl}
                    src={displayImageUrl}
                    className="global-character-bg fade-in"
                    alt={displayCharacterName}
                />
            </div>

            {/* Trial Details Overlay */}
            <TrialDetailsOverlay
                trial={activeTrialOverlay}
                onClose={() => setActiveTrialOverlay(null)}
            />

            {/* Trial Confirmation */}
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

            {/* Trial Results */}
            {isViewingResults && (
                <TrialResultsOverlay
                    season={activeSeason}
                    killer={currentKiller}
                    trialCount={trialCount}
                    onSubmit={handleTrialSubmit}
                />
            )}

            {/* Season Recap Overlay (Terminal State) */}
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
