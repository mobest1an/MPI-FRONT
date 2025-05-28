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
    Alert
} from '@mui/material';
import { getQueue, removeFromQueue } from '../utils/api';

const Commissar = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const data = await getQueue();
            setQueue(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка загрузки очереди');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (username) => {
        try {
            await removeFromQueue(username);
            await fetchQueue(); // Обновляем список после удаления
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при вызове');
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                Очередь призыва
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell align="right">Действие</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {queue.length > 0 ? (
                                queue.map((item) => (
                                    <TableRow key={item.username}>
                                        <TableCell>{item.username}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleRemove(item.username)}
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

            <Button
                variant="contained"
                onClick={fetchQueue}
                sx={{ mt: 2 }}
            >
                Обновить очередь
            </Button>
        </Container>
    );
};

export default Commissar;
