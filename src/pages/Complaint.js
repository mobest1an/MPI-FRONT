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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getActiveConvoys, submitComplaint } from '../utils/api';
import Header from '../components/Header';

const Complaint = () => {
    const navigate = useNavigate();
    const [convoys, setConvoys] = useState([]);
    const [selectedConvoy, setSelectedConvoy] = useState('');
    const [loading, setLoading] = useState({
        initial: true,
        submit: false
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchConvoys = async () => {
            try {
                const data = await getActiveConvoys();
                setConvoys(data || []);
            } catch (err) {
                setError('Ошибка загрузки списка конвоев');
            } finally {
                setLoading(prev => ({ ...prev, initial: false }));
            }
        };

        fetchConvoys();
    }, []);

    const handleSubmit = async () => {
        if (!selectedConvoy) return;

        try {
            setLoading(prev => ({ ...prev, submit: true }));
            setError(null);
            await submitComplaint(selectedConvoy);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при подаче жалобы');
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    const handleBack = () => {
        navigate('/login');
    };

    if (success) {
        return (
            <>
                <Header title="Подача жалобы" showUserInfo={false} />
                <Container maxWidth="sm">
                    <Box sx={{ mt: 4 }}>
                        <Alert severity="success">
                            Жалоба успешно подана! Вы будете перенаправлены на страницу входа...
                        </Alert>
                    </Box>
                </Container>
            </>
        );
    }

    return (
        <>
            <Header title="Подача жалобы" showUserInfo={false} />
            <Container maxWidth="sm">
                <Box sx={{ mt: 4 }}>
                    <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Подать жалобу на конвой
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {loading.initial ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : convoys.length === 0 ? (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Нет активных конвоев для подачи жалобы
                            </Alert>
                        ) : (
                            <>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel id="convoy-select-label">Выберите конвой</InputLabel>
                                    <Select
                                        id="select-convoy"
                                        labelId="convoy-select-label"
                                        value={selectedConvoy}
                                        label="Выберите конвой"
                                        onChange={(e) => setSelectedConvoy(e.target.value)}
                                    >
                                        {convoys.map((convoy) => (
                                            <MenuItem key={convoy.convoyId} value={convoy.convoyId}>
                                                Конвой #{convoy.convoyId} (конвоир: {convoy.escortUsername})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button
                                    id="btn-submit-complaint"
                                    variant="contained"
                                    color="error"
                                    onClick={handleSubmit}
                                    disabled={loading.submit || !selectedConvoy}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    {loading.submit ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Подать жалобу'
                                    )}
                                </Button>
                            </>
                        )}

                        <Button
                            id="btn-back-to-login"
                            variant="outlined"
                            onClick={handleBack}
                            fullWidth
                        >
                            Вернуться на страницу входа
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </Container>
        </>
    );
};

export default Complaint;
