import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Доступ запрещен
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    У вас нет прав для просмотра этой страницы.
                </Typography>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Назад
                </Button>
            </Box>
        </Container>
    );
};

export default Unauthorized;
