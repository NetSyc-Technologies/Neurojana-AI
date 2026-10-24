import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getPublishedServices,
  createAppointmentRequest,
} from "../services/db.js";
import { normalizePhone } from "../services/phone.js";
import { ArrowRight, CheckCircle2, Copy, Check, Loader2 } from "lucide-react";
import PageIntro from "../components/PageIntro.jsx";
import PhoneInput from "../components/PhoneInput.jsx";
import FormField, { FormNotice } from "../components/FormField.jsx";
export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get("service") || "";
  const [services, setServices] = useState([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("IN");
  const [company, setCompany] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("11:00");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingReceipt, setBookingReceipt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  useEffect(() => {
    let active = true;
    getPublishedServices()
      .then((list) => {
        if (!active) return;
        setServices(list);
        const found = list.find(
          (s) =>
            s.title.toLowerCase() === preselectedService.toLowerCase() ||
            s.slug === preselectedService,
        );
        setServiceName(found?.title || "");
      })
      .catch(() => {
        if (active)
          setError(
            "Services could not be loaded. You can still select a custom project.",
          );
      });
    return () => {
      active = false;
    };
  }, [preselectedService]);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0"),
  ].join("-");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Please enter a valid email address.");
    const fullPhone = normalizePhone(phone, country);
    if (!fullPhone)
      return setError(
        "Please enter a valid phone number for the selected country.",
      );
    if (!serviceName) return setError("Please select a service.");
    if (!preferredDate || preferredDate < minDateString)
      return setError("Please choose a date from tomorrow onwards.");
    if (!message.trim())
      return setError("Please add a brief description of your project.");
    if (!consent)
      return setError("Please accept the privacy notice to continue.");
    setLoading(true);
    try {
      const receipt = await createAppointmentRequest({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: fullPhone,
        company: company.trim(),
        serviceName,
        preferredDate,
        preferredTime,
        timezone,
        message: message.trim(),
      });
      setBookingReceipt(receipt);
    } catch (err) {
      setError(
        err?.message || "Unable to request a consultation. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const copyRefCode = async () => {
    try {
      await navigator.clipboard.writeText(bookingReceipt.referenceId);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError("Please select and copy the reference code above.");
    }
  };
  return (
    <main id="main" className="editorial-page booking-page">
      <PageIntro
        eyebrow="BOOK A CONSULTATION"
        title={
          <>
            Let’s make room
            <br />
            for <em>your idea.</em>
          </>
        }
      >
        <p>
          A conversation about what you’re building, where you want to go, and
          how we can help you get there.
        </p>
      </PageIntro>
      <section className="section inquiry-section">
        <div className="container inquiry-layout">
          <aside className="inquiry-aside booking-aside">
            <span className="eyebrow">WHAT HAPPENS NEXT</span>
            <h2>A clear first step.</h2>
            <ol className="booking-steps">
              <li>
                <span>01</span>
                <div>
                  <h3>Tell us about your project</h3>
                  <p>A few details help us understand what you need.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Choose a time that suits you</h3>
                  <p>Send your preferred date, time, and time zone.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>We’ll confirm with you</h3>
                  <p>
                    Our team checks availability and gets in touch to arrange
                    the conversation.
                  </p>
                </div>
              </li>
            </ol>
            <div className="aside-note">
              <img className="aside-logo" src="/assets/logo.png" alt="" />
              <p>
                Websites, web apps, Android apps, custom software, and practical
                AI solutions.
              </p>
              <Link to="/contact" className="text-link">
                Prefer to send a message? <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
          {bookingReceipt ? (
            <div className="inquiry-card receipt-card" role="status">
              <CheckCircle2 size={40} strokeWidth={1.3} />
              <span className="eyebrow">REQUEST RECEIVED</span>
              <h2>
                A good <em>beginning.</em>
              </h2>
              <p>
                Your preferred time has been requested. We’ll contact you after
                checking availability.
              </p>
              <div className="receipt-reference">
                <span>Your reference</span>
                <strong>{bookingReceipt.referenceId}</strong>
                <button className="btn btn-secondary" onClick={copyRefCode}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy reference"}
                </button>
              </div>
              {copyError && <p role="alert">{copyError}</p>}
              <dl className="receipt-details">
                {[
                  ["Name", bookingReceipt.fullName],
                  ["Email", bookingReceipt.email],
                  ["Service", bookingReceipt.serviceName],
                  ["Preferred date", bookingReceipt.preferredDate],
                  [
                    "Preferred time",
                    bookingReceipt.preferredTime +
                      " · " +
                      bookingReceipt.timezone,
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="booking-notice">
                <strong>Awaiting confirmation</strong>
                <p>
                  This is a request, and your appointment is not yet confirmed.
                  For updates, email{" "}
                  <a href="mailto:contact@neurojanaai.com">
                    contact@neurojanaai.com
                  </a>{" "}
                  with your reference.
                </p>
              </div>
              <Link to="/" className="text-link">
                Back to home <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form className="inquiry-card booking-form" onSubmit={handleSubmit}>
              <div className="form-card-heading">
                <h2>Your consultation</h2>
                <span>* Required</span>
              </div>
              {error && <FormNotice>{error}</FormNotice>}
              <fieldset>
                <legend>
                  <span>01</span> A little about you
                </legend>
                <div className="form-grid">
                  <FormField
                    label="Full name"
                    placeholder="Full name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                  required
                />
                <FormField
                  label="Company (optional)"
                  placeholder="Company name"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  maxLength={160}
                />
              </fieldset>
              <fieldset>
                <legend>
                  <span>02</span> Your project & preferred time
                </legend>
                <FormField label="Service" required>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                    <option value="Custom Project Architecture">
                      Custom project / Not sure yet
                    </option>
                  </select>
                </FormField>
                <div className="form-grid">
                  <FormField
                    label="Preferred date"
                    type="date"
                    min={minDateString}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                  />
                  <FormField label="Preferred time" required>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                    >
                      {[
                        "10:00",
                        "11:00",
                        "12:00",
                        "14:00",
                        "15:00",
                        "16:00",
                        "17:00",
                        "18:00",
                      ].map((time) => (
                        <option key={time}>{time}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <FormField label="Time zone">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {[
                      "Asia/Kolkata",
                      "America/New_York",
                      "America/Los_Angeles",
                      "Europe/London",
                      "Europe/Berlin",
                      "Asia/Dubai",
                      "Asia/Singapore",
                    ].map((zone) => (
                      <option key={zone} value={zone}>
                        {zone.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </FormField>
                <span className="form-hint">
                  Times are in your selected time zone. Subject to availability.
                </span>
              </fieldset>
              <fieldset>
                <legend>
                  <span>03</span> What do you have in mind?
                </legend>
                <FormField label="Project summary" required>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you want to build, your goals, and your timeline."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    maxLength={2000}
                  />
                </FormField>
                <span className="form-hint">
                  {message.length}/2000 characters
                </span>
              </fieldset>
              <label className="consent-row">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <span>
                  I agree to the <Link to="/privacy">privacy notice</Link> and
                  to being contacted about my request. I understand the
                  appointment needs confirmation.
                </span>
              </label>
              <button
                type="submit"
                className="btn btn-primary form-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending
                    request…
                  </>
                ) : (
                  <>
                    Request a consultation <ArrowRight size={18} />
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
