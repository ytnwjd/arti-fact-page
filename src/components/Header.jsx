import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
    return (
        <div className='header'>
            <header className='headerObj'>
                <Link to="/" className='logo-link'>
                    <span className='logo'>ARTIFACT</span>
                </Link>
                <nav>
                    <div className='nav-buttons'>
                        <Link to="/login" className='nav-button'>Login</Link>
                        <Link to="/profile" className='nav-button'>Profile</Link>
                    </div>
                </nav>
            </header>
        </div>
    );
}