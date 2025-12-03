import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Пытаемся прочитать данные из localStorage при инициализации
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const login = async (credentials) => {
        setLoading(true);
        try {
            const { token, user: userData } = await loginUser(credentials);
            const user = { token, username: credentials.username };

            // Сохраняем данные в localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);

            setUser(user);
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
        // Очищаем localStorage при выходе
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    // Проверяем токен при загрузке приложения
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !user) {
            // Здесь можно добавить проверку токена на бэкенде
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            error,
            loading,
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