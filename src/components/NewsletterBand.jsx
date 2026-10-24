import React, { useState } from 'react';
import { subscribeNewsletter } from '../services/db.js';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsletterBand({ source = 'homepage' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await subscribeNewsletter({
        email: cleanEmail,
        source,
        consentMarketing: true,
      });
      setSuccessMsg(res?.message || 'Subscription successful! Please check your inbox.');
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section" aria-labelledby="newsletter-heading">
      <div className="container">
        <div className="newsletter-box">
          <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
            <span>LET’S STAY IN TOUCH</span>
          </div>
          <h2 id="newsletter-heading" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', marginBottom: '0.85rem' }}>
            Good things, occasionally.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 auto', maxWidth: '520px' }}>
            Notes on design, software, and what we’re building. A thoughtful update from Neurojana AI, straight to your inbox.
          </p>

          {success ? (
            <div
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'var(--status-success-bg)',
                border: '1px solid var(--status-success-border)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--status-success-text)',
                textAlign: 'center',
              }}
              role="alert"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                <CheckCircle2 size={20} />
                <span>You're on the list!</span>
              </div>
              <p style={{ color: '#047857', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                {successMsg || 'Subscription successful! Please check your inbox for confirmation.'}
              </p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleSubmit} disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Requesting…' : 'Request another confirmation'}
              </button>
              {error && <p className="form-error" role="alert">{error}</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form" noValidate>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@company.com"
                  autoComplete="email"
                  maxLength={254}
                  disabled={loading}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  aria-label="Email address for newsletter"
                  aria-invalid={Boolean(error)}
                />
                {error && <span className="form-error" role="alert">{error}</span>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            By subscribing, you agree to our <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>. Unsubscribe at any time.
          </div>
        </div>
      </div>
    </section>
  );
}
