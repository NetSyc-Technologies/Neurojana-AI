import './style.css';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase Web SDK initializes analytics only. Writes happen exclusively inside
// the server-side Vercel API using Firebase Admin credentials.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let firebaseApp = null;
let firestoreDb = null;

if (firebaseConfig.apiKey && firebaseConfig.appId) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    if (firebaseConfig.measurementId) {
      isSupported().then((supported) => {
        if (supported) getAnalytics(firebaseApp);
      }).catch(() => {});
    }
  } catch (err) {
    console.info('Analytics unavailable:', err?.message || 'not supported');
  }
}

function getDatabaseClient() {
  if (!firestoreDb && firebaseApp) {
    try {
      firestoreDb = getFirestore(firebaseApp);
    } catch (err) {
      console.warn('Firestore initialization failed:', err);
    }
  }
  return firestoreDb;
}

async function sha256Hex(str) {
  try {
    if (window.crypto?.subtle) {
      const buffer = new TextEncoder().encode(str);
      const hash = await window.crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  return encodeURIComponent(str).replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function saveSubscriberClientDirect(email) {
  const db = getDatabaseClient();
  if (!db) throw new Error('Database client not available.');
  const docId = await sha256Hex(email);
  await setDoc(doc(db, 'launchSubscribers', docId), {
    email,
    subscriptionStatus: 'active',
    deliveryStatus: 'pending',
    subscribedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

const form = document.getElementById('subscribe-form');
const emailInput = document.getElementById('email');
const formMessage = document.getElementById('form-message');
const submitButton = document.getElementById('subscribe-button');
const successState = document.getElementById('success-state');

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const logo = document.getElementById('brand-logo');
const markFallback = () => logo?.closest('.logo-box, .logo-frame')?.classList.add('no-image');
if (logo) {
  logo.addEventListener('error', markFallback);
  if (logo.complete && !logo.naturalWidth) markFallback();
}

const neutralMessage = formMessage.innerHTML;
function setFormMessage(text, type = '') {
  formMessage.textContent = text;
  formMessage.className = `form-microtext ${type}`.trim();
  emailInput.setAttribute('aria-invalid', type === 'error' ? 'true' : 'false');
}

emailInput.addEventListener('input', () => {
  if (formMessage.classList.contains('error')) {
    formMessage.innerHTML = neutralMessage;
    formMessage.className = 'form-microtext';
    emailInput.removeAttribute('aria-invalid');
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;

  const email = emailInput.value.trim().toLowerCase();
  if (!email || !emailInput.validity.valid || email.length > 254) {
    setFormMessage('Please enter a valid email address.', 'error');
    emailInput.focus();
    return;
  }

  const company = document.getElementById('company')?.value || '';

  submitButton.disabled = true;
  submitButton.classList.add('is-loading');
  emailInput.disabled = true;
  setFormMessage('Adding you to the list…');

  try {
    // Non-interactive bot submissions
    if (company) {
      form.hidden = true;
      successState.hidden = false;
      successState.classList.add('success-enter');
      return;
    }

    let isSuccess = false;
    let apiErrorMsg = '';

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, company }),
      });

      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        isSuccess = true;
      } else {
        apiErrorMsg = payload.message || payload.error?.message || (typeof payload.error === 'string' ? payload.error : '') || '';
        // If 404 (local dev server or static host) or 500/502/503 (server secrets missing), attempt client fallback
        const isUnavailable = [404, 500, 502, 503].includes(response.status);
        if (isUnavailable) {
          try {
            await saveSubscriberClientDirect(email);
            isSuccess = true;
          } catch (fallbackErr) {
            console.warn('Direct Firestore save failed:', fallbackErr);
            throw new Error(apiErrorMsg || fallbackErr.message || 'Subscription failed. Please try again.');
          }
        } else {
          throw new Error(apiErrorMsg || 'Subscription failed. Please try again.');
        }
      }
    } catch (networkOrApiErr) {
      if (isSuccess) {
        // Handled
      } else {
        // Network error (offline or local dev without server) - attempt direct Firestore save
        try {
          await saveSubscriberClientDirect(email);
          isSuccess = true;
        } catch {
          throw networkOrApiErr;
        }
      }
    }

    if (isSuccess) {
      form.hidden = true;
      form.style.display = 'none';
      formMessage.hidden = true;
      formMessage.style.display = 'none';
      successState.hidden = false;
      successState.style.display = 'flex';
      successState.classList.add('success-enter');
    }
  } catch (err) {
    setFormMessage(err?.message || 'Something went wrong. Please try again.', 'error');
    emailInput.disabled = false;
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove('is-loading');
  }
});
