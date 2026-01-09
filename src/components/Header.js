import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const Header = ({ title, showUserInfo = true }) => {
    const { user, logout } = useAuth();

    return (
        <AppBar position="static" sx={{ mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.dark', py: 1, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ letterSpacing: 2 }}>
                    СОВРЕМЕННАЯ ЦИФРОВАЯ ПРИЗЫВАТЕЛЬНАЯ СИСТЕМА
                </Typography>
            </Box>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
                {showUserInfo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">
                            {user?.username}
                        </Typography>
                        <Button 
                            color="inherit" 
                            onClick={logout}
                            startIcon={<LogoutIcon />}
                        >
                            Выйти
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
