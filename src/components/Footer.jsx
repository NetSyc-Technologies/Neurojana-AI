import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <div className="brand-title">
              NEUROJANA<span style={{ color: '#3b82f6' }}>-</span>AI
            </div>
            <p className="footer-desc">
              Translating ideas into software that matters. Bespoke web applications, Android development, custom software engineering, and AI-enabled digital services.
            </p>
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <Mail size={16} color="#3b82f6" />
              <a href="mailto:contact@neurojanaai.com" style={{ color: '#cbd5e1' }}>
                contact@neurojanaai.com
              </a>
            </div>
          </div>

          {/* Solutions & Services */}
          <div>
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li><Link to="/services/web-development">Website Development</Link></li>
              <li><Link to="/services/web-applications">Web Applications</Link></li>
              <li><Link to="/services/custom-software">Custom Software</Link></li>
              <li><Link to="/services/android-applications">Android Applications</Link></li>
              <li><Link to="/services/ui-ux-design">UI/UX & Product Design</Link></li>
              <li><Link to="/services/ai-integrations">AI Integrations</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Neurojana AI</Link></li>
              <li><Link to="/portfolio">Selected Work</Link></li>
              <li><Link to="/blog">Engineering Insights</Link></li>
              <li><Link to="/book-appointment">Book a Consultation</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="footer-heading">Trust & Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Notice</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/unsubscribe">Newsletter Preferences</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Discreet Admin Access */}
        <div className="footer-bottom">
          <div>
            © {currentYear} Neurojana AI. All rights reserved.
          </div>

          {/* Discreet Administrator Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/admin/login" className="footer-admin-link" aria-label="Administrator Portal Access">
              <Lock size={12} />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
