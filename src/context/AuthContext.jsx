import { createContext, useContext, useState, useEffect } from 'react';

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

    const login = (email, password) => {
        // api 호출로 추후에 변경 필요
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
            const userData = { email: foundUser.email, name: foundUser.name };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        }
        return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    };

    const signup = (name, email, password) => {
       
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.find(u => u.email === email)) {
            return { success: false, message: '이미 존재하는 이메일입니다.' };
        }

        // 새 사용자 추가
        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // 자동 로그인
        const userData = { email, name };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

