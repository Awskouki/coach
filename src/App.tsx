/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { SignUpRequest } from './utils/dataExport';
import {
  verifyPassword,
  ADMIN_PASSWORD_HASH,
  checkLoginAttempts,
  recordFailedLogin,
  resetLoginAttempts,
  checkSessionTimeout,
  clearSession,
  updateLastActivity,
  sanitizeInput,
  logSecurityEvent,
  createSessionToken,
  verifySessionToken,
  storeSession,
  getStoredToken,
} from './utils/security';

// Admin Login Page Component
function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already has a valid token
    const token = getStoredToken();
    if (token) {
      verifySessionToken(token).then(payload => {
        if (payload) navigate('/admin/dashboard', { replace: true });
      });
    }
    // Check if locked out
    const { allowed, lockedUntil } = checkLoginAttempts();
    if (!allowed && lockedUntil) {
      setIsLocked(true);
      setError(`Trop de tentatives. Réessayez après ${lockedUntil.toLocaleTimeString()}`);
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isLocked) return;

    const { allowed, remainingAttempts, lockedUntil } = checkLoginAttempts();
    if (!allowed) {
      setIsLocked(true);
      setError(`Trop de tentatives. Réessayez après ${lockedUntil?.toLocaleTimeString()}`);
      logSecurityEvent('LOGIN_BLOCKED');
      return;
    }

    setLoading(true);
    const sanitized = sanitizeInput(password);
    const isValid = await verifyPassword(sanitized, ADMIN_PASSWORD_HASH);
    setLoading(false);

    if (isValid) {
      resetLoginAttempts();
      updateLastActivity();
      const token = await createSessionToken();
      storeSession(token);
      logSecurityEvent('LOGIN_SUCCESS');
      navigate('/admin/dashboard', { replace: true });
    } else {
      recordFailedLogin();
      const check = checkLoginAttempts();
      if (check.allowed) {
        setError(`Mot de passe incorrect. ${check.remainingAttempts} tentative(s) restante(s).`);
      } else {
        setIsLocked(true);
        setError('Trop de tentatives. Bloqué 15 minutes.');
      }
      logSecurityEvent('LOGIN_FAILED', { remaining: check.remainingAttempts });
      setPassword('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', padding: 48, maxWidth: 400, width: '100%' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#d8482b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 20, height: 1, background: '#d8482b' }} />
            ACCÈS ADMIN
          </div>
          <h1 style={{ fontFamily: "'Anton', 'Bebas Neue', Impact, sans-serif", fontSize: 52, lineHeight: 0.9, color: '#f0ede8', textTransform: 'uppercase' }}>
            COACH<br />AYMEN
          </h1>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.4)', marginBottom: 8 }}>Mot de passe</div>
            <input
              type="password"
              placeholder="Entrez le mot de passe"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              disabled={isLocked}
              autoFocus
              style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0ede8', padding: '14px 16px', outline: 'none', width: '100%', opacity: isLocked ? 0.5 : 1 }}
            />
            {error && <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#d8482b', marginTop: 8 }}>{error}</p>}
          </div>
          <button type="submit" disabled={isLocked}
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', background: isLocked ? 'rgba(255,255,255,0.1)' : '#d8482b', color: '#fff', padding: 15, border: 'none', cursor: isLocked ? 'not-allowed' : 'pointer', width: '100%' }}>
            {isLocked ? 'VERROUILLÉ' : 'CONNEXION'}
          </button>
          <button type="button" onClick={() => navigate('/')}
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(240,237,232,0.4)', padding: 15, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', width: '100%' }}>
            Retour au Site
          </button>
        </form>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'rgba(240,237,232,0.25)', textAlign: 'center', letterSpacing: '0.1em' }}>
          SÉCURISÉ · TENTATIVES LIMITÉES · EXPIRATION SESSION
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [verified, setVerified] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    const check = async () => {
      const token = getStoredToken();
      if (!token) { setVerified(false); return; }

      // Check session timeout first (fast)
      if (checkSessionTimeout()) {
        clearSession();
        logSecurityEvent('SESSION_TIMEOUT');
        setVerified(false);
        return;
      }

      // Verify cryptographic signature
      const payload = await verifySessionToken(token);
      if (!payload) {
        clearSession();
        logSecurityEvent('SESSION_INVALID_TOKEN');
        setVerified(false);
        return;
      }

      setVerified(true);
    };
    check();
  }, []);

  // Update activity on any interaction
  useEffect(() => {
    if (!verified) return;
    const handler = () => updateLastActivity();
    window.addEventListener('mousedown', handler);
    window.addEventListener('keydown', handler);
    window.addEventListener('touchstart', handler);
    window.addEventListener('scroll', handler);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('scroll', handler);
    };
  }, [verified]);

  if (verified === null) {
    // Still checking — show nothing briefly (avoids flash)
    return null;
  }

  if (!verified) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Admin Dashboard Wrapper
function AdminDashboardWrapper() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    logSecurityEvent('LOGOUT');
    navigate('/admin', { replace: true });
  };

  return <AdminDashboard onLogout={handleLogout} />;
}

// Landing Page Wrapper
function LandingPageWrapper() {
  const [signUpRequests, setSignUpRequests] = useLocalStorage<SignUpRequest[]>('signup_requests', []);

  const handleSignUp = (data: Omit<SignUpRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newRequest: SignUpRequest = {
      id: Math.random().toString(36).slice(2, 11),
      ...data,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    setSignUpRequests([newRequest, ...signUpRequests]);
  };

  return <LandingPage onSignUp={handleSignUp} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPageWrapper />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboardWrapper />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}





