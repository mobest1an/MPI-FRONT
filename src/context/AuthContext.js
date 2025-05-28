import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Здесь можно добавить запрос для проверки токена
            // Пока просто устанавливаем флаг аутентификации
            setUser({ token });
        }
        setInitialLoading(false);
    }, []);

    // Обновляем начальное состояние, чтобы сохранять username
    const login = async (credentials) => {
        setLoading(true);
        try {
            const { token } = await loginUser(credentials);
            localStorage.setItem('token', token);
            setUser({ token, username: credentials.username }); // Сохраняем username
            navigate('/');
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            await registerUser(userData);
            navigate('/login');
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            error,
            loading,
            initialLoading,
            login,
            register,
            logout,
            isAuthenticated: !!user?.token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
