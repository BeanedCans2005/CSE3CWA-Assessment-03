import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    
    // Don't redirect while we're still checking, that would bounce
    // a logged in user to /login on every page refresh.
    if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
    if (!user) return <Navigate to="/login" replace />;

    return children;
}