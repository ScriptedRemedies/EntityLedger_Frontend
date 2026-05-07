import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ChallengesPage.scss';
import '../styles/CurrentSeasonPage.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import {useEffect, useState} from "react";
import api from "../services/api.js";
import { useToast } from "../hooks/ToastContext.jsx";

const NAV_TABS = [
    { id: 'KILLERS', name: 'Killers' },
    { id: 'LOADOUT', name: 'Loadout' }
];

const CurrentSeasonPage = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { seasonId } = useParams();

    const navView = useFadeTransition(NAV_TABS[0]);

    const [activeSeason, setActiveSeason] = useState();

    useEffect(() => {
        if (!seasonId) return;

        const fetchSeasonData = async () => {
            try {
                const response = await api.get(`/seasons/active`);
                setActiveSeason(response.data);
                // TODO: Remove once page is finished
                console.log(response.data);
            } catch (error) {
                console.error("Failed to fetch season:", error);
            }
        };

        fetchSeasonData();
    }, [seasonId]);

    if (!activeSeason) {
        return (
            <div className="main-container review-container relative flex items-center justify-center">
                <div className="text-center">
                    <h2 className="bebas-header-1 title-white text-2xl animate-pulse">Summoning The Entity...</h2>
                </div>
            </div>
        );
    }

    const [badge, gradeNum] = activeSeason.currentGrade.split("_");

    return (
        <div className="main-container review-container relative">

            {/* === LEFT NAV === */}
            <div className="nav">
                <div className="nav-fog-wrapper">
                    <div className="nav-fog-bg"></div>
                </div>

                <div className="nav-icons-list hide-scrollbar">
                    {/* 3. Map over your static array, NOT the hook state! */}
                    {NAV_TABS.map((tab) => (
                        <div
                            key={tab.id}
                            className="variantIconContainer"
                            onClick={() => navView.triggerTransition(tab)}
                        >
                            {/* Check if the hook's active state matches this tab */}
                            {navView.active?.id === tab.id && (
                                <div className="variantIconActive fade-in"></div>
                            )}

                            {/* Make sure to drop Killers.png and Loadout.png into an appropriate assets folder! */}
                            <img
                                src={`/assets/Nav/${tab.name}Selection.png`}
                                alt={tab.name}
                                className="variantIcon"
                            />
                        </div>
                    ))}
                </div>
                {/* TODO: Add trial recap screen just like in the review section but make it above the back button if you can */}

                <button onClick={() => navigate("/dashboard")} className="back-button">Back</button>
            </div>

            {/* === MIDDLE CONTENT AREA === */}
            {/* TODO: Add killers and loadout */}
            <div className="middle-content">
                {navView.display && (
                    <div key={navView.display.id} className={`variant-view-wrapper ${navView.isTransitioning ? 'fade-out' : 'fade-in'}`}>
                        <div className="content-fog-bg"></div>

                        <div className="variant-content-area">

                            <div className="variant-header">
                                <h1 className="bebas-header-1 title-white">{navView.display.name}</h1>
                            </div>

                            <div className="tab-content-wrapper hide-scrollbar mt-6">

                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* === RIGHT PANEL === */}
            <div className="right-panel">
                {/* TODO: Add functionality */}
                <button className="squareBtn">Start Trial</button>

                <div className="global-season-info">
                    <div className="badge">
                        <img src={`/assets/Grades/${badge}.png`} alt={gradeNum} className="badge-image"/>
                        <p className="gradeNum" style={{ color: `var(--color-${badge})` }}>{gradeNum}</p>
                    </div>
                    <div className="global-season-text">
                        <h3 className="bebas-header-1 global-character-name">{activeSeason.characterName}</h3>
                        <p className="inter-text-small">{activeSeason.variantType}</p>
                        <p className="inter-text-small global-days-left">{activeSeason.daysLeft} Days Left</p>
                    </div>
                </div>

                <img
                    src={activeSeason.characterImageUrl}
                    className="global-character-bg"
                />
            </div>
        </div>
    );
};

export default CurrentSeasonPage;
