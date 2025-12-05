import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isFavorite, toggleFavorite, refreshFavoritesCache } from '../utils/favorites';
import './ArtifactModal.css';

export default function ArtifactModal({ artifact, isOpen, onClose, favorite: initialFavorite, onFavoriteToggle }) {
    const { user } = useAuth();
    const [favorite, setFavorite] = useState(initialFavorite || false);

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
    } = artifact || {};

    useEffect(() => {
        const checkFavorite = async () => {
            if (user && user.userId && artId) {
                await refreshFavoritesCache(user.userId);
                setFavorite(isFavorite(artId));
            } else {
                setFavorite(false);
            }
        };
        if (isOpen) {
            checkFavorite();
        }
    }, [user, artId, isOpen]);

    // 부모 컴포넌트에서 전달된 favorite prop이 변경되면 업데이트
    useEffect(() => {
        if (initialFavorite !== undefined) {
            setFavorite(initialFavorite);
        }
    }, [initialFavorite]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleFavoriteToggle = async (e) => {
        e.stopPropagation();
        if (!user || !user.userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        // 부모 컴포넌트의 핸들러가 있으면 사용, 없으면 직접 처리
        if (onFavoriteToggle) {
            await onFavoriteToggle(e);
            // 부모에서 favorite 상태가 업데이트되면 prop으로 전달됨
        } else {
            try {
                await toggleFavorite(user.userId, artId);
                await refreshFavoritesCache(user.userId);
                setFavorite(isFavorite(artId));
            } catch (error) {
                alert('관심 목록 업데이트에 실패했습니다.');
            }
        }
    };

    if (!isOpen || !artifact) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                {imageUrl && (
                    <div className="modal-image-wrapper">
                        <img 
                            src={imageUrl} 
                            alt={name || 'Artifact'} 
                            className="modal-image"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                            }}
                        />
                    </div>
                )}

                <div className="modal-body">
                    <div className="modal-header">
                        <h2 className="modal-title">{name || 'Unnamed Artifact'}</h2>
                        <button
                            className={`modal-favorite-button ${favorite ? 'favorited' : ''}`}
                            onClick={handleFavoriteToggle}
                            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            {favorite ? '❤️' : '🤍'}
                        </button>
                    </div>

                    <div className="modal-details">
                        <div className="modal-info-item">
                            <span className="modal-info-label">Age:</span>
                            <span className="modal-info-value">{age != null ? age : 'Unknown'}</span>
                        </div>
                        <div className="modal-info-item">
                            <span className="modal-info-label">Genre:</span>
                            <span className="modal-info-value">{genre || 'Unknown'}</span>
                        </div>
                        <div className="modal-info-item">
                            <span className="modal-info-label">Theme:</span>
                            <span className="modal-info-value">{theme || 'Unknown'}</span>
                        </div>
                        <div className="modal-info-item">
                            <span className="modal-info-label">작가:</span>
                            <span className="modal-info-value">{artistName || artistId || 'Unknown'}</span>
                        </div>
                        <div className="modal-info-item">
                            <span className="modal-info-label">미술관:</span>
                            <span className="modal-info-value">{galleryName || galleryId || 'Unknown'}</span>
                        </div>
                        <div className="modal-info-item">
                            <span className="modal-info-label">전시 여부:</span>
                            <span className={`modal-info-value ${display === true ? 'display-true' : 'display-false'}`}>
                                {display === true ? 'O' : 'X'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

