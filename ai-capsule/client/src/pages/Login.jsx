import React from 'react';

export default function Login() {
  const handleLogin = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <div className="page">
      <h1>Login</h1>
      <p>Sign in with GitHub to access your dashboard.</p>
      <button onClick={handleLogin}>Sign in with GitHub</button>
    </div>
  );
}