import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatLayout from './pages/ChatLayout';
import { useAuthStore } from './store/authStore';
import './index.css';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/*" element={user ? <ChatLayout /> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;
