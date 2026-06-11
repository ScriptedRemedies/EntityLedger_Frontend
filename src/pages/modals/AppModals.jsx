import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import EntityLoader from "../small-components/EntityLoader.jsx";
import '../../styles/small-components/Modals.scss';

// ==========================================
// 1. VERSION INFO MODAL
// ==========================================
export const VersionModal = ({ version, date, content, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300); // Triggers parent unmount AFTER animation
    };

    return (
        <div className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}>
            <div className={`modal-content-box ${isClosing ? 'modal-slam-out' : 'modal-slam'}`} style={{ width: '600px' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="bebas-header-1 text-2xl m-0">Version {version} Information</h2>
                        <p className="inter-text-small title-iri uppercase m-0">Released: {date}</p>
                    </div>
                    <button onClick={handleClose} className="close-modal-btn">✕</button>
                </div>
                <div className="modal-body hide-scrollbar" style={{ maxHeight: '75vh' }}>
                    <div className="markdown-content">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <p className="inter-text-small text-muted uppercase" style={{ fontSize: '11px'}}>
                        © {new Date().getFullYear()} The Entity's Ledger | Developed by Sam Bushey | <a target="_blank" href="http://scriptedremedies.com">Scripted Remedies</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 2. SELL KILLER MODAL
// ==========================================
export const SellKillerModal = ({ killer, projectedBalance, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const handleClose = (confirmSale) => {
        setIsClosing(true);
        setTimeout(() => onClose(confirmSale), 300);
    };

    return (
        <div className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}>
            <div className={`modal-content-box ${isClosing ? 'modal-slam-out' : 'modal-slam'}`} style={{ width: '600px' }}>
                <div className="modal-header">
                    <h2 className="bebas-header-1 title-iri m-0 text-3xl">CONFIRM SALE</h2>
                    <button onClick={() => handleClose(false)} className="close-modal-btn">✕</button>
                </div>

                <div className="modal-body" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ width: '130px', height: '130px', flexShrink: 0, border: '1px solid rgba(139, 40, 40, 0.3)', background: 'rgba(139, 40, 40, 0.05)', position: 'relative', overflow: 'hidden' }}>
                        <img src={`/assets/Killers/${killer.killerName}.png`} alt={killer.killerName} style={{ height: '130%', objectFit: 'cover', filter: 'grayscale(80%) brightness(0.8)' }} />
                    </div>

                    <div>
                        <p className="inter-text-normal m-0">
                            Are you sure you want to sell <span className="text-white">{killer.killerName}</span> for <span className="title-iri">${killer.cost}</span>?
                        </p>
                        <div className="mt-4" style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderLeft: '2px solid var(--color-IRIDESCENT)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="inter-text-small text-muted">Projected Balance:</span>
                            <span className="inter-text-small title-white">${projectedBalance + killer.cost}</span>
                        </div>
                        <p className="inter-text-small text-muted mt-3 mb-0">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="back-button" onClick={() => handleClose(false)}>Cancel</button>
                    <button className="squareBtn" onClick={() => handleClose(true)}>Confirm Sale</button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 3. START CHALLENGE (PACT) MODAL
// ==========================================
export const StartChallengeModal = ({ variant, startingBalance, rosterList, onSubmit, onClose, isSealingPact }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    return (
        <div className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}>
            <div className={`modal-content-box ${isClosing ? 'modal-slam-out' : 'modal-slam'}`} style={{ width: '70vw', maxWidth: '800px', height: '80vh' }}>
                {isSealingPact ? (
                    <div className="modal-body flex flex-col items-center justify-center fade-in">
                        <h2 className="bebas-header-1 title-iri text-4xl mb-6 tracking-widest">CHALLENGE STARTED</h2>
                        <EntityLoader />
                    </div>
                ) : (
                    <>
                        <div className="modal-header">
                            <h2 className="bebas-header-1 title-white text-3xl m-0">CONFIRM NEW CHALLENGE</h2>
                            <button onClick={handleClose} className="close-modal-btn">✕</button>
                        </div>

                        <div className="modal-body hide-scrollbar">
                            <h3 className="bebas-header-1 text-2xl mb-2">Variant: <span className="title-iri">{variant.name}</span></h3>
                            {(variant.id === 'BLOOD_MONEY' || variant.id === 'AFTERBURN') && (
                                <p className="bebas-header-1">Starting Balance: <span className="title-iri">${startingBalance}</span></p>
                            )}

                            <p className="inter-text-normal mt-4 mb-2">{variant.rulesDescription}</p>
                            <ul className="inter-text-small" style={{ listStyleType: 'square', paddingLeft: '1.5rem' }}>
                                {variant.rulesSummary.map((rule, i) => <li key={i} className="mb-1">{rule}</li>)}
                            </ul>

                            <div className="mt-6">
                                <button className="inter-text-normal title-white" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
                                    <span>Included Killers ({rosterList.length})</span>
                                </button>
                                <ul style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '10px',
                                    marginTop: '15px',
                                    paddingLeft: '1.5rem',
                                    listStyleType: 'square'
                                }}>
                                    {rosterList.map(k => <li key={k.id || k.killerId}
                                                             className="inter-text-small text-normal">{k.name || k.killerName}</li>)}
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="back-button" onClick={handleClose}>Back</button>
                            <button className="squareBtn" onClick={onSubmit}>Start Challenge</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
