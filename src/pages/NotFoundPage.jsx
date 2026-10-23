import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Layers, Mail } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main id="main" className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--brand-primary)', lineHeight: 1, marginBottom: '1rem', letterSpacing: '-0.05em' }}>
          404
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          The page or resource you requested could not be located on the Neurojana AI network.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
          <Link to="/services" className="btn btn-secondary">
            <Layers size={16} />
            <span>Explore Services</span>
          </Link>
          <Link to="/contact" className="btn btn-outline">
            <Mail size={16} />
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
