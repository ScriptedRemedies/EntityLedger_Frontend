import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ChallengesPage.scss';
import '../styles/CurrentSeasonPage.scss';
import { useFadeTransition } from "../hooks/useFadeTranistion.js";
import { useEffect } from "react";
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

    useEffect(() => {
        if (!seasonId) return;

        const fetchSeasonData = async () => {
            try {
                const response = await api.get(`/seasons/active`);
                // TODO: Remove once page is finished
                console.log(response.data);
            } catch (error) {
                console.error("Failed to fetch season:", error);
            }
        };

        fetchSeasonData();
    }, [seasonId]);

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
            {/* TODO: Add functionality */}
            <div className="right-panel">
                <button className="squareBtn">Start Trial</button>
            </div>
        </div>
    );
};

export default CurrentSeasonPage;
