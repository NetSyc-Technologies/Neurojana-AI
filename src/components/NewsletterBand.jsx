import React, { useState } from 'react';
import { subscribeNewsletter } from '../services/db.js';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsletterBand({ source = 'homepage' }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await subscribeNewsletter({
        email: cleanEmail,
        source,
        consentMarketing: consent,
      });
      setSuccess(true);
      setEmail('');
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
            <span>ENGINEERING DISPATCH</span>
          </div>
          <h2 id="newsletter-heading" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', marginBottom: '0.85rem' }}>
            Stay informed on modern software & AI
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 auto', maxWidth: '520px' }}>
            Receive periodic insights, architectural breakdowns, and product updates from the Neurojana AI engineering team. No spam, ever.
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
              <p style={{ color: '#047857', fontSize: '0.92rem', marginTop: '0.5rem' }}>
                Thank you for subscribing. We will share meaningful technology updates as we release them.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form" noValidate>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your work email..."
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  aria-label="Email address for newsletter"
                  aria-invalid={Boolean(error)}
                />
                {error && <span className="form-error">{error}</span>}
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
