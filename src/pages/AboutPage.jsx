import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import NewsletterBand from '../components/NewsletterBand.jsx';

export default function AboutPage() {
  const values = [
    {
      title: 'Architectural Rigor',
      desc: 'We do not rush to hack together fragile code. Every data schema, component tree, and API contract is designed for maintainability and clear failure modes.',
    },
    {
      title: 'Sub-Second Performance',
      desc: 'Bloat is the enemy of usability. We engineer applications that load instantly and respond immediately to user input across all devices and network conditions.',
    },
    {
      title: 'Transparent Collaboration',
      desc: 'Zero black-box obscurity. We provide clear sprint milestones, honest status tracking, and complete intellectual property ownership handover.',
    },
    {
      title: 'Practical Innovation',
      desc: 'We evaluate new technologies—including artificial intelligence models—against real business utility, adopting only what creates measurable value.',
    },
  ];

  return (
    <main id="main">
      {/* Header Banner */}
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div style={{ maxWidth: '780px' }}>
            <div className="eyebrow">
              <span>ABOUT NEUROJANA AI</span>
            </div>
            <h1>Bespoke software engineered for enduring reliability.</h1>
            <p style={{ fontSize: '1.25rem', marginTop: '1.25rem', color: 'var(--text-secondary)' }}>
              Neurojana AI is a digital engineering company providing website development, interactive web applications, Android applications, and custom software systems for forward-thinking organizations.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Grid */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            <div>
              <div style={{ display: 'inline-flex', padding: '0.65rem', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <Target size={28} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Our Mission</h2>
              <p>
                Our mission is to translate complex business problems into elegant, dependable software systems that empower our clients to operate faster, communicate clearly, and scale sustainably.
              </p>
            </div>

            <div>
              <div style={{ display: 'inline-flex', padding: '0.65rem', background: '#ecfdf5', color: '#059669', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <Zap size={28} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Our Engineering Philosophy</h2>
              <p>
                We believe exceptional software is defined as much by what is omitted as what is built. By rejecting unnecessary dependencies and adhering to web standards, we build digital products that endure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
              <span>OUR CORE PRINCIPLES</span>
            </div>
            <h2>What sets our work apart</h2>
          </div>

          <div className="card-grid">
            {values.map((v) => (
              <div key={v.title} className="service-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <CheckCircle2 size={20} color="#2563eb" />
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{v.title}</h3>
                </div>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Banner */}
      <section className="section" style={{ background: '#0b172d', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Work with Neurojana AI</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Have a project in mind or need an experienced technical team to build your next web or mobile application?
          </p>
          <Link to="/book-appointment" className="btn btn-primary btn-lg">
            <span>Book a Consultation</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <NewsletterBand source="about" />
    </main>
  );
}
