import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuToggle = useRef(null);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuToggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="container">
        <div className="header-inner">
          {/* Brand Logo & Title */}
          <Link to="/" className="brand-link" onClick={closeMenu} aria-label="Neurojana AI Homepage">
            <img src="/assets/logo.png" alt="Neurojana AI Logo" width="40" height="40" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <span className="brand-title">
                NEUROJANA<span className="accent-dot">-</span>AI
              </span>
              <span className="brand-subtitle">DIGITAL ENGINEERING</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link key={link.path} to={link.path} className={`nav-link ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Button & Mobile Toggle */}
          <div className="nav-cta-group">
            <Link to="/book-appointment" className="btn btn-primary btn-sm header-booking">
              <span>Let’s talk</span>
              <ArrowRight size={14} />
            </Link>

            <button
              ref={menuToggle}
              type="button"
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav id="mobile-navigation" className="mobile-menu-drawer" aria-label="Mobile Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="nav-link"
              onClick={closeMenu}
              style={{ fontSize: '1.1rem', padding: '0.5rem 0' }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/book-appointment"
            className="btn btn-primary"
            onClick={closeMenu}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <span>Book a Consultation</span>
            <ArrowRight size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}
