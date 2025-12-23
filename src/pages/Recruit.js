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
    Fade,
    Skeleton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { checkCommissarReady, joinQueue } from '../utils/api';
import Header from '../components/Header';

const Recruit = () => {
    const { user } = useAuth();
    const [commissarReady, setCommissarReady] = useState(null);
    const [inQueue, setInQueue] = useState(false);
    const [loading, setLoading] = useState({
        queue: false
    });
    const [error, setError] = useState(null);

    const updateStatusIfChanged = async () => {
        if (!user?.username) return;

        try {
            const isCommissarReady = await checkCommissarReady(user?.username);
            if (isCommissarReady !== commissarReady) {
                setCommissarReady(isCommissarReady)
            }
        } catch (err) {
            setCommissarReady(null)
            setError('Ошибка проверки статуса');
        }
    }

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

    // Запускаем проверку статуса при загрузке и каждые 5 секунд
    useEffect(() => {
        updateStatusIfChanged();
        const interval = setInterval(updateStatusIfChanged, 5000);
        return () => clearInterval(interval);
    }, [user?.username]);

    return (
        <>
            <Header title="Кабинет призывника" />
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Статус комиссара с плавными переходами */}
                    <Card variant="outlined" sx={{ position: 'relative', minHeight: 120 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Статус комиссара:
                            </Typography>

                            {error !== null ? (
                                <Alert severity="error">{error}</Alert>
                            ) : (
                                <Box sx={{ position: 'relative', height: 60 }}>
                                    {commissarReady !== null ? (
                                        <Fade in={true} timeout={300}>
                                            <Box sx={{ position: 'absolute', width: '100%' }}>
                                                <Alert
                                                    severity={commissarReady ? "success" : "warning"}
                                                    sx={{ transition: 'opacity 0.3s ease' }}
                                                >
                                                    {commissarReady
                                                        ? "Комиссар готов вас принять"
                                                        : "Комиссар занят, ожидайте"}
                                                </Alert>
                                            </Box>
                                        </Fade>
                                    ) : <Skeleton height={65} />}
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
                </Box>
            </Container>
        </>
    );
};

export default Recruit;
