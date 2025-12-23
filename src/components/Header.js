import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
    const { user, logout } = useAuth();

    return (
        <AppBar position="static" sx={{ mb: 3 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
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
            </Toolbar>
        </AppBar>
    );
};

export default Header;
