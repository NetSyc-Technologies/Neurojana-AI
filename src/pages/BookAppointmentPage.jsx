import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPublishedServices, createAppointmentRequest } from '../services/db.js';
import { Calendar, Clock, CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';

  const [services, setServices] = useState([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('11:00');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingReceipt, setBookingReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getPublishedServices().then((list) => {
      setServices(list);
      if (preselectedService) {
        const found = list.find((s) => s.title.toLowerCase() === preselectedService.toLowerCase());
        if (found) setServiceName(found.title);
      } else if (list.length > 0) {
        setServiceName(list[0].title);
      }
    });
  }, [preselectedService]);

  // Today's date + 1 day as min selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Please enter your full name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.');
    if (!phone.trim() || phone.length < 7) return setError('Please enter a valid phone number with country code.');
    if (!serviceName) return setError('Please select a service.');
    if (!preferredDate) return setError('Please choose a preferred meeting date.');
    if (!message.trim()) return setError('Please provide a brief summary of your project or requirements.');
    if (!consent) return setError('Please accept the processing of your details for scheduling.');

    setLoading(true);
    try {
      const receipt = await createAppointmentRequest({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        company: company.trim(),
        serviceName,
        preferredDate,
        preferredTime,
        timezone,
        message: message.trim(),
      });

      setBookingReceipt(receipt);
    } catch (err) {
      setError(err?.message || 'Failed to submit appointment request. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const copyRefCode = () => {
    if (bookingReceipt?.referenceId && navigator.clipboard) {
      navigator.clipboard.writeText(bookingReceipt.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main id="main">
      <section className="section">
        <div className="container" style={{ maxWidth: '780px' }}>
          {bookingReceipt ? (
            /* Polished Receipt Screen */
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2.5rem',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '1rem',
                  background: 'var(--status-success-bg)',
                  color: 'var(--status-success-text)',
                  borderRadius: '50%',
                  marginBottom: '1rem',
                }}>
                  <CheckCircle2 size={40} />
                </div>
                <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', marginBottom: '0.5rem' }}>
                  Consultation Request Submitted
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                  Your request has been registered in our scheduling calendar.
                </p>
              </div>

              {/* Reference ID Pill */}
              <div style={{
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Official Reference Code
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                    {bookingReceipt.referenceId}
                  </div>
                </div>

                <button onClick={copyRefCode} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Booking Summary Box */}
              <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Client Name</span>
                    <strong>{bookingReceipt.fullName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Email Address</span>
                    <strong>{bookingReceipt.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Service Requested</span>
                    <strong>{bookingReceipt.serviceName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Requested Slot</span>
                    <strong>{bookingReceipt.preferredDate} at {bookingReceipt.preferredTime}</strong> ({bookingReceipt.timezone})
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="status-pill pending_review">
                    Status: Pending Administrative Review
                  </span>
                </div>
              </div>

              {/* Honest Notice */}
              <div style={{
                background: 'var(--status-info-bg)',
                border: '1px solid var(--status-info-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={16} />
                  <span>Administrative Confirmation Notice</span>
                </div>
                Your requested consultation slot has been recorded in our review outbox. Our engineering team reviews all upcoming requests and coordinates with staff availability. You will receive an official confirmation once approved. For immediate updates, write to <strong>contact@neurojanaai.com</strong> referencing code <strong>{bookingReceipt.referenceId}</strong>.
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link to="/" className="btn btn-primary">
                  <span>Return to Homepage</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
                  <span>CONSULTATION SCHEDULING</span>
                </div>
                <h1>Book a Technical Consultation</h1>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '1.15rem' }}>
                  Select your preferred time to speak directly with our engineering leadership about your upcoming project.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }} noValidate>
                {error && (
                  <div style={{ padding: '1rem', background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', borderRadius: 'var(--radius-md)', color: 'var(--status-error-text)', fontSize: '0.92rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Work Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Phone Number (with Country Code) <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Acme Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Service Interested In <span className="required">*</span>
                  </label>
                  <select
                    className="form-control"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    required
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                    <option value="Custom Project Architecture">Custom Project Architecture</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Preferred Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      min={minDateString}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Preferred Start Time <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                    >
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Timezone
                    </label>
                    <select
                      className="form-control"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Project Requirements & Scope Summary <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Briefly describe what you are looking to build, any existing software or databases in place, and your target timeline..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={2000}
                    required
                  />
                  <span className="form-hint">{message.length}/2000 characters</span>
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{ marginTop: '4px', cursor: 'pointer' }}
                    required
                  />
                  <label htmlFor="consent" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.5 }}>
                    I acknowledge that consultation times are subject to administrative review and confirmation. I consent to the processing of this contact information in accordance with the <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Notice</Link>.
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '1.5rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Consultation Request</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
