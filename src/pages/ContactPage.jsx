import React, { useState } from "react";
import { Link } from "react-router-dom";
import { submitContactInquiry } from "../services/db.js";
import { normalizePhone } from "../services/phone.js";
import { Mail, Clock, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import PhoneInput from "../components/PhoneInput.jsx";
import FormField, { FormNotice } from "../components/FormField.jsx";
import PageIntro from "../components/PageIntro.jsx";
export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("IN");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!name.trim()) return setError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Please enter a valid email address.");
    const fullPhone = normalizePhone(phone, country);
    if (fullPhone === null)
      return setError(
        "Please enter a valid phone number for the selected country.",
      );
    if (!message.trim())
      return setError("Please tell us a little about your project.");
    setLoading(true);
    try {
      await submitContactInquiry({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: fullPhone,
        company: company.trim(),
        service: "General Inquiry",
        subject: subject.trim() || "Website Inquiry",
        message: message.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to send your message. Please email contact@neurojanaai.com.",
      );
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setSubject("");
    setMessage("");
    setError("");
    setSuccess(false);
  };
  return (
    <main id="main" className="editorial-page contact-page">
      <PageIntro
        eyebrow="LET’S TALK"
        title={
          <>
            It starts with
            <br />a <em>conversation.</em>
          </>
        }
      >
        <p>
          A new idea, a challenge to solve, or a project ready for its next
          chapter. We’d love to hear about it.
        </p>
      </PageIntro>
      <section className="section inquiry-section">
        <div className="container inquiry-layout">
          <aside className="inquiry-aside">
            <span className="eyebrow">A DIRECT LINE TO US</span>
            <a href="mailto:contact@neurojanaai.com" className="contact-email">
              contact@neurojanaai.com <ArrowRight size={20} />
            </a>
            <p>
              Tell us what you have in mind. We’ll help you work out a useful
              next step.
            </p>
            <div className="contact-detail">
              <Mail size={20} strokeWidth={1.4} />
              <div>
                <strong>Keep it simple.</strong>
                <p>
                  Share your idea, timeline, or questions. You don’t need a
                  finished brief.
                </p>
              </div>
            </div>
            <div className="contact-detail">
              <Clock size={20} strokeWidth={1.4} />
              <div>
                <strong>Monday – Friday</strong>
                <p>
                  09:30 – 18:30 IST
                  <br />
                  Working with businesses across time zones.
                </p>
              </div>
            </div>
            <div className="aside-note">
              <span className="eyebrow">PREFER TO TALK IT THROUGH?</span>
              <h3>Make time for your idea.</h3>
              <Link to="/book-appointment" className="text-link">
                Book a consultation <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
          {success ? (
            <div className="inquiry-card receipt-card" role="status">
              <CheckCircle2 size={40} strokeWidth={1.3} />
              <span className="eyebrow">THANK YOU FOR REACHING OUT</span>
              <h2>
                Message <em>received.</em>
              </h2>
              <p>
                We’ll review your inquiry and get back to you at{" "}
                <strong>{email}</strong>.
              </p>
              <button className="btn btn-secondary" onClick={reset}>
                Send another message
              </button>
            </div>
          ) : (
            <form className="inquiry-card" onSubmit={handleSubmit}>
              <div className="form-card-heading">
                <div>
                  <span className="eyebrow">YOUR NEXT PROJECT</span>
                  <h2>Tell us a little more.</h2>
                </div>
                <span>* Required</span>
              </div>
              {error && <FormNotice>{error}</FormNotice>}
              <div className="form-grid">
                <FormField
                  label="Full name"
                  placeholder="Full name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={120}
                />
                <FormField
                  label="Email address"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                />
              </div>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                country={country}
                onCountryChange={setCountry}
              />
              <div className="form-grid">
                <FormField
                  label="Company (optional)"
                  placeholder="Company name"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  maxLength={160}
                />
                <FormField
                  label="Subject (optional)"
                  placeholder="What is your inquiry about?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                />
              </div>
              <FormField label="Your message" required>
                <textarea
                  rows={5}
                  placeholder="Tell us about your project, goals, and timeline."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={3000}
                />
              </FormField>
              <p className="form-privacy">
                We’ll use these details to respond to your inquiry. Read our{" "}
                <Link to="/privacy">privacy notice</Link>.
              </p>
              <button
                className="btn btn-primary form-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending
                    message…
                  </>
                ) : (
                  <>
                    Send message <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
