import React from 'react';

export default function Login() {
  const handleLogin = () => {
    // Full page redirect (not fetch) — hands control to Express,
    // which redirects on to GitHub's OAuth authorize URL.
    window.location.href = '/api/auth/github';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login</h1>
      <p>Sign in with GitHub to access your dashboard.</p>
      <button onClick={handleLogin}>Sign in with GitHub</button>
    </div>
  );
}