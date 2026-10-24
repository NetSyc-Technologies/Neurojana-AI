import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Code2, Layers, Smartphone, Cpu, Palette, ShieldCheck, Zap, Clock, Sparkles } from 'lucide-react';
import { getPublishedServices, getPublishedBlogPosts } from '../services/db.js';
import NewsletterBand from '../components/NewsletterBand.jsx';
import BrandShowcase from '../components/BrandShowcase.jsx';

const serviceIcons = {
  'web-development': Code2, 'web-applications': Layers, 'custom-software': Cpu,
  'android-applications': Smartphone, 'ui-ux-design': Palette, 'ai-integrations': Sparkles,
};
const processSteps = [
  { num: '01', title: 'Find the right direction.', desc: 'We start with your goals, your users, and what your business needs the software to do.' },
  { num: '02', title: 'Make it feel right.', desc: 'We map the experience, shape the design, and plan the technology behind it.' },
  { num: '03', title: 'Build it together.', desc: 'Clear milestones, regular feedback, and careful testing keep you involved as the product takes shape.' },
  { num: '04', title: 'Launch with confidence.', desc: 'Deployment, documentation, and a thoughtful handover get your team ready for what comes next.' },
];

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPublishedServices().then((res) => setServices(res.slice(0, 6)));
    getPublishedBlogPosts().then((res) => setPosts(res.slice(0, 2)));
  }, []);

  return (
    <main id="main" className="studio-home">
      <section className="studio-hero">
        <div className="container">
          <div className="studio-hero-grid">
            <div className="studio-hero-copy">
              <div className="eyebrow"><span className="studio-dot" />SOFTWARE & DIGITAL EXPERIENCES</div>
              <h1>Good ideas.<br />Great <em>software.</em></h1>
              <p className="studio-lead">Websites, applications, and custom software.<br className="desktop-break" /> Thoughtfully designed. Carefully engineered.<br className="desktop-break" /> Built around your business.</p>
              <div className="studio-actions">
                <Link to="/book-appointment" className="btn btn-primary btn-lg">Let’s build something <ArrowUpRight size={18} /></Link>
                <Link to="/services" className="studio-text-link">Explore our services <ArrowRight size={16} /></Link>
              </div>
              <div className="hero-footnote"><span className="footnote-rule" /><p>Your next chapter, engineered by <strong>Neurojana AI.</strong></p></div>
            </div>
            <BrandShowcase />
          </div>
          <div className="studio-capabilities" aria-label="Our capabilities"><span>BUILT FOR YOUR NEXT CHAPTER</span><div>Web development <i />Mobile applications <i />Custom software <i />AI integrations</div></div>
        </div>
      </section>

      <section className="section studio-services" id="services">
        <div className="container">
          <div className="studio-section-heading">
            <div><div className="eyebrow">01 / WHAT WE DO</div><h2>The right technology.<br /><em>For your next move.</em></h2></div>
            <p>From a first website to a connected business platform, we turn complex requirements into things people enjoy using.</p>
          </div>
          <div className="studio-service-grid">
            {services.map((srv, index) => {
              const Icon = serviceIcons[srv.id] || Code2;
              return (
                <article key={srv.id} className="studio-service-card">
                  <div className="service-card-top"><Icon size={25} strokeWidth={1.4} /><span>{String(index + 1).padStart(2, '0')}</span></div>
                  <h3><Link to={`/services/${srv.slug}`}>{srv.title}</Link></h3>
                  <p>{srv.summary}</p>
                  <Link to={`/services/${srv.slug}`} className="studio-service-link" aria-label={`Explore ${srv.title}`}>Explore service <ArrowUpRight size={18} /></Link>
                </article>
              );
            })}
          </div>
          <Link to="/services" className="studio-text-link all-services-link">See all services <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section className="section studio-principles">
        <div className="container principles-layout">
          <div className="principles-intro"><div className="eyebrow">02 / THE WAY WE THINK</div><h2>Good software is<br />more than <em>code.</em></h2><p>It should feel effortless to use, dependable to run, and ready to grow with you.</p><Link to="/about" className="studio-text-link">Get to know us <ArrowRight size={16} /></Link></div>
          <div className="principles-list">
            <article><Zap size={23} strokeWidth={1.5} /><div><h3>Fast, where it matters.</h3><p>Considered architecture and careful optimization keep the experience responsive.</p></div></article>
            <article><ShieldCheck size={23} strokeWidth={1.5} /><div><h3>Trust, built in.</h3><p>Access controls, data validation, and secure engineering are part of the foundation.</p></div></article>
            <article><Palette size={23} strokeWidth={1.5} /><div><h3>Less friction. More clarity.</h3><p>Thoughtful design helps people find their way and get things done.</p></div></article>
          </div>
        </div>
      </section>

      <section className="section studio-process">
        <div className="container">
          <div className="studio-section-heading"><div><div className="eyebrow">03 / FROM IDEA TO LAUNCH</div><h2>A clear path.<br /><em>A shared vision.</em></h2></div><p>You bring the idea. We bring the design and engineering. We work through the details together.</p></div>
          <div className="studio-process-grid">{processSteps.map((step) => <article className="studio-process-step" key={step.num}><span className="step-marker">{step.num}</span><h3>{step.title}</h3><p>{step.desc}</p></article>)}</div>
        </div>
      </section>

      <section className="studio-work-section">
        <div className="container">
          <div className="studio-work-panel">
            <div className="work-illustration" aria-hidden="true"><div className="work-sheet sheet-back" /><div className="work-sheet sheet-front"><span>NEUROJANA AI / PROJECT NOTES</span><Layers size={42} strokeWidth={1} /><strong>Thought.<br />Built.<br /><em>Delivered.</em></strong><div className="sheet-rule" /></div></div>
            <div className="work-copy"><div className="eyebrow">04 / OUR WORK</div><h2>Built with purpose.<br /><em>Shared with care.</em></h2><p>Our client case studies are being prepared for publication. In the meantime, talk to us about the kind of product you have in mind.</p><div className="work-actions"><Link to="/portfolio" className="studio-text-link">Explore our portfolio <ArrowRight size={16} /></Link><Link to="/contact" className="studio-text-link">Discuss your project <ArrowUpRight size={16} /></Link></div></div>
          </div>
        </div>
      </section>

      {posts.length > 0 && <section className="section studio-insights"><div className="container"><div className="studio-section-heading"><div><div className="eyebrow">THE NOTEBOOK</div><h2>A little perspective.</h2></div><Link to="/blog" className="studio-text-link">All articles <ArrowRight size={16} /></Link></div><div className="studio-insight-grid">{posts.map((post) => <article key={post.id} className="studio-insight"><div className="insight-meta"><span>{post.tags?.[0] || 'Engineering'}</span><span><Clock size={13} />{post.readTime}</span></div><h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.summary}</p><Link to={`/blog/${post.slug}`} className="studio-text-link">Read the story <ArrowUpRight size={16} /></Link></article>)}</div></div></section>}

      <section className="studio-cta"><div className="container"><div className="studio-cta-inner"><div><div className="eyebrow">SOMETHING IN MIND?</div><h2>Let’s make it <em>happen.</em></h2><p>A conversation is a good place to start.</p></div><div className="cta-actions"><Link to="/book-appointment" className="btn btn-primary btn-lg">Book a consultation <ArrowUpRight size={18} /></Link><Link to="/contact" className="studio-text-link">Or send us a message <ArrowRight size={16} /></Link></div></div></div></section>
      <NewsletterBand source="homepage" />
    </main>
  );
}
