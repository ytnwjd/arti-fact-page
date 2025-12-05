import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // localStorage에서 로그인 정보 확인
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || '로그인에 실패했습니다.' };
            }

            // 응답 형식: { userId, email, name, birthDate }
            if (!data.userId) {
                return { success: false, message: '로그인 응답에 userId가 없습니다.' };
            }
        
            const userData = {
                userId: data.userId,
                email: data.email,
                name: data.name,
                birthDate: data.birthDate
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true };
        } catch (error) {
            return { success: false, message: '서버 연결에 실패했습니다. 다시 시도해주세요.' };
        }
    };

    const signup = async (name, email, password, birthDate) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    birthDate
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || '회원가입에 실패했습니다.' };
            }

            // API 응답에서 사용자 정보와 토큰 추출
            const userData = data.user || data.data || data;
            const token = data.token || data.accessToken;

            // 사용자 정보와 토큰 저장
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (token) {
                localStorage.setItem('token', token);
            }

            return { success: true };
        } catch (error) {
            return { success: false, message: '서버 연결에 실패했습니다. 다시 시도해주세요.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return React.createElement(
        AuthContext.Provider,
        { value: { user, login, signup, logout, loading } },
        children
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

