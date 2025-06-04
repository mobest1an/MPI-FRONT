import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Box,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getEscortRoomUsers, createConvoy } from '../utils/api';

const Escort = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState({
        users: true,
        convoy: false
    });
    const [error, setError] = useState(null);
    const [convoyCreated, setConvoyCreated] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(prev => ({...prev, users: true}));
                const response = await getEscortRoomUsers();
                setUsers(response);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка при загрузке списка');
            } finally {
                setLoading(prev => ({...prev, users: false}));
            }
        };

        fetchUsers();
    }, []);

    const handleCreateConvoy = async () => {
        try {
            setLoading(prev => ({...prev, convoy: true}));
            await createConvoy();
            setConvoyCreated(true);
            setError(null);
            setTimeout(() => setConvoyCreated(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при создании конвоя');
        } finally {
            setLoading(prev => ({...prev, convoy: false}));
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Управление конвоем
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="h6" component="h2">
                    Список доступных пользователей:
                </Typography>

                {loading.users ? (
                    <CircularProgress />
                ) : (
                    <Paper elevation={3} sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <List>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <ListItem key={user.username}>
                                        <ListItemText primary={user.username} />
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText primary="Нет доступных пользователей" />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                )}

                <Box sx={{ mt: 4 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateConvoy}
                        disabled={loading.users || loading.convoy}
                        fullWidth
                        size="large"
                    >
                        {loading.convoy ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Создать конвой'
                        )}
                    </Button>
                </Box>

                {convoyCreated && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Конвой успешно создан!
                    </Alert>
                )}

                <Button
                    variant="outlined"
                    onClick={logout}
                    sx={{ mt: 4, alignSelf: 'flex-start' }}
                >
                    Выйти
                </Button>
            </Box>
        </Container>
    );
};

export default Escort;
