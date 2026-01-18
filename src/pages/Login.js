import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField,
    Button,
    Container,
    Box,
    Typography,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Header from '../components/Header';

const Login = () => {
    const { login, error, loading } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Имя пользователя обязательно'),
            password: Yup.string().required('Пароль обязателен'),
        }),
        onSubmit: async (values) => {
            try {
                await login(values);
            } catch (error) {
                // Ошибка обрабатывается в AuthContext
            }
        },
    });

    return (
        <>
            <Header title="Вход в систему" showUserInfo={false} />
            <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 4, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Вход
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Имя пользователя"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Пароль"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <Button
                        id="btn-login-submit"
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Button id="btn-go-to-register" onClick={() => navigate('/register')} variant="text" size="small">
                            Нет аккаунта? Зарегистрироваться
                        </Button>
                    </Box>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button 
                            id="btn-go-to-complaint"
                            onClick={() => navigate('/complaint')} 
                            variant="outlined" 
                            color="error"
                            size="small"
                        >
                            Подать жалобу на конвой
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
        </>
    );
};

export default Login;
