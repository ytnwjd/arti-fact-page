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
            </div>
        </div>
    );
}

