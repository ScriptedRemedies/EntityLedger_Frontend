import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ChallengesPage.scss';
import '../styles/CurrentSeasonPage.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useToast } from "../hooks/ToastContext.jsx";
import KillerCard from "./KillerCard.jsx";
import StandardLoadout from "./variant-loadouts/StandardLoadout.jsx";
import GradeBadgeDisplay from './GradeBadgeDisplay';

const NAV_TABS = [
    { id: 'KILLERS', name: 'Killers' },
    { id: 'LOADOUT', name: 'Loadout' }
];

const CurrentSeasonPage = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { seasonId } = useParams();

    const navView = useFadeTransition(NAV_TABS[0]);

    const [activeSeason, setActiveSeason] = useState(null);

    const [selectedKiller, setSelectedKiller] = useState(null);

    useEffect(() => {
        if (!seasonId) return;

        const fetchSeasonData = async () => {
            try {
                const response = await api.get(`/seasons/active`);
                setActiveSeason(response.data);
                console.log("Current Season Data:", response.data);
            } catch (error) {
                console.error("Failed to fetch season:", error);
            }
        };

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

    const defaultKiller = activeSeason.roster.find(k => k.killerName === activeSeason.characterName);
    const currentKiller = selectedKiller || defaultKiller;

    // If they clicked someone, show that killer. If not, fallback to the backend's default.
    const displayImageUrl = currentKiller
        ? `/assets/Killer Portraits/${currentKiller.killerName}.png`
        : activeSeason.characterImageUrl;

    const displayCharacterName = currentKiller
        ? currentKiller.killerName
        : activeSeason.characterName;

    const renderLoadoutView = () => {
        switch (activeSeason.variantType) {

            // case 'CHAOS_SHUFFLE':
                // return <ChaosShuffleLoadout season={activeSeason} />;
            // case 'BLOOD_MONEY':
                // return <BloodMoneyLoadout season={activeSeason} />;
            default:
                return <StandardLoadout currentKiller={currentKiller} season={activeSeason} />;
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

                            <div className="tab-content-wrapper hide-scrollbar">

                                {/* KILLER LIST */}
                                {navView.display.id === 'KILLERS' && (
                                    <div className="killer-grid hide-scrollbar">
                                        {activeSeason.roster.map(rosterItem => (
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
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* === RIGHT PANEL === */}
            <div className="right-panel">
                <button className="squareBtn">Start Trial</button>

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
        </div>
    );
};

export default CurrentSeasonPage;
