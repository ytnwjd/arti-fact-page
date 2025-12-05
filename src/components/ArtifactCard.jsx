import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isFavorite, toggleFavorite, refreshFavoritesCache } from '../utils/favorites';
import ArtifactModal from './ArtifactModal';
import './ArtifactCard.css';

export default function ArtifactCard({ artifact }) {
    if (!artifact) return null;

    const { user } = useAuth();
    const [favorite, setFavorite] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        artId,
        name,
        artistId,
        artistName,
        galleryId,
        galleryName,
        display,
        genre,
        theme,
        age,
        imageUrl
    } = artifact;

    useEffect(() => {
        const checkFavorite = async () => {
            if (user && user.userId && artId) {
                // 관심목록 캐시가 없으면 먼저 가져오기
                await refreshFavoritesCache(user.userId);
                setFavorite(isFavorite(artId));
            } else {
                setFavorite(false);
            }
        };
        checkFavorite();
    }, [user, artId]);

    const handleFavoriteToggle = async (e) => {
        e.stopPropagation();
        if (!user || !user.userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            await toggleFavorite(user.userId, artId);
            // 토글 후 캐시 새로고침
            await refreshFavoritesCache(user.userId);
            setFavorite(isFavorite(artId));
        } catch (error) {
            alert('관심 목록 업데이트에 실패했습니다.');
        }
    };

    return (
        <>
            <div 
                className="artifact-card" 
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: 'pointer' }}
            >
                {imageUrl && (
                    <div className="artifact-image-wrapper">
                        <img 
                            src={imageUrl} 
                            alt={name || 'Artifact'} 
                            className="artifact-image"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                        />
                    </div>
                )}
                <div className="artifact-content">
                    <h3 className="artifact-name">{name || 'Unnamed Artifact'}</h3>
                    <div className="artifact-details">
                        <div className="artifact-info-row">
                            <span className="info-label">Age:</span>
                            <span className="info-value">{age != null ? age : 'Unknown'}</span>
                        </div>
                        <div className="artifact-info-row">
                            <span className="info-label">Genre:</span>
                            <span className="info-value">{genre || 'Unknown'}</span>
                        </div>
                        <div className="artifact-info-row">
                            <span className="info-label">Theme:</span>
                            <span className="info-value">{theme || 'Unknown'}</span>
                        </div>
                        <div className="artifact-info-row">
                            <span className="info-label">작가:</span>
                            <span className="info-value">{artistName || artistId || 'Unknown'}</span>
                        </div>
                        <div className="artifact-info-row">
                            <span className="info-label">미술관:</span>
                            <span className="info-value">{galleryName || galleryId || 'Unknown'}</span>
                        </div>
                        <div className="artifact-info-row">
                            <span className="info-label">전시 여부:</span>
                            <span className={`info-value ${display === true ? 'display-true' : 'display-false'}`}>
                                {display === true ? 'O' : 'X'}
                            </span>
                        </div>
                        <div className="artifact-info-row favorite-row">
                            <button
                                className={`favorite-button ${favorite ? 'favorited' : ''}`}
                                onClick={handleFavoriteToggle}
                                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                {favorite ? '❤️' : '🤍'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ArtifactModal 
                artifact={artifact}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                favorite={favorite}
                onFavoriteToggle={handleFavoriteToggle}
            />
        </>
    );
}

