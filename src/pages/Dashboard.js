import React, { useState, useEffect } from 'react';
import {
    Button,
    Container,
    Typography,
    Box,
    Alert,
    Card,
    CardContent,
    CircularProgress,
    Fade, // Добавляем компонент для плавных переходов
    Slide // Добавляем для плавного появления/исчезания
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
    const [prevStatus, setPrevStatus] = useState(null); // Для плавного перехода

    const checkStatus = async () => {
        if (!user?.username) return;

        try {
            setLoading(prev => ({...prev, status: true}));
            const isReady = await checkCommissarReady(user.username);

            // Плавное обновление статуса
            setPrevStatus(commissarReady);
            setTimeout(() => {
                setCommissarReady(isReady);
                setPrevStatus(null);
            }, 300);

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
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [user?.username]);

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Личный кабинет
                </Typography>

                {/* Статус комиссара с плавными переходами */}
                <Card variant="outlined" sx={{ position: 'relative', minHeight: 120 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Статус комиссара:
                        </Typography>

                        {loading.status ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : error ? (
                            <Slide in={!!error} direction="down">
                                <Alert severity="error">{error}</Alert>
                            </Slide>
                        ) : (
                            <Box sx={{ position: 'relative', height: 60 }}>
                                {/* Старый статус (исчезает) */}
                                {prevStatus !== null && (
                                    <Fade in={prevStatus !== null} timeout={300}>
                                        <Box sx={{ position: 'absolute', width: '100%' }}>
                                            <Alert
                                                severity={prevStatus ? "success" : "warning"}
                                                sx={{ transition: 'opacity 0.3s ease' }}
                                            >
                                                {prevStatus
                                                    ? "Комиссар готов вас принять"
                                                    : "Комиссар занят, ожидайте"}
                                            </Alert>
                                        </Box>
                                    </Fade>
                                )}

                                {/* Новый статус (появляется) */}
                                <Fade in={commissarReady !== null && prevStatus === null} timeout={300}>
                                    <Box sx={{ position: 'absolute', width: '100%' }}>
                                        <Alert
                                            severity={commissarReady ? "success" : "warning"}
                                            sx={{
                                                transition: 'opacity 0.3s ease',
                                                opacity: prevStatus === null ? 1 : 0
                                            }}
                                        >
                                            {commissarReady
                                                ? "Комиссар готов вас принять"
                                                : "Комиссар занят, ожидайте"}
                                        </Alert>
                                    </Box>
                                </Fade>
                            </Box>
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