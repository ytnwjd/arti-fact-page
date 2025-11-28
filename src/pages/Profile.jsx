import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-box">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

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
                        <p>{user.name}</p>
                    </div>
                    <div className="info-item">
                        <label>Email</label>
                        <p>{user.email}</p>
                    </div>
                    <div className="info-item">
                        <label>Member Since</label>
                        <p>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</p>
                    </div>
                </div>
                <button className="edit-button">Edit Profile</button>
            </div>
        </div>
    );
}

