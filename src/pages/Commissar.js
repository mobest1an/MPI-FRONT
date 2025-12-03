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
    addToEscortRoom,
    checkUserInEscortRoom
} from '../utils/api';

const Commissar = () => {
    const [queue, setQueue] = useState([]);
    const [summoned, setSummoned] = useState([]);
    const [userStatuses, setUserStatuses] = useState({}); // {username: boolean}
    const [loading, setLoading] = useState({
        queue: true,
        summoned: true,
        action: false,
        checks: false
    });
    const [error, setError] = useState(null);

    const fetchAllData = async () => {
        try {
            setLoading(prev => ({...prev, queue: true, summoned: true}));
            const [queueData, summonedData] = await Promise.all([
                getQueue(),
                getSummonedUsers()
            ]);
            setQueue(queueData);
            setSummoned(summonedData);
            setError(null);

            // Проверяем статус каждого пользователя
            checkUsersStatus(summonedData);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(prev => ({...prev, queue: false, summoned: false}));
        }
    };

    const checkUsersStatus = async (users) => {
        try {
            setLoading(prev => ({...prev, checks: true}));
            const statuses = {};

            // Параллельно проверяем статус всех пользователей
            await Promise.all(users.map(async (user) => {
                const isInRoom = await checkUserInEscortRoom(user.username);
                statuses[user.username] = isInRoom;
            }));

            setUserStatuses(statuses);
        } catch (err) {
            console.error('Ошибка проверки статуса:', err);
        } finally {
            setLoading(prev => ({...prev, checks: false}));
        }
    };

    const handleAddToEscort = async (username) => {
        try {
            setLoading(prev => ({...prev, action: true}));
            await addToEscortRoom(username);
            await fetchAllData(); // Обновляем данные после изменения
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при отправке');
        } finally {
            setLoading(prev => ({...prev, action: false}));
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

                {/* Таблица призывников с проверкой статуса */}
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
                                    summoned.map((user) => (
                                        <TableRow key={user.username}>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="contained"
                                                    color={userStatuses[user.username] ? "default" : "primary"}
                                                    onClick={() => handleAddToEscort(user.username)}
                                                    disabled={
                                                        loading.action ||
                                                        loading.checks ||
                                                        userStatuses[user.username] === true
                                                    }
                                                    sx={{
                                                        bgcolor: userStatuses[user.username] ? '#e0e0e0' : '',
                                                        '&:disabled': {
                                                            bgcolor: '#f5f5f5',
                                                            color: '#9e9e9e'
                                                        }
                                                    }}
                                                >
                                                    {userStatuses[user.username]
                                                        ? "Уже в комнате"
                                                        : "Отправить в комнату"}
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