import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedProjects } from '../services/db.js';
import { Layers, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import NewsletterBand from '../components/NewsletterBand.jsx';

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedProjects().then((res) => {
      setProjects(res);
      setLoading(false);
    });
  }, []);

  return (
    <main id="main">
      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div style={{ maxWidth: '720px' }}>
            <div className="eyebrow">
              <span>SELECTED WORK</span>
            </div>
            <h1>Engineered software in production.</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Explore real-world applications, client platforms, and custom software systems delivered by Neurojana AI.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem 0' }}>Loading portfolio...</p>
          ) : projects.length === 0 ? (
            /* Honest, polished empty state honoring client confidentiality */
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '720px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                display: 'inline-flex',
                padding: '1rem',
                background: 'var(--brand-primary-light)',
                color: 'var(--brand-primary)',
                borderRadius: '50%',
                marginBottom: '1.5rem',
              }}>
                <ShieldCheck size={36} />
              </div>
              <h2 style={{ fontSize: '1.65rem', marginBottom: '0.75rem' }}>Client Confidentiality & Clearance in Progress</h2>
              <p style={{ maxWidth: '520px', margin: '0 auto 2rem', color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.7 }}>
                We strictly protect the proprietary code and commercial privacy of our clients. Complete case studies and architecture deep dives are published only following formal client approval.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-primary">
                  <span>Request Private Technical Demos</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/services" className="btn btn-secondary">
                  <span>Explore What We Can Build</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="card-grid">
              {projects.map((proj) => (
                <div key={proj.id} className="service-card">
                  {proj.coverImage && (
                    <div style={{ height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem', background: '#f1f5f9' }}>
                      <img src={proj.coverImage} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <h3>{proj.title}</h3>
                  <p>{proj.summary}</p>
                  <Link to={`/portfolio/${proj.slug}`} className="card-link" style={{ marginTop: 'auto' }}>
                    <span>View Case Study</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsletterBand source="portfolio" />
    </main>
  );
}
