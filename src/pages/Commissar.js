import React, { useState, useEffect } from 'react';
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
    Box
} from '@mui/material';
import {
    getQueue,
    removeFromQueue,
    getSummonedUsers,
    addToEscortRoom
} from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Commissar = () => {
    const [queue, setQueue] = useState([]);
    const [summoned, setSummoned] = useState([]);
    const [loading, setLoading] = useState({
        queue: true,
        summoned: true,
        action: false
    });
    const [error, setError] = useState(null);

    const fetchAllData = async () => {
        try {
            setLoading({ queue: true, summoned: true, action: false });
            const [queueData, summonedData] = await Promise.all([
                getQueue(),
                getSummonedUsers()
            ]);
            setQueue(queueData);
            setSummoned(summonedData);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка загрузки данных');
        } finally {
            setLoading({ queue: false, summoned: false, action: false });
        }
    };

    const handleRemove = async (username) => {
        try {
            setLoading(prev => ({...prev, action: true}));
            await removeFromQueue(username);
            await fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при вызове');
        }
    };

    const handleAddToEscort = async (username) => {
        try {
            setLoading(prev => ({...prev, action: true}));
            await addToEscortRoom(username);
            await fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при отправке');
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Панель комиссара
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={fetchAllData}
                    disabled={loading.action}
                    sx={{ mb: 2 }}
                >
                    Обновить данные
                </Button>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Таблица очереди */}
                <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                    Очередь призыва
                </Typography>
                {loading.queue ? (
                    <CircularProgress />
                ) : (
                    <TableContainer component={Paper} sx={{ mb: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Username</TableCell>
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
                                                    color="secondary"
                                                    onClick={() => handleRemove(item.username)}
                                                    disabled={loading.action}
                                                >
                                                    Призвать
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
                )}

                {/* Таблица призывников */}
                <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                    Призывники
                </Typography>
                {loading.summoned ? (
                    <CircularProgress />
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Username</TableCell>
                                    <TableCell align="right">Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {summoned.length > 0 ? (
                                    summoned.map((item) => (
                                        <TableRow key={item.username}>
                                            <TableCell component="th" scope="row">
                                                {item.username}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleAddToEscort(item.username)}
                                                    disabled={loading.action}
                                                >
                                                    Отправить в комнату
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            Нет призывников
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Container>
    );
};

export default Commissar;
