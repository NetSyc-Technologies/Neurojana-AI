import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Layers, Cpu, Smartphone, Palette, Sparkles } from 'lucide-react';
import { getAllServices } from '../services/db.js';
import NewsletterBand from '../components/NewsletterBand.jsx';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    getAllServices().then((res) => setServices(res.filter((s) => s.published)));
  }, []);

  const categories = ['All', 'Engineering', 'Software Solutions', 'Mobile', 'Design', 'Artificial Intelligence'];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  const serviceIcons = {
    'web-development': <Code2 size={24} />,
    'web-applications': <Layers size={24} />,
    'custom-software': <Cpu size={24} />,
    'android-applications': <Smartphone size={24} />,
    'ui-ux-design': <Palette size={24} />,
    'ai-integrations': <Sparkles size={24} />,
  };

  return (
    <main id="main">
      <section className="section" style={{ paddingBottom: '2.5rem' }}>
        <div className="container">
          <div style={{ maxWidth: '720px' }}>
            <div className="eyebrow">
              <span>OUR SERVICES</span>
            </div>
            <h1>Engineered for precision, speed, and business growth.</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Explore our core technical offerings across web engineering, mobile development, custom software architectures, and AI integrations.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '2.5rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div className="card-grid">
            {filteredServices.map((srv) => (
              <div key={srv.id} className="service-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div className="service-icon-box" style={{ margin: 0 }}>
                    {serviceIcons[srv.id] || <Code2 size={24} />}
                  </div>
                  <span className="status-pill draft" style={{ fontSize: '0.72rem' }}>
                    {srv.category}
                  </span>
                </div>

                <h3>{srv.title}</h3>
                <p>{srv.summary}</p>

                {srv.technologies && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {srv.technologies.map((t) => (
                      <span key={t} style={{ fontSize: '0.75rem', background: 'var(--bg-surface-alt)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <Link to={`/services/${srv.slug}`} className="card-link" style={{ marginTop: 'auto' }}>
                  <span>View Details & Deliverables</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterBand source="services" />
    </main>
  );
}
