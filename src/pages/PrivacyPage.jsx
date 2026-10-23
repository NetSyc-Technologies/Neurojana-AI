import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <main id="main" className="section">
      <div className="container" style={{ maxWidth: '780px' }}>
        <div className="eyebrow">
          <span>LEGAL NOTICE DRAFT</span>
        </div>
        <h1>Privacy Notice</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Last updated: October 2026 · Pending formal corporate legal review
        </p>

        <div className="prose" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '1.02rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>1. Overview & Data Controller</h2>
            <p>
              This Privacy Notice describes how Neurojana AI (“we”, “us”, or “our”) collects, uses, and safeguards information when you visit our website (<code>neurojanaai.com</code>), request consultation appointments, subscribe to our engineering newsletter, or submit business inquiries.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>2. Information We Collect</h2>
            <p>We collect only the personal information you voluntarily provide to us:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Contact Inquiries:</strong> Your name, work email address, telephone number, organization name, and message details.</li>
              <li><strong>Consultation Bookings:</strong> Your name, work email, phone number, company name, requested service, preferred meeting date/time, and project scope details.</li>
              <li><strong>Newsletter Subscriptions:</strong> Your email address and affirmative consent timestamp.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>3. How We Use Your Information</h2>
            <p>Your details are processed strictly for the following purposes:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>To schedule, coordinate, and confirm technical consultations.</li>
              <li>To respond to inbound commercial and technical inquiries.</li>
              <li>To distribute engineering insights and product announcements to consented subscribers.</li>
              <li>To prevent fraudulent automated submissions and maintain platform security.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>4. Data Processors & Cloud Infrastructure</h2>
            <p>
              Our application relies on Google Cloud Firebase (Authentication & Cloud Firestore) for secure data persistence. We do not sell, rent, or lease personal customer data to any third-party brokers or advertisers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>5. Marketing Consent & Opt-Out</h2>
            <p>
              You may opt out of receiving promotional and newsletter emails at any time by visiting our self-service <Link to="/unsubscribe" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Unsubscribe Page</Link> or by sending an email request to <strong>contact@neurojanaai.com</strong>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>6. Contact Information</h2>
            <p>
              If you have any questions or data access requests regarding this policy, please reach out to us directly at:
              <br />
              <strong>Email:</strong> <a href="mailto:contact@neurojanaai.com" style={{ color: 'var(--brand-primary)' }}>contact@neurojanaai.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
