import React, { useState, useEffect } from 'react';
import {
    Button,
    Container,
    Typography,
    Box,
    Alert,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { checkCommissarReady, joinQueue } from '../utils/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [commissarReady, setCommissarReady] = useState(null);
    const [inQueue, setInQueue] = useState(false);
    const [loading, setLoading] = useState({
        status: false,
        queue: false
    });
    const [error, setError] = useState(null);

    // Проверка статуса комиссара
    const checkStatus = async () => {
        if (!user?.username) return;

        try {
            setLoading(prev => ({...prev, status: true}));
            const isReady = await checkCommissarReady(user.username);
            setCommissarReady(isReady);
            setError(null);
        } catch (err) {
            setError('Ошибка проверки статуса');
        } finally {
            setLoading(prev => ({...prev, status: false}));
        }
    };

    // Добавление в очередь
    const handleJoinQueue = async () => {
        try {
            setLoading(prev => ({...prev, queue: true}));
            await joinQueue(user.username);
            setInQueue(true);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при добавлении в очередь');
        } finally {
            setLoading(prev => ({...prev, queue: false}));
        }
    };

    // Запускаем проверку статуса при загрузке и каждые 3 секунды
    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, [user?.username]);

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Личный кабинет
                </Typography>

                {/* Статус комиссара */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Статус комиссара:
                        </Typography>
                        {loading.status ? (
                            <CircularProgress size={24} />
                        ) : error ? (
                            <Alert severity="error">{error}</Alert>
                        ) : (
                            <Alert
                                severity={commissarReady ? "success" : "warning"}
                                sx={{ mt: 1 }}
                            >
                                {commissarReady
                                    ? "Комиссар готов вас принять"
                                    : "Комиссар занят, ожидайте"}
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Кнопка добавления в очередь */}
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleJoinQueue}
                        disabled={loading.queue || inQueue}
                        sx={{ mt: 2, mb: 2 }}
                    >
                        {loading.queue ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : inQueue ? (
                            "Вы в очереди"
                        ) : (
                            "Встать в очередь"
                        )}
                    </Button>
                </Box>

                {/* Кнопка выхода */}
                <Button
                    variant="outlined"
                    onClick={logout}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Выйти
                </Button>
            </Box>
        </Container>
    );
};

export default Dashboard;