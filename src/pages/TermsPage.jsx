import React from 'react';

export default function TermsPage() {
  return (
    <main id="main" className="section">
      <div className="container" style={{ maxWidth: '780px' }}>
        <div className="eyebrow">
          <span>LEGAL NOTICE DRAFT</span>
        </div>
        <h1>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Last updated: October 2026 · Pending formal corporate legal review
        </p>

        <div className="prose" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '1.02rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the website and digital services provided by Neurojana AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>2. Services & Engineering Engagements</h2>
            <p>
              All software engineering projects, web development contracts, and mobile application deliverables are governed by separate, mutually executed Master Services Agreements (MSAs) and Statements of Work (SOWs) specifying technical scope, milestones, warranties, and payment terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>3. Consultation Bookings</h2>
            <p>
              Consultation requests submitted through our website are subject to administrative review and schedule availability. Submission of a consultation request does not constitute a legally binding service engagement or guarantee of developer availability until explicitly confirmed by our team.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>4. Intellectual Property</h2>
            <p>
              All content, brand identity assets, trademarks, and documentation published on this website remain the exclusive property of Neurojana AI. Client project deliverables are transferred upon full settlement of contracted invoices as defined in individual SOW agreements.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>5. Contact</h2>
            <p>
              For inquiries regarding commercial terms or agreements, contact:
              <br />
              <strong>Email:</strong> <a href="mailto:contact@neurojanaai.com" style={{ color: 'var(--brand-primary)' }}>contact@neurojanaai.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
