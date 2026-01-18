import React, { useState, useEffect, useCallback } from 'react';
import {
    Button,
    Container,
    Typography,
    Box,
    Alert,
    Card,
    CardContent,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip
} from '@mui/material';
import {
    getComplaints,
    getActiveComplaint,
    takeComplaint,
    completeComplaint,
    cancelComplaint
} from '../utils/api';
import Header from '../components/Header';

const MilitaryPolice = () => {
    const [complaints, setComplaints] = useState([]);
    const [activeComplaint, setActiveComplaint] = useState(null);
    const [loading, setLoading] = useState({
        initial: true,
        action: false
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [complaintsData, activeData] = await Promise.all([
                getComplaints(),
                getActiveComplaint()
            ]);
            setComplaints(complaintsData || []);
            setActiveComplaint(activeData);
        } catch (err) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(prev => ({ ...prev, initial: false }));
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleTakeComplaint = async (convoyId) => {
        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);
            await takeComplaint(convoyId);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при взятии жалобы в работу');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const handleCompleteComplaint = async () => {
        if (!activeComplaint) return;

        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);
            await completeComplaint(activeComplaint.convoyId);
            setSuccess('Жалоба успешно выполнена');
            setTimeout(() => setSuccess(null), 3000);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при выполнении жалобы');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    const handleCancelComplaint = async () => {
        if (!activeComplaint) return;

        try {
            setLoading(prev => ({ ...prev, action: true }));
            setError(null);
            await cancelComplaint(activeComplaint.convoyId);
            setSuccess('Жалоба отменена');
            setTimeout(() => setSuccess(null), 3000);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при отмене жалобы');
        } finally {
            setLoading(prev => ({ ...prev, action: false }));
        }
    };

    // Отображение активной жалобы на весь экран
    const renderActiveComplaint = () => {
        if (!activeComplaint) return null;

        return (
            <Card variant="outlined" sx={{ borderColor: 'primary.main', borderWidth: 2 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom color="primary.main">
                        Активная жалоба
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" color="primary.main">
                            Конвой #{activeComplaint.convoyId}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Конвоир:</strong> {activeComplaint.escortUsername}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Количество жалоб:</strong> {activeComplaint.complaintsCount}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            <strong>Призывники в конвое:</strong>
                        </Typography>
                        <Box sx={{ ml: 2 }}>
                            {activeComplaint.recruitUsernames.map((username, index) => (
                                <Typography key={index} variant="body2">
                                    • {username}
                                </Typography>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            id="btn-complete-complaint"
                            variant="contained"
                            color="primary"
                            onClick={handleCompleteComplaint}
                            disabled={loading.action}
                            sx={{ flex: 1 }}
                        >
                            {loading.action ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Выполнено'
                            )}
                        </Button>
                        <Button
                            id="btn-cancel-complaint"
                            variant="outlined"
                            color="error"
                            onClick={handleCancelComplaint}
                            disabled={loading.action}
                        >
                            Отменить
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    // Отображение списка жалоб
    const renderComplaintsList = () => {
        if (activeComplaint) return null;

        return (
            <>
                <Typography variant="h5" gutterBottom>
                    Жалобы на конвои
                </Typography>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Конвой</TableCell>
                                <TableCell>Конвоир</TableCell>
                                <TableCell>Количество жалоб</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {complaints.length > 0 ? (
                                complaints.map((complaint) => (
                                    <TableRow key={complaint.convoyId}>
                                        <TableCell>#{complaint.convoyId}</TableCell>
                                        <TableCell>{complaint.escortUsername}</TableCell>
                                        <TableCell>{complaint.complaintsCount}</TableCell>
                                        <TableCell>
                                            {complaint.takenByOther ? (
                                                <Chip label="Взята в работу" color="warning" size="small" />
                                            ) : (
                                                <Chip label="Новая" color="error" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                id={`btn-take-complaint-${complaint.convoyId}`}
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleTakeComplaint(complaint.convoyId)}
                                                disabled={loading.action || complaint.takenByOther}
                                                size="small"
                                            >
                                                Взять в работу
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Нет жалоб
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    return (
        <>
            <Header title="Военная полиция" />
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

                    {loading.initial ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {renderActiveComplaint()}
                            {renderComplaintsList()}
                        </>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default MilitaryPolice;
