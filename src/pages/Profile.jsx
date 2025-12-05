import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { getFavorites } from '../utils/favorites';
import ArtifactModal from '../components/ArtifactModal';
import './Profile.css';

export default function Profile() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [selectedArtifact, setSelectedArtifact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [artifactLoading, setArtifactLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setProfileLoading(false);
                return;
            }

            if (!user.userId) {
                // userId가 없으면 잘못된 세션이므로 로그아웃 처리
                logout();
                navigate('/login', { replace: true });
                return;
            }

            try {
                setProfileLoading(true);
                setError(null);
                const userId = user.userId;
                
                const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setProfileData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setProfileLoading(false);
            }
        };

        if (!loading) {
            fetchProfile();
        }
    }, [user, loading]);

    // 관심목록 가져오기
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user || !user.userId) {
                return;
            }

            try {
                setFavoritesLoading(true);
                const favoritesData = await getFavorites(user.userId);
                
                // 응답: { likedId, artId, artName, imageUrl, artistName, galleryName }
                const artifacts = favoritesData.map(liked => ({
                    artId: liked.artId,
                    name: liked.artName, // artName을 name으로 매핑
                    artistName: liked.artistName,
                    galleryName: liked.galleryName,
                    imageUrl: liked.imageUrl,
                    // 응답에 없는 필드들은 null 또는 기본값
                    genre: null,
                    theme: null,
                    age: null,
                    display: null,
                    artistId: null,
                    galleryId: null
                }));
                setFavorites(artifacts);
            } catch (err) {
                setFavorites([]);
            } finally {
                setFavoritesLoading(false);
            }
        };

        if (!loading && user?.userId) {
            fetchFavorites();
        }
    }, [user, loading]);

    if (loading || profileLoading) {
        return (
            <div className="profile-container">
                <div className="profile-box">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="profile-box">
                    <p>프로필을 불러오는 중 오류가 발생했습니다.</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const initial = profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U';
    
    const formatBirthDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        if (!password || !confirmPassword) {
            setPasswordError('모든 필드를 입력해주세요.');
            return;
        }

        if (password.length < 6) {
            setPasswordError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE_URL}/api/users/${user.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: profileData?.email || user.email,
                    password: password,
                    name: profileData?.name || user.name,
                    birthDate: profileData?.birthDate || user.birthDate
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '비밀번호 변경에 실패했습니다.');
            }

            setPasswordSuccess(true);
            setPassword('');
            setConfirmPassword('');
            
            // 2초 후 모달 닫기
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess(false);
            }, 2000);
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordSuccess(false);
    };

    return (
        <div className="profile-container">
            {/* 관심목록 섹션 */}
            {user?.userId && (
                <div className="favorites-section">
                    <h2 className="favorites-title">내 관심목록</h2>
                    {favoritesLoading ? (
                        <div className="favorites-loading">
                            <p>로딩 중...</p>
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="favorites-list">
                            {favorites.map((artifact) => (
                                <div
                                    key={artifact.artId}
                                    className="favorite-item"
                                    onClick={async () => {
                                        try {
                                            setArtifactLoading(true);
                                            // 작품 상세 정보 가져오기
                                            const response = await fetch(`${API_BASE_URL}/api/arts/${artifact.artId}`);
                                            if (!response.ok) {
                                                throw new Error(`HTTP error! status: ${response.status}`);
                                            }
                                            const artData = await response.json();
                                            setSelectedArtifact(artData);
                                            setIsModalOpen(true);
                                        } catch (err) {
                                            alert('작품 정보를 불러오는 중 오류가 발생했습니다.');
                                            // 에러 발생 시 기본 데이터 사용
                                            setSelectedArtifact(artifact);
                                            setIsModalOpen(true);
                                        } finally {
                                            setArtifactLoading(false);
                                        }
                                    }}
                                >
                                    <span className="favorite-text">
                                        {artifact.name || 'Unnamed Artifact'} - {artifact.artistName || 'Unknown'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="favorites-empty">
                            <p>관심목록이 비어있습니다.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="profile-box">
                <div className="profile-header">                    
                    <h1>User Profile</h1>
                </div>
                <div className="profile-info">
                    <div className="info-item">
                        <label>Name</label>
                        <p>{profileData?.name || 'Unknown'}</p>
                    </div>
                    <div className="info-item">
                        <label>Email</label>
                        <p>{profileData?.email || 'Unknown'}</p>
                    </div>
                    <div className="info-item">
                        <label>Birth Date</label>
                        <p>{formatBirthDate(profileData?.birthDate)}</p>
                    </div>
                    <div className="info-item">
                        <label>Member Since</label>
                        <p>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</p>
                    </div>
                </div>
                <div className="profile-actions">
                    <button 
                        className="change-password-button"
                        onClick={() => setShowPasswordModal(true)}
                    >
                        비밀번호 변경
                    </button>
                </div>
            </div>

            {showPasswordModal && (
                <div className="modal-overlay" onClick={handleClosePasswordModal}>
                    <div className="password-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleClosePasswordModal}>×</button>
                        <h2>비밀번호 변경</h2>
                        {passwordSuccess && (
                            <div className="success-message">
                                비밀번호가 성공적으로 변경되었습니다.
                            </div>
                        )}
                        {passwordError && (
                            <div className="error-message">{passwordError}</div>
                        )}
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label htmlFor="newPassword">새 비밀번호</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                                    required
                                    disabled={updating}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">비밀번호 확인</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="비밀번호를 다시 입력하세요"
                                    required
                                    disabled={updating}
                                />
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={handleClosePasswordModal}
                                    disabled={updating}
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={updating}
                                >
                                    {updating ? '변경 중...' : '변경'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 작품 상세 모달 */}
            {selectedArtifact && (
                <ArtifactModal
                    artifact={selectedArtifact}
                    isOpen={isModalOpen}
                    onClose={async () => {
                        setIsModalOpen(false);
                        setSelectedArtifact(null);
                        // 모달 닫을 때 관심목록 새로고침
                        if (user?.userId) {
                            try {
                                const favoritesData = await getFavorites(user.userId);
                                const artifacts = favoritesData.map(liked => ({
                                    artId: liked.artId,
                                    name: liked.artName,
                                    artistName: liked.artistName,
                                    galleryName: liked.galleryName,
                                    imageUrl: liked.imageUrl,
                                    genre: null,
                                    theme: null,
                                    age: null,
                                    display: null,
                                    artistId: null,
                                    galleryId: null
                                }));
                                setFavorites(artifacts);
                            } catch (err) {
                                // 에러 무시
                            }
                        }
                    }}
                />
            )}
        </div>
    );
}

