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
      <nav className="nav">
        <span className="brand">AI Capsule</span>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span className="user">Signed in as {user.username}</span>
            <button className="ghost" onClick={logout}>Log out</button>
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