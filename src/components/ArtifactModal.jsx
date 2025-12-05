import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isFavorite, addToFavorites, removeFromFavorites } from '../utils/favorites';
import './ArtifactModal.css';

export default function ArtifactModal({ artifact, isOpen, onClose }) {
    const { user } = useAuth();
    const [favorite, setFavorite] = useState(false);

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
        if (user && artId) {
            setFavorite(isFavorite(artId));
        } else {
            setFavorite(false);
        }
    }, [user, artId, isOpen]);

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

    const handleFavoriteToggle = (e) => {
        e.stopPropagation();
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (favorite) {
            removeFromFavorites(artId);
            setFavorite(false);
        } else {
            addToFavorites(artId);
            setFavorite(true);
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

