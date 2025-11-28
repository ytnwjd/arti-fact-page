import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className='header'>
            <header className='headerObj'>
                <Link to="/" className='logo-link'>
                    <span className='logo'>ARTIFACT</span>
                </Link>
                <nav>
                    <div className='nav-buttons'>
                        {user ? (
                            <>
                                <Link to="/profile" className='nav-button'>Profile</Link>
                                <button className='nav-button' onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className='nav-button'>Login</Link>
                        )}
                    </div>
                </nav>
            </header>
        </div>
    );
}