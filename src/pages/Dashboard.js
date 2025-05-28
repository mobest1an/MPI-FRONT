import { useState } from 'react';
import {
    Button,
    Container,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { joinQueue } from '../utils/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [queueStatus, setQueueStatus] = useState(null);
    const [error, setError] = useState(null);

    const handleJoinQueue = async () => {
        setLoading(true);
        setError(null);
        setQueueStatus(null);

        try {
            await joinQueue(localStorage.getItem('username'));
            setQueueStatus('success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join the queue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.username}!
                </Typography>

                {/* Кнопка добавления в очередь */}
                <Box sx={{ mt: 4, mb: 4 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleJoinQueue}
                        disabled={loading}
                        sx={{ minWidth: 200 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Join Queue'}
                    </Button>
                </Box>

                {/* Отображение статуса */}
                {queueStatus === 'success' && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        You have been successfully added to the queue!
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Кнопка выхода */}
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={logout}
                    sx={{ mt: 2 }}
                >
                    Logout
                </Button>
            </Box>
        </Container>
    );
};

export default Dashboard;
