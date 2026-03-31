import React from 'react';
import { Language, UserProfile } from '../types';
import { getProgressToNextCoin } from '../services/coinService';

const coinTranslations: Record<Language, {
    saves: string;
    shares: string;
    until_plus_one: string;
    earn_coins: string;
    saves_rule: string;
    shares_rule: string;
}> = {
    [Language.DE]: {
        saves: "Speicherungen",
        shares: "Weiterleitungen",
        until_plus_one: "bis +1",
        earn_coins: "Verdiene Münzen durch das Speichern und Teilen von Träumen!",
        saves_rule: "Je 99 Speicherungen = 1 Münze",
        shares_rule: "Je 99 Weiterleitungen = 1 Münze",
    },
    [Language.EN]: {
        saves: "Saves",
        shares: "Shares",
        until_plus_one: "until +1",
        earn_coins: "Earn coins by saving and sharing dreams!",
        saves_rule: "Every 99 saves = 1 coin",
        shares_rule: "Every 99 shares = 1 coin",
    },
    [Language.TR]: {
        saves: "Kaydetmeler",
        shares: "Paylaşımlar",
        until_plus_one: "+1'e kadar",
        earn_coins: "Rüyaları kaydederek ve paylaşarak jeton kazanın!",
        saves_rule: "Her 99 kaydetme = 1 jeton",
        shares_rule: "Her 99 paylaşım = 1 jeton",
    },
    [Language.ES]: {
        saves: "Guardados",
        shares: "Compartidos",
        until_plus_one: "hasta +1",
        earn_coins: "¡Gana monedas guardando y compartiendo sueños!",
        saves_rule: "Cada 99 guardados = 1 moneda",
        shares_rule: "Cada 99 compartidos = 1 moneda",
    },
    [Language.FR]: {
        saves: "Sauvegardes",
        shares: "Partages",
        until_plus_one: "jusqu'à +1",
        earn_coins: "Gagnez des pièces en sauvegardant et partageant des rêves !",
        saves_rule: "Tous les 99 sauvegardes = 1 pièce",
        shares_rule: "Tous les 99 partages = 1 pièce",
    },
    [Language.AR]: {
        saves: "الحفظ",
        shares: "المشاركات",
        until_plus_one: "حتى +1",
        earn_coins: "اكسب عملات من خلال حفظ ومشاركة الأحلام!",
        saves_rule: "كل 99 حفظ = 1 عملة",
        shares_rule: "كل 99 مشاركة = 1 عملة",
    },
    [Language.PT]: {
        saves: "Salvamentos",
        shares: "Compartilhamentos",
        until_plus_one: "até +1",
        earn_coins: "Ganhe moedas salvando e compartilhando sonhos!",
        saves_rule: "A cada 99 salvamentos = 1 moeda",
        shares_rule: "A cada 99 compartilhamentos = 1 moeda",
    },
    [Language.RU]: {
        saves: "Сохранения",
        shares: "Пересылки",
        until_plus_one: "до +1",
        earn_coins: "Зарабатывайте монеты, сохраняя и делясь снами!",
        saves_rule: "Каждые 99 сохранений = 1 монета",
        shares_rule: "Каждые 99 пересылок = 1 монета",
    },
};

interface CoinDisplayProps {
    profile: UserProfile;
    language: Language;
    showDetails?: boolean;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ profile, language, showDetails = false }) => {
    const t = coinTranslations[language];
    const coins = (profile as any).coins ?? 0;
    const progress = getProgressToNextCoin(profile);

    return (
        <div className="coin-display">
            {/* Main Coin Counter */}
            <div className="coin-counter">
                <span className="coin-icon">🪙</span>
                <span className="coin-amount">{coins}</span>
            </div>

            {/* Detailed Progress */}
            {showDetails && (
                <div className="coin-details">
                    {/* Save Progress */}
                    <div className="progress-item">
                        <div className="progress-header">
                            <span className="progress-label">💾 {t.saves}</span>
                            <span className="progress-remaining">{progress.savesRemaining} {t.until_plus_one} 🪙</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill save"
                                style={{ width: `${progress.savesProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Share Progress */}
                    <div className="progress-item">
                        <div className="progress-header">
                            <span className="progress-label">📤 {t.shares}</span>
                            <span className="progress-remaining">{progress.sharesRemaining} {t.until_plus_one} 🪙</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill share"
                                style={{ width: `${progress.sharesProgress}%` }}
                            />
                        </div>
                    </div>

                    <div className="coin-info">
                        <p>💡 {t.earn_coins}</p>
                        <p>• {t.saves_rule}</p>
                        <p>• {t.shares_rule}</p>
                    </div>
                </div>
            )}

            <style>{`
                .coin-display {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .coin-counter {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    border-radius: 20px;
                    box-shadow: 0 4px 6px rgba(255, 215, 0, 0.3);
                    font-weight: 700;
                    font-size: 1.2rem;
                    color: #333;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                }

                .coin-counter:hover {
                    transform: scale(1.05);
                }

                .coin-icon {
                    font-size: 1.5rem;
                    animation: coin-spin 3s linear infinite;
                }

                @keyframes coin-spin {
                    0%, 100% { transform: rotateY(0deg); }
                    50% { transform: rotateY(180deg); }
                }

                .coin-amount {
                    font-size: 1.3rem;
                }

                .coin-details {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }

                .progress-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .progress-label {
                    color: rgba(255, 255, 255, 0.9);
                }

                .progress-remaining {
                    color: rgba(255, 215, 0, 0.9);
                    font-size: 0.85rem;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .progress-fill.save {
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                }

                .progress-fill.share {
                    background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
                }

                .coin-info {
                    margin-top: 0.5rem;
                    padding: 1rem;
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 8px;
                    font-size: 0.85rem;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.8);
                }

                .coin-info p {
                    margin: 0.25rem 0;
                }

                .coin-info p:first-child {
                    font-weight: 600;
                    color: #ffd700;
                    margin-bottom: 0.5rem;
                }

                @media (max-width: 768px) {
                    .coin-counter {
                        font-size: 1rem;
                    }

                    .coin-icon {
                        font-size: 1.3rem;
                    }

                    .coin-amount {
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default CoinDisplay;
