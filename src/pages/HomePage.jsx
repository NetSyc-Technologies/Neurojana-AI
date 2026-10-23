import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  Layers,
  Smartphone,
  Cpu,
  Palette,
  ShieldCheck,
  Zap,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getPublishedServices, getPublishedBlogPosts } from '../services/db.js';
import NewsletterBand from '../components/NewsletterBand.jsx';

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [videoPlaying, setVideoPlaying] = useState(true);

  useEffect(() => {
    getPublishedServices().then((res) => setServices(res.slice(0, 6)));
    getPublishedBlogPosts().then((res) => setPosts(res.slice(0, 2)));
  }, []);

  const serviceIcons = {
    'web-development': <Code2 size={24} />,
    'web-applications': <Layers size={24} />,
    'custom-software': <Cpu size={24} />,
    'android-applications': <Smartphone size={24} />,
    'ui-ux-design': <Palette size={24} />,
    'ai-integrations': <Sparkles size={24} />,
  };

  const processSteps = [
    {
      num: '01',
      title: 'Discovery & Scope',
      desc: 'We unpack your product goals, technical constraints, and operational bottlenecks to build an actionable delivery blueprint.',
    },
    {
      num: '02',
      title: 'Architecture & UX',
      desc: 'We craft intuitive design tokens, clear user journeys, and resilient database schemas before writing a single line of feature code.',
    },
    {
      num: '03',
      title: 'Iterative Engineering',
      desc: 'We build in transparent, milestone-driven sprints with rigorous type safety, automated tests, and accessible standards.',
    },
    {
      num: '04',
      title: 'Deployment & Support',
      desc: 'We orchestrate secure cloud deployments, configure DNS and observability, and provide clean code ownership handover.',
    },
  ];

  return (
    <main id="main">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">
                <span className="live-dot" style={{ width: 8, height: 8, background: '#2563eb', borderRadius: '50%', display: 'inline-block' }} />
                <span>BESPOKE SOFTWARE & DIGITAL ENGINEERING</span>
              </div>

              <h1 className="hero-headline">
                Translating ideas into <span className="highlight">software that matters.</span>
              </h1>

              <p className="hero-lead">
                Neurojana AI engineers high-performance web applications, responsive websites, Android mobile apps, and custom software systems tailored around your business operations.
              </p>

              <div className="hero-actions">
                <Link to="/book-appointment" className="btn btn-primary btn-lg">
                  <span>Book a Consultation</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/services" className="btn btn-secondary btn-lg">
                  <span>Explore Services</span>
                </Link>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={16} color="#2563eb" />
                  <span>Production-Grade Code</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Zap size={16} color="#2563eb" />
                  <span>Sub-Second Performance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckCircle size={16} color="#2563eb" />
                  <span>100% IP & Source Ownership</span>
                </div>
              </div>
            </div>

            {/* Hero Visual: Authentic brand video / logo */}
            <div className="hero-visual">
              <div className="hero-card-preview">
                <div className="hero-video-box">
                  <video
                    src="/assets/logo.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/assets/logo.png"
                    aria-label="Neurojana AI Brand Animation"
                  />
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>
                      NEUROJANA AI
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Engineering Authority & Innovation
                    </div>
                  </div>
                  <span className="status-pill active" style={{ fontSize: '0.72rem' }}>
                    Active Stack
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Value Statement Bar */}
      <section className="trust-statement-bar">
        <div className="container">
          <p className="trust-statement-text">
            “We combine architectural discipline, clean modern code, and transparent milestones to deliver software that drives measurable business outcomes.”
          </p>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="section" id="services">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
              <span>CORE CAPABILITIES</span>
            </div>
            <h2>Tailored solutions for modern businesses</h2>
            <p style={{ marginTop: '0.85rem' }}>
              From initial architecture to production launch, we engineer digital products built to scale effortlessly.
            </p>
          </div>

          <div className="card-grid">
            {services.map((srv) => (
              <div key={srv.id} className="service-card">
                <div className="service-icon-box">
                  {serviceIcons[srv.id] || <Code2 size={24} />}
                </div>
                <h3>{srv.title}</h3>
                <p>{srv.summary}</p>
                <Link to={`/services/${srv.slug}`} className="card-link">
                  <span>Explore Scope & Process</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/services" className="btn btn-secondary">
              <span>View All Services & Technical Specifications</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
              <span>WHY NEUROJANA AI</span>
            </div>
            <h2>Engineering principles that define our work</h2>
            <p style={{ marginTop: '0.85rem' }}>
              We do not cut corners or use fragile hacks. Every application is built upon proven engineering foundations.
            </p>
          </div>

          <div className="card-grid">
            <div className="service-card">
              <div className="service-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Zap size={24} />
              </div>
              <h3>Performance First</h3>
              <p>We optimize assets, database queries, and rendering lifecycles to guarantee instantaneous interactions and lightning-fast load times.</p>
            </div>

            <div className="service-card">
              <div className="service-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <ShieldCheck size={24} />
              </div>
              <h3>Security & Trust</h3>
              <p>Strict role-based access rules, data validation layers, and sanitization protocols protect your confidential business data at every boundary.</p>
            </div>

            <div className="service-card">
              <div className="service-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
                <Palette size={24} />
              </div>
              <h3>Design Restraint</h3>
              <p>Clean typography, intentional spacing, and purposeful micro-interactions create an interface that feels calm, confident, and professional.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Timeline */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
              <span>DELIVERY ROADMAP</span>
            </div>
            <h2>How we bring your software to life</h2>
            <p style={{ marginTop: '0.85rem' }}>
              A predictable, structured engagement model with zero ambiguity.
            </p>
          </div>

          <div className="process-timeline">
            {processSteps.map((step) => (
              <div key={step.num} className="process-step">
                <div className="process-number">STEP {step.num}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Work / What We Build Showcase */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <div className="eyebrow">
                <span>PORTFOLIO PREVIEW</span>
              </div>
              <h2>Selected engineering work</h2>
              <p style={{ marginTop: '0.5rem', maxWidth: '520px' }}>
                Explore digital systems, web apps, and custom architectures engineered by our team.
              </p>
            </div>
            <Link to="/portfolio" className="btn btn-secondary">
              <span>View Full Portfolio</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ background: 'var(--bg-surface-alt)', border: '1px dashed var(--border-muted)', borderRadius: 'var(--radius-xl)', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#fff', borderRadius: '50%', boxShadow: 'var(--shadow-sm)', marginBottom: '1rem', color: '#2563eb' }}>
              <Layers size={28} />
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Client Case Studies in Review</h3>
            <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              We respect client confidentiality. Detailed case studies and architecture breakdowns are published following formal client clearance.
            </p>
            <Link to="/contact" className="btn btn-outline btn-sm">
              <span>Request Architecture Demonstration</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Insights / Blog Preview */}
      {posts.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
              <div>
                <div className="eyebrow">
                  <span>ENGINEERING INSIGHTS</span>
                </div>
                <h2>From our engineering notebook</h2>
                <p style={{ marginTop: '0.5rem' }}>
                  Perspectives on modern software architecture, web performance, and AI systems.
                </p>
              </div>
              <Link to="/blog" className="btn btn-secondary">
                <span>All Articles</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {posts.map((post) => (
                <article key={post.id} className="service-card" style={{ padding: '2.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {post.tags?.map((tag) => (
                      <span key={tag} className="status-pill draft" style={{ fontSize: '0.75rem' }}>{tag}</span>
                    ))}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>
                    <Link to={`/blog/${post.slug}`} style={{ color: 'inherit' }}>
                      {post.title}
                    </Link>
                  </h3>
                  <p style={{ fontSize: '0.95rem' }}>{post.summary}</p>
                  <Link to={`/blog/${post.slug}`} className="card-link" style={{ marginTop: 'auto' }}>
                    <span>Read Full Article</span>
                    <ArrowRight size={14} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Consultation Call-To-Action Band */}
      <section className="section" style={{ background: 'var(--brand-primary)', color: '#fff' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            Ready to build software that matters?
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.15rem', marginBottom: '2.25rem' }}>
            Schedule an initial consultation with our technical leads to explore scope, timeline, and architectural direction for your project.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/book-appointment" className="btn btn-secondary btn-lg" style={{ color: 'var(--brand-primary)', background: '#fff' }}>
              <span>Book a Consultation</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#fff' }}>
              <span>Send a Message</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <NewsletterBand source="homepage" />
    </main>
  );
}
