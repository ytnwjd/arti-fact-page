import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
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
            <div className="profile-box">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <span>{initial}</span>
                    </div>
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
        </div>
    );
}

