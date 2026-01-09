import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    getQueue,
    summonRecruit,
    getCurrentSummoned,
    sendToWaitingRoom,
    rejectRecruit
} from '../utils/api';
import Header from '../components/Header';

const MILITARY_BRANCHES = [
    'Пехота',
    'Танковые войска',
    'Артиллерия',
    'Военно-воздушные силы',
    'Военно-морские силы'
];

const Commissar = () => {
    const [queue, setQueue] = useState([]);
    const [currentRecruit, setCurrentRecruit] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [loading, setLoading] = useState({
        initial: true,
        action: false
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, initial: true }));
            setError(null);

            const [queueData, summonedData] = await Promise.all([
                getQueue(),
                getCurrentSummoned()
            ]);

            setQueue(queueData || []);
            // Проверяем что summonedData это объект с данными, а не null/undefined/пустая строка
            setCurrentRecruit(summonedData && summonedData.username ? summonedData : null);
            
            if (!summonedData || !summonedData.username) {
                setSelectedBranch('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(prev => ({ ...prev, initial: false }));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSummon = async (username) => {
        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);

            await summonRecruit(username);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при вызове призывника');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const handleSendToWaitingRoom = async () => {
        if (!currentRecruit || !selectedBranch) return;

        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);

            await sendToWaitingRoom(currentRecruit.username, selectedBranch);
            setSuccess(`${currentRecruit.username} отправлен в зал ожидания`);
            setTimeout(() => setSuccess(null), 3000);
            setSelectedBranch('');
            
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при отправке в зал ожидания');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const handleRejectRecruit = async () => {
        if (!currentRecruit) return;

        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);

            await rejectRecruit(currentRecruit.username);
            setSuccess(`${currentRecruit.username} возвращён в начало`);
            setTimeout(() => setSuccess(null), 3000);
            setSelectedBranch('');
            
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при отклонении призывника');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    // Проверка есть ли вызванный призывник
    const hasSummoned = currentRecruit !== null;

    const renderCurrentRecruit = () => {
        if (!hasSummoned) return null;

        return (
            <Card variant="outlined" sx={{ mb: 4, borderColor: 'primary.main', borderWidth: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary.main">
                        Текущий призывник
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2 }} color="primary.main">
                        {currentRecruit.username}
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="branch-select-label">Род войск</InputLabel>
                        <Select
                            labelId="branch-select-label"
                            value={selectedBranch}
                            label="Род войск"
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            {MILITARY_BRANCHES.map((branch) => (
                                <MenuItem key={branch} value={branch}>
                                    {branch}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendToWaitingRoom}
                            disabled={loading.action || !selectedBranch}
                            sx={{ flex: 1 }}
                        >
                            {loading.action ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Отправить в зал ожидания'
                            )}
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleRejectRecruit}
                            disabled={loading.action}
                        >
                            Отклонить
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Header title="Панель комиссара" />
            <Container maxWidth="lg">
                <Box sx={{ mb: 4 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}

                    <Button
                        variant="outlined"
                        onClick={fetchData}
                        disabled={loading.initial || loading.action}
                        sx={{ mb: 3 }}
                    >
                        Обновить данные
                    </Button>

                    {loading.initial ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {renderCurrentRecruit()}

                            <Typography variant="h5" gutterBottom>
                                Очередь призыва
                            </Typography>

                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Имя пользователя</TableCell>
                                            <TableCell align="right">Действия</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {queue.length > 0 ? (
                                            queue.map((item) => (
                                                <TableRow key={item.username}>
                                                    <TableCell component="th" scope="row">
                                                        {item.username}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => handleSummon(item.username)}
                                                            disabled={loading.action || hasSummoned}
                                                        >
                                                            Вызвать
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    Очередь пуста
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default Commissar;
