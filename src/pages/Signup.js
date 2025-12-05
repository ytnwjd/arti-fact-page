import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !birthDate) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        const result = await signup(name, email, password, birthDate);
        if (result.success) {
            navigate('/profile');
        } else {
            setError(result.message);
        }
    };

    return React.createElement(
        'div',
        { className: 'signup-container' },
        React.createElement(
            'div',
            { className: 'signup-box' },
            React.createElement('h1', null, 'Sign Up'),
            error && React.createElement(
                'div',
                { className: 'error-message' },
                error
            ),
            React.createElement(
                'form',
                { className: 'signup-form', onSubmit: handleSubmit },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement('label', { htmlFor: 'name' }, 'Name'),
                    React.createElement('input', {
                        type: 'text',
                        id: 'name',
                        name: 'name',
                        placeholder: 'Enter your name',
                        value: name,
                        onChange: (e) => setName(e.target.value),
                        required: true
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement('label', { htmlFor: 'email' }, 'Email'),
                    React.createElement('input', {
                        type: 'email',
                        id: 'email',
                        name: 'email',
                        placeholder: 'Enter your email',
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        required: true
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement('label', { htmlFor: 'password' }, 'Password'),
                    React.createElement('input', {
                        type: 'password',
                        id: 'password',
                        name: 'password',
                        placeholder: 'Enter your password (min 6 characters)',
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        required: true
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement('label', { htmlFor: 'birthDate' }, 'Birth Date'),
                    React.createElement('input', {
                        type: 'date',
                        id: 'birthDate',
                        name: 'birthDate',
                        value: birthDate,
                        onChange: (e) => setBirthDate(e.target.value),
                        required: true
                    })
                ),
                React.createElement(
                    'button',
                    { type: 'submit', className: 'signup-button' },
                    'Sign Up'
                )
            ),
            React.createElement(
                'p',
                { className: 'login-link' },
                'Already have an account? ',
                React.createElement(Link, { to: '/login' }, 'Login')
            )
        )
    );
}

