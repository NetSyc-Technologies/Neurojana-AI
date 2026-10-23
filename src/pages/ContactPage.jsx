import React, { useState } from 'react';
import { submitContactInquiry } from '../services/db.js';
import { Mail, Clock, MapPin, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [service, setService] = useState('General Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid work email.');
    if (!message.trim()) return setError('Please enter your inquiry message.');

    setLoading(true);
    try {
      await submitContactInquiry({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        company: company.trim(),
        service,
        subject: subject.trim() || 'Website Inquiry',
        message: message.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Unable to submit your inquiry. Please write to contact@neurojanaai.com directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'flex-start' }} className="hero-grid">
            {/* Left Contact Information */}
            <div>
              <div className="eyebrow">
                <span>GET IN TOUCH</span>
              </div>
              <h1>Let's discuss what we can engineer together.</h1>
              <p style={{ fontSize: '1.2rem', marginTop: '1.25rem', color: 'var(--text-secondary)' }}>
                Have an inquiry about an upcoming project, architecture audit, or partnership? Drop us a note and an engineering lead will review your message.
              </p>

              <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="service-icon-box" style={{ width: 44, height: 44, margin: 0, flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Direct Email</div>
                    <a href="mailto:contact@neurojanaai.com" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      contact@neurojanaai.com
                    </a>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Standard response time within 1 business day.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="service-icon-box" style={{ width: 44, height: 44, margin: 0, flexShrink: 0 }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Operating Hours</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Monday – Friday, 09:30 – 18:30 IST
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Serving clients globally across IST, EST, and GMT timezones.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div>
              {success ? (
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--status-success-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-md)',
                }}>
                  <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', borderRadius: '50%', marginBottom: '1rem' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h2>Message Received</h2>
                  <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                    Thank you, <strong>{name}</strong>. Your message has been routed to our project intake desk. We will get back to you shortly at <strong>{email}</strong>.
                  </p>
                  <button onClick={() => setSuccess(false)} className="btn btn-secondary" style={{ marginTop: '1.75rem' }}>
                    <span>Send Another Message</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }} noValidate>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Send a Message</h3>

                  {error && (
                    <div style={{ padding: '0.85rem 1rem', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', borderRadius: 'var(--radius-md)', color: 'var(--status-error-text)', fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Your Name <span className="required">*</span></label>
                      <input type="text" className="form-control" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address <span className="required">*</span></label>
                      <input type="email" className="form-control" placeholder="alex@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Phone (Optional)</label>
                      <input type="tel" className="form-control" placeholder="+1 555 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Organization (Optional)</label>
                      <input type="text" className="form-control" placeholder="Acme Technologies" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input type="text" className="form-control" placeholder="Project Inquiry / Consultation" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Inquiry Message <span className="required">*</span></label>
                    <textarea className="form-control" rows="4" placeholder="Tell us about your project, timeline, or question..." value={message} onChange={(e) => setMessage(e.target.value)} maxLength={3000} required />
                    <span className="form-hint">{message.length}/3000 characters</span>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
