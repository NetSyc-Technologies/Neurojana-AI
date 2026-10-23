import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getServiceBySlug } from '../services/db.js';
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Layers } from 'lucide-react';
import NewsletterBand from '../components/NewsletterBand.jsx';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServiceBySlug(slug).then((res) => {
      setService(res);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <main className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p>Loading service details...</p>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Service Not Found</h2>
        <p style={{ margin: '1rem 0 2rem' }}>The requested service does not exist or has been moved.</p>
        <Link to="/services" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Services</span>
        </Link>
      </main>
    );
  }

  return (
    <main id="main">
      {/* Service Header */}
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} />
            <span>All Services</span>
          </Link>

          <div style={{ maxWidth: '820px' }}>
            <div className="eyebrow">
              <span>{service.category}</span>
            </div>
            <h1>{service.title}</h1>
            <p style={{ fontSize: '1.25rem', marginTop: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {service.description}
            </p>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={`/book-appointment?service=${encodeURIComponent(service.title)}`} className="btn btn-primary btn-lg">
                <span>Book Consultation for this Service</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                <span>Ask a Question</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scope & Deliverables Grid */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            {/* Scope */}
            <div>
              <h2 style={{ fontSize: '1.65rem', marginBottom: '1.5rem' }}>What We Do</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {service.scope?.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables & Stack */}
            <div>
              <h2 style={{ fontSize: '1.65rem', marginBottom: '1.5rem' }}>Key Deliverables</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                {service.deliverables?.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Layers size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{item}</span>
                  </li>
                ))}
              </ul>

              {service.technologies && (
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.85rem' }}>Technologies & Tools</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {service.technologies.map((t) => (
                      <span key={t} style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="section">
          <div className="container" style={{ maxWidth: '780px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
                <span>COMMON QUESTIONS</span>
              </div>
              <h2>Frequently asked questions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {service.faqs.map((faq) => (
                <div key={faq.question} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                    <HelpCircle size={18} color="#2563eb" />
                    <span>{faq.question}</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.98rem' }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Consultation CTA */}
      <section className="section" style={{ background: '#0b172d', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Discuss your project with our lead engineers</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Book a 30-minute scoping consultation to discuss architecture, timeline, and investment.
          </p>
          <Link to={`/book-appointment?service=${encodeURIComponent(service.title)}`} className="btn btn-primary btn-lg">
            <span>Book a Consultation</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <NewsletterBand source={`service-${service.slug}`} />
    </main>
  );
}
