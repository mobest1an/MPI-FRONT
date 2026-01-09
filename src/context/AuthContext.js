import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../utils/api';
import { getRedirectPath } from '../constants/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Пытаемся прочитать данные из localStorage при инициализации
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();

    const login = async (credentials) => {
        setLoading(true);
        try {
            const { token, roles } = await loginUser(credentials);
            const rolesArray = Array.isArray(roles) ? roles : Array.from(roles || []);
            const user = { token, username: credentials.username, roles: rolesArray };

            // Сохраняем данные в localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);

            setUser(user);

            // Редирект на страницу согласно роли пользователя
            const redirectPath = getRedirectPath(rolesArray);
            navigate(redirectPath);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка входа');
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
            setError(err.response?.data?.message || 'Ошибка регистрации');
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
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setInitialLoading(false);
    }, []);

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
