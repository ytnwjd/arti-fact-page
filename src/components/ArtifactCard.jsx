import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isFavorite, addToFavorites, removeFromFavorites } from '../utils/favorites';
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
        if (user && artId) {
            setFavorite(isFavorite(artId));
        } else {
            setFavorite(false);
        }
    }, [user, artId]);

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
            />
        </>
    );
}

