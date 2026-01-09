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
import { checkCommissarReady, joinQueue, leaveQueue, getRecruitStatus } from '../utils/api';
import Header from '../components/Header';

// Маппинг статусов на отображаемые сообщения
const STATUS_MESSAGES = {
    NOT_STARTED: { text: 'Вы не в очереди', severity: 'info' },
    IN_QUEUE: { text: 'Вы в очереди, ожидайте вызова', severity: 'info' },
    SUMMONED: { text: 'Вас вызвал комиссар', severity: 'success' },
    WAITING_ESCORT: { text: 'Ожидает конвоирования', severity: 'warning' },
    IN_CONVOY: { text: 'Конвоируется', severity: 'warning' },
    DONE: { text: 'Доставлен в часть', severity: 'success' }
};

const Recruit = () => {
    const { user } = useAuth();
    const [commissarReady, setCommissarReady] = useState(null);
    const [recruitStatus, setRecruitStatus] = useState(null); // { status, militaryBranch }
    const [loading, setLoading] = useState({
        queue: false,
        leave: false
    });
    const [error, setError] = useState(null);

    // Загрузка статуса призывника
    const loadRecruitStatus = async () => {
        if (!user?.username) return;

        try {
            const statusData = await getRecruitStatus();
            setRecruitStatus(statusData);
        } catch (err) {
            setError('Ошибка загрузки статуса');
        }
    };

    // Проверка статуса комиссара (только если призывник в очереди)
    const updateCommissarStatus = async () => {
        if (!user?.username || recruitStatus?.status !== 'IN_QUEUE') {
            setCommissarReady(null);
            return;
        }

        try {
            const isCommissarReady = await checkCommissarReady(user?.username);
            if (isCommissarReady !== commissarReady) {
                setCommissarReady(isCommissarReady);
            }
        } catch (err) {
            setCommissarReady(null);
        }
    };

    // Добавление в очередь
    const handleJoinQueue = async () => {
        try {
            setLoading(prev => ({...prev, queue: true}));
            await joinQueue(user.username);
            await loadRecruitStatus();
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при добавлении в очередь');
        } finally {
            setLoading(prev => ({...prev, queue: false}));
        }
    };

    // Выход из очереди
    const handleLeaveQueue = async () => {
        try {
            setLoading(prev => ({...prev, leave: true}));
            await leaveQueue();
            await loadRecruitStatus();
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при выходе из очереди');
        } finally {
            setLoading(prev => ({...prev, leave: false}));
        }
    };

    // Загружаем статус при монтировании и каждые 5 секунд
    useEffect(() => {
        loadRecruitStatus();
        const interval = setInterval(loadRecruitStatus, 5000);
        return () => clearInterval(interval);
    }, [user?.username]);

    // Обновляем статус комиссара когда меняется статус призывника
    useEffect(() => {
        updateCommissarStatus();
        if (recruitStatus?.status === 'IN_QUEUE') {
            const interval = setInterval(updateCommissarStatus, 5000);
            return () => clearInterval(interval);
        }
    }, [recruitStatus?.status, user?.username]);

    // Определяем, можно ли показывать кнопку очереди
    const canShowQueueButton = recruitStatus?.status === 'NOT_STARTED' || recruitStatus?.status === 'IN_QUEUE';
    const isInQueue = recruitStatus?.status === 'IN_QUEUE';

    // Определяем, показывать ли род войск
    const showMilitaryBranch = recruitStatus?.militaryBranch && 
        ['WAITING_ESCORT', 'IN_CONVOY', 'DONE'].includes(recruitStatus?.status);

    const statusInfo = recruitStatus?.status ? STATUS_MESSAGES[recruitStatus.status] : null;

    return (
        <>
            <Header title="Кабинет призывника" />
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Статус призывника */}
                    <Card variant="outlined" sx={{ position: 'relative', minHeight: 120 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Ваш статус:
                            </Typography>

                            {error !== null ? (
                                <Alert severity="error">{error}</Alert>
                            ) : (
                                <Box sx={{ position: 'relative', minHeight: 60 }}>
                                    {statusInfo ? (
                                        <Fade in={true} timeout={300}>
                                            <Box>
                                                <Alert severity={statusInfo.severity}>
                                                    {statusInfo.text}
                                                </Alert>
                                                {showMilitaryBranch && (
                                                    <Typography variant="body1" sx={{ mt: 2 }}>
                                                        <strong>Род войск:</strong> {recruitStatus.militaryBranch}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Fade>
                                    ) : <Skeleton height={65} />}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Статус комиссара - только когда призывник в очереди */}
                    {isInQueue && (
                        <Card variant="outlined" sx={{ position: 'relative', minHeight: 120 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Статус комиссара:
                                </Typography>

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
                            </CardContent>
                        </Card>
                    )}

                    {/* Кнопка очереди - только для NOT_STARTED и IN_QUEUE */}
                    {canShowQueueButton && (
                        <Box>
                            {isInQueue ? (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleLeaveQueue}
                                    disabled={loading.leave}
                                >
                                    {loading.leave ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        "Выйти из очереди"
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleJoinQueue}
                                    disabled={loading.queue}
                                >
                                    {loading.queue ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        "Встать в очередь"
                                    )}
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default Recruit;
