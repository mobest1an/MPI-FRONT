import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const RoleRoute = ({ children, roles = [] }) => {
    const { user, isAuthenticated, initialLoading } = useAuth();
    const location = useLocation();

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Если роли не переданы, доступ разрешен всем авторизованным
    if (roles.length === 0) {
        return children;
    }

    // Проверяем наличие хотя бы одной из требуемых ролей
    const userRoles = user?.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default RoleRoute;
