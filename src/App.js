import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Recruit from './pages/Recruit';
import Commissar from './pages/Commissar';
import Escort from './pages/Escort';
import MilitaryPolice from './pages/MilitaryPolice';
import Complaint from './pages/Complaint';
import Unauthorized from './pages/Unauthorized';
import RoleRoute from './components/RoleRoute';
import { useAuth } from './context/AuthContext';
import { ROLES, getRedirectPath } from './constants/roles';

function App() {
    const { isAuthenticated, user, initialLoading } = useAuth();

    // Показываем загрузку пока проверяем авторизацию
    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Редирект для главной страницы
    const getHomeRedirect = () => {
        if (!isAuthenticated) {
            return <Navigate to="/login" />;
        }
        const redirectPath = getRedirectPath(user?.roles || []);
        return <Navigate to={redirectPath} />;
    };

    // Редирект для авторизованных пользователей на страницах логина/регистрации
    const getAuthPageElement = (element) => {
        if (isAuthenticated) {
            const redirectPath = getRedirectPath(user?.roles || []);
            return <Navigate to={redirectPath} />;
        }
        return element;
    };

    return (
        <div className="app">
            <Routes>
                <Route path="/login" element={getAuthPageElement(<Login />)} />
                <Route path="/register" element={getAuthPageElement(<Register />)} />
                <Route path="/complaint" element={<Complaint />} />
                <Route path="/" element={getHomeRedirect()} />
                <Route path="/recruit" element={
                    <RoleRoute roles={[ROLES.RECRUIT]}>
                        <Recruit />
                    </RoleRoute>
                } />
                <Route path="/commissar" element={
                    <RoleRoute roles={[ROLES.COMMISSAR]}>
                        <Commissar />
                    </RoleRoute>
                } />
                <Route path="/escort" element={
                    <RoleRoute roles={[ROLES.ESCORT]}>
                        <Escort />
                    </RoleRoute>
                } />
                <Route path="/military-police" element={
                    <RoleRoute roles={[ROLES.MILITARY_POLICE]}>
                        <MilitaryPolice />
                    </RoleRoute>
                } />
                <Route path="/unauthorized" element={<Unauthorized />} />
            </Routes>
        </div>
    );
}

export default App;
