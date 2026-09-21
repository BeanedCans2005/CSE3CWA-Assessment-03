import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        {user ? (
          <>
            <Link to="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
            <span style={{ marginRight: '1rem' }}>Signed in as {user.username}</span>
            <button onClick={logout}>Log out</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}