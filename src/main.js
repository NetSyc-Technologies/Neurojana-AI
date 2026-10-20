import './style.css';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Subscriber writes and confirmation emails are handled by /api/subscribe.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
if (firebaseConfig.apiKey && firebaseConfig.appId) {
  try {
    const app = initializeApp(firebaseConfig);
    if (firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported) getAnalytics(app);
      }).catch(() => {});
    }
  } catch { /* Analytics must never interrupt the page. */ }
}

const form = document.getElementById('subscribe-form');
const emailInput = document.getElementById('email');
const formMessage = document.getElementById('form-message');
const submitButton = document.getElementById('subscribe-button');
const successState = document.getElementById('success-state');
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const logo = document.getElementById('brand-logo');
const markFallback = () => logo?.closest('.logo-box')?.classList.add('no-image');
if (logo) {
  logo.addEventListener('error', markFallback);
  if (logo.complete && !logo.naturalWidth) markFallback();
}

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.getElementById('motion-toggle');
let motionPaused = motionQuery.matches;
try { motionPaused ||= localStorage.getItem('neurojna-motion') === 'paused'; } catch {}
function updateMotion() {
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  motionButton.textContent = motionPaused ? 'Resume motion' : 'Pause motion';
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  // The system preference takes priority; no misleading resume control.
  motionButton.hidden = motionQuery.matches;
}
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  try { localStorage.setItem('neurojna-motion', motionPaused ? 'paused' : 'playing'); } catch {}
  updateMotion();
});
motionQuery.addEventListener('change', () => {
  motionPaused = motionQuery.matches;
  try { motionPaused ||= localStorage.getItem('neurojna-motion') === 'paused'; } catch {}
  updateMotion();
});
updateMotion();

const neutralMessage = formMessage.textContent;
function setFormMessage(text, type = '') {
  formMessage.textContent = text;
  formMessage.className = `form-microtext ${type}`.trim();
  emailInput.setAttribute('aria-invalid', String(type === 'error'));
}
emailInput.addEventListener('input', () => {
  if (formMessage.classList.contains('error')) {
    setFormMessage(neutralMessage);
    emailInput.removeAttribute('aria-invalid');
  }
});
function showSuccess() {
  form.hidden = true;
  formMessage.hidden = true;
  successState.hidden = false;
  successState.classList.add('success-enter');
  successState.focus();
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;
  const email = emailInput.value.trim().toLowerCase();
  emailInput.value = email;
  if (!email || !emailInput.validity.valid || email.length > 254) {
    setFormMessage('Please enter a valid email address.', 'error');
    emailInput.focus();
    return;
  }
  const company = document.getElementById('company')?.value || '';
  if (company) { showSuccess(); return; }
  submitButton.disabled = true;
  submitButton.classList.add('is-loading');
  form.setAttribute('aria-busy', 'true');
  emailInput.disabled = true;
  setFormMessage('Adding you to the list…');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, company }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || typeof payload.message !== 'string') {
      const message = response.status === 429
        ? 'Too many attempts. Please try again later.'
        : 'We couldn’t add you just yet. Please try again, or email contact@neurojnaai.com.';
      throw new Error(message);
    }
    showSuccess();
  } catch (err) {
    const message = err?.name === 'AbortError'
      ? 'This is taking longer than expected. Please try again.'
      : err instanceof TypeError
        ? 'Unable to connect. Check your connection and try again.'
        : err?.message || 'Something went wrong. Please try again.';
    setFormMessage(message, 'error');
    emailInput.disabled = false;
    emailInput.focus();
  } finally {
    clearTimeout(timeout);
    submitButton.disabled = false;
    submitButton.classList.remove('is-loading');
    form.removeAttribute('aria-busy');
  }
});
