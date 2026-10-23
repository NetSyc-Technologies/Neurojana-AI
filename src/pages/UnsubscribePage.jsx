import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { unsubscribeEmail } from '../services/db.js';
import { CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const urlEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(urlEmail);
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setError('');

    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      await unsubscribeEmail(clean);
      setUnsubscribed(true);
    } catch (err) {
      setError(err?.message || 'Could not process opt-out. Please write to contact@neurojanaai.com.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main" className="section">
      <div className="container" style={{ maxWidth: '560px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '3.5rem 2.5rem', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
          {unsubscribed ? (
            <div>
              <div style={{ display: 'inline-flex', padding: '0.85rem', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', borderRadius: '50%', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={36} />
              </div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>You Have Been Unsubscribed</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                We have removed <strong>{email}</strong> from all marketing and newsletter dispatches. You will no longer receive periodic updates from Neurojana AI.
              </p>
              <Link to="/" className="btn btn-secondary">
                <ArrowLeft size={16} />
                <span>Return to Homepage</span>
              </Link>
            </div>
          ) : (
            <div>
              <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
                <span>NEWSLETTER PREFERENCES</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Opt Out of Updates</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Enter your email address below to immediately unsubscribe from Neurojana AI marketing and launch announcements.
              </p>

              {error && (
                <div style={{ padding: '0.85rem', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', borderRadius: 'var(--radius-md)', color: 'var(--status-error-text)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleUnsubscribe} noValidate>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your-email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.75rem' }}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing Opt-out...</span>
                    </>
                  ) : (
                    <span>Confirm Unsubscribe</span>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Need assistance? Contact us at <a href="mailto:contact@neurojanaai.com" style={{ color: 'var(--brand-primary)' }}>contact@neurojanaai.com</a>.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
