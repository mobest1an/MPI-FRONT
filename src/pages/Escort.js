import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    Box,
    CircularProgress,
    Alert,
    Paper,
    Checkbox,
    Chip
} from '@mui/material';
import { getWaitingRoom, getActiveConvoy, createConvoy, dismissConvoy, getConvoyComplaintsCount } from '../utils/api';
import Header from '../components/Header';

const Escort = () => {
    const [waitingRoom, setWaitingRoom] = useState([]);
    const [activeConvoy, setActiveConvoy] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [complaintsCount, setComplaintsCount] = useState(0);
    const [loading, setLoading] = useState({
        initial: true,
        action: false
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchData = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(prev => ({ ...prev, initial: true }));
            }

            // Проверяем, есть ли активный конвой
            const convoy = await getActiveConvoy();
            
            // Проверяем что convoy это объект с данными
            if (convoy && convoy.convoyId) {
                setActiveConvoy(convoy);
                setWaitingRoom([]);
                // Получаем количество жалоб на конвой
                const count = await getConvoyComplaintsCount();
                setComplaintsCount(count || 0);
            } else {
                setActiveConvoy(null);
                setComplaintsCount(0);
                const room = await getWaitingRoom();
                setWaitingRoom(room || []);
            }
        } catch (err) {
            if (isInitial) {
                setError(err.response?.data?.message || 'Ошибка при загрузке данных');
            }
        } finally {
            if (isInitial) {
                setLoading(prev => ({ ...prev, initial: false }));
            }
        }
    }, []);

    useEffect(() => {
        fetchData(true);
        const interval = setInterval(() => fetchData(false), 2000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleToggle = (summonId) => {
        setSelectedIds(prev => {
            if (prev.includes(summonId)) {
                return prev.filter(id => id !== summonId);
            } else {
                return [...prev, summonId];
            }
        });
    };

    const handleCreateConvoy = async () => {
        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);
            
            await createConvoy(selectedIds);
            setSelectedIds([]);
            setSuccess('Конвой успешно создан!');
            setTimeout(() => setSuccess(null), 3000);
            
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при создании конвоя');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const handleDismissConvoy = async () => {
        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);
            
            await dismissConvoy();
            setSuccess('Конвой распущен. Призывники доставлены!');
            setTimeout(() => setSuccess(null), 3000);
            
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при роспуске конвоя');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const renderWaitingRoom = () => (
        <>
            <Typography variant="h6" component="h2" gutterBottom>
                Зал ожидания конвоирования
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Выберите призывников для формирования конвоя
            </Typography>

            <Paper elevation={3} sx={{ maxHeight: 400, overflow: 'auto', mb: 3 }}>
                <List>
                    {waitingRoom.length > 0 ? (
                        waitingRoom.map((recruit) => (
                            <ListItem
                                id={`list-item-recruit-${recruit.summonId}`}
                                key={recruit.summonId}
                                dense
                                button
                                onClick={() => handleToggle(recruit.summonId)}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        id={`checkbox-recruit-${recruit.summonId}`}
                                        edge="start"
                                        checked={selectedIds.includes(recruit.summonId)}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={recruit.username}
                                    secondary={
                                        <Chip 
                                            label={recruit.militaryBranch} 
                                            size="small" 
                                            color="primary" 
                                            variant="outlined"
                                        />
                                    }
                                />
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="Зал ожидания пуст" />
                        </ListItem>
                    )}
                </List>
            </Paper>

            <Button
                id="btn-create-convoy"
                variant="contained"
                color="primary"
                onClick={handleCreateConvoy}
                disabled={loading.action || selectedIds.length === 0}
                fullWidth
                size="large"
            >
                {loading.action ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    `Собрать конвой (${selectedIds.length})`
                )}
            </Button>
        </>
    );

    const renderActiveConvoy = () => (
        <>
            <Typography variant="h6" component="h2" gutterBottom>
                Активный конвой
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Призывники в конвое. После доставки нажмите "Распустить конвой"
            </Typography>

            {complaintsCount > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    На ваш конвой подано жалоб: {complaintsCount}
                </Alert>
            )}

            <Paper elevation={3} sx={{ maxHeight: 400, overflow: 'auto', mb: 3 }}>
                <List>
                    {activeConvoy.recruits.map((recruit) => (
                        <ListItem key={recruit.summonId}>
                            <ListItemText 
                                primary={recruit.username}
                                secondary={
                                    <Chip 
                                        label={recruit.militaryBranch} 
                                        size="small" 
                                        color="success" 
                                        variant="outlined"
                                    />
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Button
                id="btn-dismiss-convoy"
                variant="contained"
                color="error"
                onClick={handleDismissConvoy}
                disabled={loading.action}
                fullWidth
                size="large"
            >
                {loading.action ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    'Распустить конвой'
                )}
            </Button>
        </>
    );

    return (
        <>
            <Header title="Управление конвоем" />
            <Container maxWidth="sm">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}

                    {loading.initial ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : activeConvoy ? (
                        renderActiveConvoy()
                    ) : (
                        renderWaitingRoom()
                    )}
                </Box>
            </Container>
        </>
    );
};

export default Escort;
