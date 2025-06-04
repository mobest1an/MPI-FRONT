import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Commissar from './pages/Commissar';
import PrivateRoute from './components/PrivateRoute';
import Escort from './pages/Escort';

function App() {
    return (
        <div className="app">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/commissar" element={<PrivateRoute><Commissar /></PrivateRoute>} />
                <Route path="/escort" element={<PrivateRoute><Escort /></PrivateRoute>} />
            </Routes>
        </div>
    );
}

export default App;