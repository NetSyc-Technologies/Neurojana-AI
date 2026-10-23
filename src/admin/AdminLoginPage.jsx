import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, ShieldAlert, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const { user, isAdmin, loginWithGoogle, logout, authorizedAdminEmails, authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
      navigate('/admin');
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in as authorized admin, redirect or provide enter button
  if (user && isAdmin) {
    return (
      <main id="main" className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'inline-flex', padding: '0.85rem', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', borderRadius: '50%', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Authenticated as Admin</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.98rem' }}>
              Signed in as <strong>{user.email}</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => navigate('/admin')} className="btn btn-primary">
                <span>Open Dashboard</span>
              </button>
              <button onClick={logout} className="btn btn-secondary">
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2.25rem',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
        }}>
          {/* Lock Icon */}
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            borderRadius: '50%',
            marginBottom: '1.25rem',
          }}>
            <Lock size={32} />
          </div>

          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>Admin Access Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Sign in with an authorized Google account to manage appointments, subscribers, content, and system settings.
          </p>

          {(errorMessage || authError) && (
            <div style={{
              padding: '0.9rem 1rem',
              background: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-error-text)',
              fontSize: '0.88rem',
              textAlign: 'left',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Authentication Rejected</strong>
                <div style={{ marginTop: '3px' }}>{errorMessage || authError}</div>
              </div>
            </div>
          )}

          {/* Google Sign In Only */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn btn-secondary btn-lg"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              border: '1px solid var(--border-muted)',
              fontWeight: 700,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying Google Identity...</span>
              </>
            ) : (
              <>
                {/* Google SVG Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Security & Allowlist Notice */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Authorized Admin Accounts:
            </div>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
              {authorizedAdminEmails.map((email) => (
                <li key={email}><code>{email}</code></li>
              ))}
            </ul>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              Non-allowlisted accounts are automatically denied access. Public visitors do not have access to administrative data.
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <ArrowLeft size={14} />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
