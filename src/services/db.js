/**
 * Neurojana AI — Central Cloud Firestore Data Layer
 * Handles public queries, admin mutations, audit logging, and data compatibility.
 */

import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from './firebase.js';
import { emailGateway, renderAppointmentReceivedEmail, renderAppointmentApprovedCustomerEmail, renderAppointmentApprovedEmployeeEmail, renderAppointmentRescheduledEmail } from './emailGateway.js';

// Fallback seed services (truthful, credible digital engineering offerings)
export const DEFAULT_SERVICES = [
  {
    id: 'web-development',
    slug: 'web-development',
    title: 'Website Design & Development',
    category: 'Engineering',
    summary: 'High-performance, accessible, responsive websites engineered with modern web standards and tailored to convert visitors into clients.',
    description: 'We design and engineer bespoke web solutions that establish immediate authority and credibility. Every build focuses on sub-second load times, strict accessibility, fluid typography, responsive layouts across all viewports, and clean maintainable code.',
    scope: ['Custom responsive design systems', 'Semantic HTML5 & clean vanilla/React architectures', 'Core Web Vitals & performance optimization', 'Search Engine Optimization (SEO) & structured schema data', 'Content management integration'],
    technologies: ['React', 'TypeScript', 'Next.js / Vite', 'Vanilla CSS', 'Cloudflare / Vercel'],
    deliverables: ['Production deployment & DNS setup', 'Mobile & tablet optimized layouts', 'Cross-browser testing suite', 'SEO metadata & XML sitemaps'],
    faqs: [
      { question: 'What is your typical turnaround time for a custom website?', answer: 'A focused, highly polished marketing or corporate site typically takes 2 to 4 weeks depending on scope, content readiness, and interactive requirements.' },
      { question: 'Do you use pre-made generic templates?', answer: 'No. All our digital products are built with tailored design tokens, purposeful whitespace, and custom code tailored specifically to your brand identity.' }
    ],
    published: true,
    order: 1,
    featured: true,
  },
  {
    id: 'web-applications',
    slug: 'web-applications',
    title: 'Web Application Development',
    category: 'Engineering',
    summary: 'Complex browser-based portals, client dashboards, and interactive SaaS platforms with real-time state management.',
    description: 'When standard websites are not enough, we build resilient web applications with rich user interfaces, secure authentication, reactive data synchronizations, and role-based permissions.',
    scope: ['Interactive client portals & dashboards', 'Role-based access control (RBAC)', 'Real-time database synchronizations', 'Third-party API integrations & webhooks', 'Automated testing and continuous delivery'],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Cloud Firestore', 'REST & GraphQL'],
    deliverables: ['Production application architecture', 'Admin control center', 'Data validation & security layers', 'Technical documentation & handover'],
    faqs: [
      { question: 'Can you integrate our existing backend or database?', answer: 'Yes. We frequently integrate with existing REST APIs, GraphQL endpoints, SQL databases, or enterprise auth providers.' }
    ],
    published: true,
    order: 2,
    featured: true,
  },
  {
    id: 'custom-software',
    slug: 'custom-software',
    title: 'Custom Software Engineering',
    category: 'Software Solutions',
    summary: 'Tailor-made software architectures and internal tools designed around your unique operational workflows.',
    description: 'We engineer bespoke software systems that replace fragile spreadsheets and disjointed tools with unified, dependable software that scales alongside your business.',
    scope: ['Workflow automation engines', 'Internal operational management tools', 'Data pipeline integrations', 'System refactoring & modernization'],
    technologies: ['Node.js', 'Python', 'TypeScript', 'Docker', 'Cloud Infrastructure'],
    deliverables: ['Documented system architecture', 'Custom automation workflows', 'Deployment pipelines', 'Source code & IP transfer'],
    faqs: [
      { question: 'Do we own the full source code and intellectual property?', answer: 'Yes. Upon project completion, 100% of the source code, repositories, and intellectual property belong exclusively to you.' }
    ],
    published: true,
    order: 3,
    featured: true,
  },
  {
    id: 'android-applications',
    slug: 'android-applications',
    title: 'Android Application Development',
    category: 'Mobile',
    summary: 'Native and modern cross-platform Android mobile applications engineered for reliability, fluidity, and offline capability.',
    description: 'Bring your core services directly into your users’ hands with polished, responsive Android mobile applications engineered for performance across the vast spectrum of Android devices.',
    scope: ['Native Android & modern multiplatform UI', 'Offline-first local caching & synchronization', 'Push notification orchestration', 'Google Play Store release management'],
    technologies: ['Kotlin', 'Jetpack Compose', 'Android SDK', 'SQLite / Room'],
    deliverables: ['Production APK / App Bundle', 'Play Store compliance submission', 'Crash monitoring & analytics integration'],
    faqs: [
      { question: 'Do you assist with publishing on Google Play Store?', answer: 'Yes, we guide you through developer account setup, store listing optimization, screenshot creation, and release track rollout.' }
    ],
    published: true,
    order: 4,
    featured: true,
  },
  {
    id: 'ui-ux-design',
    slug: 'ui-ux-design',
    title: 'UI/UX & Product Design',
    category: 'Design',
    summary: 'Refined user experience design, wireframing, high-fidelity prototypes, and comprehensive design tokens.',
    description: 'We craft digital interfaces that feel calm, intentional, and effortless to navigate. From user journey mapping to component library creation, we prioritize usability, cognitive clarity, and aesthetic distinction.',
    scope: ['User journey mapping & information architecture', 'Interactive component design systems', 'High-fidelity Figma prototypes', 'Usability audits & accessibility compliance'],
    technologies: ['Figma', 'Design Tokens', 'WCAG 2.2 Standards', 'Design Systems'],
    deliverables: ['Figma design source files', 'Design token specifications', 'Interactive click-through prototype', 'Component library handover'],
    faqs: [
      { question: 'Can you redesign an existing, outdated application?', answer: 'Yes. We regularly conduct UX audits and redesign existing applications to elevate aesthetics, speed up task completion, and modernize the visual identity.' }
    ],
    published: true,
    order: 5,
    featured: true,
  },
  {
    id: 'ai-integrations',
    slug: 'ai-integrations',
    title: 'AI Integrations & Workflow Automation',
    category: 'Artificial Intelligence',
    summary: 'Practical, reliable AI-enabled capabilities embedded directly into your software and business processes.',
    description: 'We help businesses leverage modern artificial intelligence with purpose. Instead of gimmicky novelty chatbots, we embed reliable AI for document processing, intelligent classification, semantic search, and operational automation.',
    scope: ['Semantic search & retrieval-augmented generation (RAG)', 'Intelligent document parsing & data extraction', 'Automated customer inquiry classification', 'Agentic workflow automation'],
    technologies: ['Python', 'OpenAI / Gemini SDKs', 'Vector Databases', 'LangChain / LlamaIndex'],
    deliverables: ['Custom AI pipeline integration', 'Evaluation & guardrail benchmarks', 'API endpoints & observability monitoring'],
    faqs: [
      { question: 'How do you prevent hallucinations and data leakage?', answer: 'We implement strict guardrails, retrieval-augmented grounding, input/output validation, and private VPC routing to ensure sensitive corporate data is never exposed to public training sets.' }
    ],
    published: true,
    order: 6,
    featured: true,
  }
];

export const DEFAULT_BLOG_POSTS = [
  {
    id: 'building-performant-web-apps-2026',
    slug: 'building-performant-web-apps-2026',
    title: 'Engineering for Speed: Architecture Decisions That Truly Matter in 2026',
    summary: 'Why sub-second load times and minimal JavaScript footprints continue to outperform heavy framework abstractions for high-converting business applications.',
    content: `
      <h2>The True Cost of Framework Bloat</h2>
      <p>In modern web engineering, speed is not merely a technical benchmark—it is the foundational pillar of user trust, search rankings, and conversion rates. When users encounter an interface that responds instantaneously to every click and tap, the perceived credibility of the business increases immediately.</p>
      
      <h2>Core Principles of Clean Architecture</h2>
      <p>To achieve sub-second LCP (Largest Contentful Paint) and zero CLS (Cumulative Layout Shift), engineering teams must focus on:</p>
      <ul>
        <li><strong>Restrained asset bundles:</strong> Eliminate megabytes of unnecessary client libraries. Load only what is needed for the active viewport.</li>
        <li><strong>Intentional Design Tokens:</strong> Centralize CSS custom properties for spacing, typography, and color to eliminate stylesheet duplication.</li>
        <li><strong>Pragmatic Serverless Boundaries:</strong> Keep sensitive secrets on trusted serverless backends while allowing the frontend client to render instantly without server bottlenecks.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Simplicity and architectural discipline consistently outperform over-engineered abstractions. At Neurojana AI, every system we deliver is measured against strict performance and accessibility standards.</p>
    `,
    author: 'Engineering Lead, Neurojana AI',
    readTime: '4 min read',
    tags: ['Architecture', 'Performance', 'Web Development'],
    published: true,
    publishedAt: new Date().toISOString(),
    featured: true,
  },
  {
    id: 'practical-ai-integrations-for-business',
    slug: 'practical-ai-integrations-for-business',
    title: 'Beyond the Hype: Practical AI Integrations That Deliver Measurable ROI',
    summary: 'How engineering teams can successfully embed large language models and intelligent automation into everyday business operations.',
    content: `
      <h2>Avoiding the Novelty Trap</h2>
      <p>Many organizations rush to install generic AI chatbots on their homepages only to find that users find them frustrating and unhelpful. Real business value from modern AI occurs when intelligent models are applied to structured, high-friction operational bottlenecks.</p>
      
      <h2>High-Impact Automation Patterns</h2>
      <p>Three areas where practical AI engineering produces immediate returns:</p>
      <ol>
        <li><strong>Intelligent Document Parsing:</strong> Automatically extracting structured line items from PDFs, invoices, and contracts directly into your database.</li>
        <li><strong>Semantic Knowledge Search:</strong> Enabling team members to search internal documentation and client histories with natural language queries that understand intent.</li>
        <li><strong>Automated Inquiry Routing:</strong> Categorizing inbound customer leads and triaging them to the appropriate department within seconds.</li>
      </ol>

      <p>The key to success is pairing AI models with deterministic validation layers, robust error boundaries, and human-in-the-loop review.</p>
    `,
    author: 'AI Solutions Architect, Neurojana AI',
    readTime: '5 min read',
    tags: ['AI Integrations', 'Automation', 'Productivity'],
    published: true,
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    featured: true,
  }
];

export const DEFAULT_SITE_SETTINGS = {
  companyName: 'Neurojana AI',
  legalName: 'Neurojana AI',
  contactEmail: 'contact@neurojanaai.com',
  futureUpdateEmail: 'updates@neurojanaai.com',
  primaryDomain: 'neurojanaai.com',
  tagline: 'Translating ideas into software that matters.',
  description: 'IT solutions, bespoke web and mobile applications, custom software engineering, and AI-enabled digital services.',
  consultationDurations: [30, 45, 60],
  defaultTimezone: 'Asia/Kolkata',
  blackoutDates: [],
  maintenanceMode: false,
};

// ==================== SITE SETTINGS ====================

export async function getSiteSettings() {
  try {
    const docRef = doc(db, 'site_settings', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...snap.data() };
    }
  } catch (err) {
    console.warn('Using default site settings (Firestore offline or empty):', err?.message);
  }
  return DEFAULT_SITE_SETTINGS;
}

export async function updateSiteSettings(settings, actorEmail = 'admin') {
  const docRef = doc(db, 'site_settings', 'general');
  const payload = {
    ...settings,
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, payload, { merge: true });
  await logAdminAction({
    action: 'update_site_settings',
    targetType: 'site_settings',
    targetId: 'general',
    details: 'Updated global site settings',
    actorEmail,
  });
  return payload;
}

// ==================== SERVICES ====================

export async function getPublishedServices() {
  try {
    const colRef = collection(db, 'services');
    const q = query(colRef, where('published', '==', true), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Falling back to default published services:', err?.message);
  }
  return DEFAULT_SERVICES.filter((s) => s.published);
}

export async function getAllServices() {
  try {
    const colRef = collection(db, 'services');
    const q = query(colRef, orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Falling back to default services list:', err?.message);
  }
  return DEFAULT_SERVICES;
}

export async function getServiceBySlug(slug) {
  const all = await getAllServices();
  return all.find((s) => s.slug === slug) || null;
}

export async function saveService(serviceData, actorEmail = 'admin') {
  const id = serviceData.id || serviceData.slug || `srv-${Date.now()}`;
  const docRef = doc(db, 'services', id);
  const payload = {
    ...serviceData,
    id,
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, payload, { merge: true });
  await logAdminAction({
    action: 'save_service',
    targetType: 'service',
    targetId: id,
    details: `Saved service ${serviceData.title}`,
    actorEmail,
  });
  return payload;
}

export async function deleteService(id, actorEmail = 'admin') {
  await deleteDoc(doc(db, 'services', id));
  await logAdminAction({
    action: 'delete_service',
    targetType: 'service',
    targetId: id,
    details: `Deleted service ${id}`,
    actorEmail,
  });
}

// ==================== BLOG POSTS ====================

export async function getPublishedBlogPosts() {
  try {
    const colRef = collection(db, 'blog_posts');
    const q = query(colRef, where('published', '==', true), orderBy('publishedAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Falling back to default blog posts:', err?.message);
  }
  return DEFAULT_BLOG_POSTS.filter((p) => p.published);
}

export async function getAllBlogPosts() {
  try {
    const colRef = collection(db, 'blog_posts');
    const q = query(colRef, orderBy('publishedAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Falling back to default blog posts:', err?.message);
  }
  return DEFAULT_BLOG_POSTS;
}

export async function getBlogPostBySlug(slug) {
  const all = await getAllBlogPosts();
  return all.find((p) => p.slug === slug) || null;
}

export async function saveBlogPost(postData, actorEmail = 'admin') {
  const id = postData.id || postData.slug || `post-${Date.now()}`;
  const docRef = doc(db, 'blog_posts', id);
  const payload = {
    ...postData,
    id,
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, payload, { merge: true });
  await logAdminAction({
    action: 'save_blog_post',
    targetType: 'blog_post',
    targetId: id,
    details: `Saved post ${postData.title}`,
    actorEmail,
  });
  return payload;
}

// ==================== PORTFOLIO / CASE STUDIES ====================

export async function getPublishedProjects() {
  try {
    const colRef = collection(db, 'portfolio');
    const q = query(colRef, where('published', '==', true), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Portfolio empty or offline:', err?.message);
  }
  return [];
}

export async function getAllProjects() {
  try {
    const colRef = collection(db, 'portfolio');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Portfolio list fallback:', err?.message);
  }
  return [];
}

export async function saveProject(projectData, actorEmail = 'admin') {
  const id = projectData.id || projectData.slug || `proj-${Date.now()}`;
  const docRef = doc(db, 'portfolio', id);
  const payload = {
    ...projectData,
    id,
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, payload, { merge: true });
  await logAdminAction({
    action: 'save_project',
    targetType: 'portfolio',
    targetId: id,
    details: `Saved project ${projectData.title}`,
    actorEmail,
  });
  return payload;
}

// ==================== SUBSCRIBER MANAGEMENT & MIGRATION ====================

/**
 * Normalizes email address
 */
export function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Hash generator for subscriber doc IDs (sha256 equivalent in browser)
 */
async function hashEmail(email) {
  const utf8 = new TextEncoder().encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Subscribe to newsletter with confirmation email dispatch via /api/subscribe
 */
export async function subscribeNewsletter({ email, source = 'homepage', consentMarketing = true }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes('@') || normalized.length > 254) {
    throw new Error('Please enter a valid email address.');
  }

  // 1. Send confirmation email via /api/subscribe (Resend API)
  let apiResult = null;
  let apiErrorMessage = null;
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: normalized, source, consentMarketing }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.emailId) {
      apiErrorMessage = data?.message || 'Subscription delivery failed. Please try again.';
    } else {
      apiResult = data;
    }
  } catch (fetchErr) {
    console.warn('Subscription API fetch error:', fetchErr?.message);
    apiErrorMessage = 'Unable to connect to subscription service. Please check your connection and try again.';
  }

  if (apiErrorMessage) {
    throw new Error(apiErrorMessage);
  }

  // The server normally persists the record; do not overwrite its timestamps or
  // attempt a client update that Firestore correctly restricts to administrators.
  if (apiResult?.persisted) return apiResult;

  // 2. Persist subscriber in Firestore
  const docId = await hashEmail(normalized);
  const docRef = doc(db, 'subscribers', docId);

  const payload = {
    email: normalized,
    subscriptionStatus: 'active',
    source,
    consentMarketing: Boolean(consentMarketing),
    consentTimestamp: serverTimestamp(),
    deliveryStatus: 'sent',
    confirmationEmailId: apiResult?.emailId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    throw new Error('Your confirmation email was sent, but we couldn’t save your subscription. Please contact us so we can complete it.');
  }

  return { id: docId, ...payload, message: apiResult?.message || 'Subscription successful! Please check your inbox.' };
}

/**
 * Admin view: Fetch all subscribers merged from both unified 'subscribers' and legacy 'launchSubscribers'
 */
export async function getAllSubscribers() {
  const subscriberMap = new Map();

  // 1. Fetch from unified subscribers
  try {
    const snap = await getDocs(collection(db, 'subscribers'));
    snap.forEach((d) => {
      const data = d.data();
      subscriberMap.set(data.email || d.id, { id: d.id, ...data });
    });
  } catch (err) {
    console.warn('Subscribers collection error:', err?.message);
  }

  // 2. Fetch from legacy launchSubscribers and merge non-destructively
  try {
    const legacySnap = await getDocs(collection(db, 'launchSubscribers'));
    legacySnap.forEach((d) => {
      const data = d.data();
      const email = data.email || d.id;
      if (!subscriberMap.has(email)) {
        subscriberMap.set(email, {
          id: d.id,
          email,
          subscriptionStatus: data.subscriptionStatus || 'active',
          source: 'coming_soon_migration',
          consentMarketing: true,
          createdAt: data.subscribedAt || data.updatedAt || null,
          deliveryStatus: data.deliveryStatus || 'sent',
          isLegacy: true,
        });
      }
    });
  } catch (err) {
    console.warn('Legacy launchSubscribers read (may not exist yet):', err?.message);
  }

  return Array.from(subscriberMap.values());
}

/**
 * Unsubscribe an email address
 */
export async function unsubscribeEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) throw new Error('Invalid email.');
  const docId = await hashEmail(normalized);
  const docRef = doc(db, 'subscribers', docId);

  await setDoc(
    docRef,
    {
      subscriptionStatus: 'unsubscribed',
      unsubscribedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

// ==================== APPOINTMENTS & STATE MACHINE ====================

/**
 * Collision-resistant reference code generator (e.g. NJA-APT-8F4A2190)
 */
function generateAppointmentRef() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NJA-APT-${code}`;
}

export async function createAppointmentRequest(data) {
  const referenceId = generateAppointmentRef();
  const appointmentId = referenceId;
  const docRef = doc(db, 'appointments', appointmentId);

  const payload = {
    referenceId,
    fullName: data.fullName,
    email: normalizeEmail(data.email),
    phone: data.phone || '',
    company: data.company || '',
    serviceName: data.serviceName,
    preferredDate: data.preferredDate,
    preferredTime: data.preferredTime,
    timezone: data.timezone || 'Asia/Kolkata',
    message: data.message || '',
    status: 'pending_review', // Public can NEVER set approved or assign employee
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    assignedEmployeeEmail: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // A receipt is only valid after the appointment is durably saved.
  await setDoc(docRef, payload);
  try {
    // Public users cannot write administrative history. Failure here must not
    // turn a successfully saved appointment into a failed booking.
    const historyCol = collection(db, 'appointments', appointmentId, 'history');
    await addDoc(historyCol, {
      status: 'pending_review',
      action: 'created_by_client',
      timestamp: serverTimestamp(),
      notes: 'Initial booking request submitted by client.',
    }).catch(() => {});

    // Prepare manual outbox email notice for administrative dispatch
    const notice = renderAppointmentReceivedEmail({
      fullName: payload.fullName,
      referenceId,
      serviceName: payload.serviceName,
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      timezone: payload.timezone,
    });

    await emailGateway.queueNotice({
      type: 'appointment_received_customer',
      recipient: payload.email,
      recipientName: payload.fullName,
      appointmentId,
      ...notice,
    });
  } catch (err) {
    console.warn('Appointment saved; optional notification could not be queued:', err?.message);
  }

  return { id: appointmentId, ...payload };
}

export async function getAllAppointments() {
  try {
    const snap = await getDocs(collection(db, 'appointments'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Appointments fetch fallback:', err?.message);
    return [];
  }
}

/**
 * Admin: Update appointment state machine, assign staff, and prepare outbox notices
 */
export async function updateAppointmentStatus(appointmentId, {
  status,
  reason = '',
  proposedDate = null,
  proposedTime = null,
  meetingLink = null,
  employee = null,
  notes = '',
  actorEmail = 'admin',
}) {
  const docRef = doc(db, 'appointments', appointmentId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Appointment not found.');
  const current = snap.data();

  const effectiveDate = proposedDate || current.proposedDate || current.preferredDate;
  const effectiveTime = proposedTime || current.proposedTime || current.preferredTime;
  const isTimeAdjusted = Boolean(
    (effectiveDate && effectiveDate !== current.preferredDate) ||
    (effectiveTime && effectiveTime !== current.preferredTime)
  );

  const updateData = {
    status,
    scheduledDate: effectiveDate,
    scheduledTime: effectiveTime,
    proposedDate: effectiveDate,
    proposedTime: effectiveTime,
    notes: notes || current.notes || '',
    updatedAt: serverTimestamp(),
  };

  if (meetingLink !== undefined && meetingLink !== null) {
    updateData.meetingLink = meetingLink;
  }

  if (employee) {
    updateData.assignedEmployeeId = employee.id;
    updateData.assignedEmployeeName = employee.fullName;
    updateData.assignedEmployeeEmail = employee.email;
    updateData.assignedEmployeePhone = employee.phone || '';
  }

  await updateDoc(docRef, updateData);

  // Append to audit history subcollection
  const historyCol = collection(db, 'appointments', appointmentId, 'history');
  await addDoc(historyCol, {
    status,
    previousStatus: current.status,
    reason,
    proposedDate: effectiveDate,
    proposedTime: effectiveTime,
    isTimeAdjusted,
    employeeId: employee?.id || null,
    actorEmail,
    timestamp: serverTimestamp(),
    notes,
  });

  // Prepare and dispatch corresponding email notices
  let customerEmailSent = false;
  let customerEmailId = null;
  let customerEmailError = null;

  if (status === 'approved') {
    const custNotice = renderAppointmentApprovedCustomerEmail({
      fullName: current.fullName,
      company: current.company || '',
      referenceId: current.referenceId || appointmentId,
      serviceName: current.serviceName,
      date: effectiveDate,
      time: effectiveTime,
      timezone: current.timezone,
      meetingLink: meetingLink !== undefined && meetingLink !== null ? meetingLink : (current.meetingLink || ''),
      notes,
      originalDate: current.preferredDate,
      originalTime: current.preferredTime,
      isAdjusted: isTimeAdjusted,
      assignedEmployeeName: employee?.fullName || current.assignedEmployeeName || '',
      assignedEmployeeRole: employee?.role || '',
      clientMessage: current.message || '',
    });

    try {
      const emailRes = await fetch('/api/send-appointment-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: current.email,
          subject: custNotice.subject,
          html: custNotice.html,
          text: custNotice.text,
          appointmentId,
        }),
      });
      const emailData = await emailRes.json().catch(() => null);
      if (emailRes.ok && emailData?.emailId) {
        customerEmailSent = true;
        customerEmailId = emailData.emailId;
      } else {
        customerEmailError = emailData?.message || 'Email delivery failed';
        console.warn('Appointment email delivery warning:', customerEmailError);
      }
    } catch (err) {
      customerEmailError = err?.message || 'Connection error';
      console.warn('Failed to send appointment confirmation email:', err);
    }

    await emailGateway.queueNotice({
      type: 'appointment_approved_customer',
      recipient: current.email,
      recipientName: current.fullName,
      appointmentId,
      status: customerEmailSent ? 'sent' : 'pending_manual',
      emailId: customerEmailId,
      ...custNotice,
    });

    if (employee && employee.email) {
      const empNotice = renderAppointmentApprovedEmployeeEmail({
        employeeName: employee.fullName,
        customerName: current.fullName,
        customerEmail: current.email,
        customerPhone: current.phone,
        company: current.company || '',
        referenceId: current.referenceId || appointmentId,
        serviceName: current.serviceName,
        date: effectiveDate,
        time: effectiveTime,
        timezone: current.timezone,
        meetingLink: meetingLink !== undefined && meetingLink !== null ? meetingLink : (current.meetingLink || ''),
        notes,
        clientMessage: current.message || '',
      });

      let empEmailSent = false;
      try {
        const empRes = await fetch('/api/send-appointment-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: employee.email,
            subject: empNotice.subject,
            html: empNotice.html,
            text: empNotice.text,
            appointmentId,
          }),
        });
        const empData = await empRes.json().catch(() => null);
        if (empRes.ok && empData?.emailId) {
          empEmailSent = true;
        }
      } catch (empErr) {
        console.warn('Failed to send employee notice email:', empErr);
      }

      await emailGateway.queueNotice({
        type: 'appointment_approved_employee',
        recipient: employee.email,
        recipientName: employee.fullName,
        appointmentId,
        employeeId: employee.id,
        status: empEmailSent ? 'sent' : 'pending_manual',
        ...empNotice,
      });
    }
  } else if (status === 'reschedule_proposed') {
    const reschedNotice = renderAppointmentRescheduledEmail({
      fullName: current.fullName,
      company: current.company || '',
      referenceId: current.referenceId || appointmentId,
      serviceName: current.serviceName,
      proposedDate: effectiveDate,
      proposedTime: effectiveTime,
      originalDate: current.preferredDate,
      originalTime: current.preferredTime,
      timezone: current.timezone,
      reason,
      notes,
    });

    let reschedEmailSent = false;
    try {
      const reschedRes = await fetch('/api/send-appointment-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: current.email,
          subject: reschedNotice.subject,
          html: reschedNotice.html,
          text: reschedNotice.text,
          appointmentId,
        }),
      });
      const reschedData = await reschedRes.json().catch(() => null);
      if (reschedRes.ok && reschedData?.emailId) {
        reschedEmailSent = true;
      }
    } catch (rErr) {
      console.warn('Failed to send reschedule notice email:', rErr);
    }

    await emailGateway.queueNotice({
      type: 'appointment_rescheduled_customer',
      recipient: current.email,
      recipientName: current.fullName,
      appointmentId,
      status: reschedEmailSent ? 'sent' : 'pending_manual',
      ...reschedNotice,
    });
  }

  await logAdminAction({
    action: `appointment_status_${status}`,
    targetType: 'appointment',
    targetId: appointmentId,
    details: `Updated appointment to ${status}${employee ? ` (assigned to ${employee.fullName})` : ''}`,
    actorEmail,
  });

  return { ...current, ...updateData, customerEmailSent, customerEmailId, customerEmailError };
}

/**
 * Admin: Delete appointment document and log the action
 */
export async function deleteAppointment(appointmentId, actorEmail = 'admin') {
  const docRef = doc(db, 'appointments', appointmentId);
  await deleteDoc(docRef);
  await logAdminAction({
    action: 'delete_appointment',
    targetType: 'appointment',
    targetId: appointmentId,
    details: `Deleted appointment ${appointmentId}`,
    actorEmail,
  });
}

// ==================== EMPLOYEES DIRECTORY ====================

export async function getAllEmployees() {
  try {
    const snap = await getDocs(collection(db, 'employees'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Employees fetch fallback:', err?.message);
    return [];
  }
}

export async function saveEmployee(empData, actorEmail = 'admin') {
  const id = empData.id || `emp-${Date.now()}`;
  const docRef = doc(db, 'employees', id);
  const payload = {
    ...empData,
    id,
    active: empData.active !== false,
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, payload, { merge: true });
  await logAdminAction({
    action: 'save_employee',
    targetType: 'employee',
    targetId: id,
    details: `Saved employee profile for ${empData.fullName}`,
    actorEmail,
  });
  return payload;
}

// ==================== CONTACT INQUIRIES ====================

export async function submitContactInquiry(data) {
  const colRef = collection(db, 'contact_inquiries');
  const payload = {
    name: data.name,
    email: normalizeEmail(data.email),
    phone: data.phone || '',
    company: data.company || '',
    service: data.service || 'General Inquiry',
    subject: data.subject || 'Website Inquiry',
    message: data.message,
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(colRef, payload);
  return { id: docRef.id, ...payload };
}

export async function getAllInquiries() {
  try {
    const snap = await getDocs(collection(db, 'contact_inquiries'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Inquiries fetch fallback:', err?.message);
    return [];
  }
}

export async function updateInquiryStatus(id, status, notes = '', actorEmail = 'admin') {
  const docRef = doc(db, 'contact_inquiries', id);
  await updateDoc(docRef, { status, internalNotes: notes, updatedAt: serverTimestamp() });
  await logAdminAction({
    action: `inquiry_status_${status}`,
    targetType: 'contact_inquiry',
    targetId: id,
    details: `Inquiry status changed to ${status}`,
    actorEmail,
  });
}

// ==================== EMAIL OUTBOX & CAMPAIGNS ====================

export async function getOutboxItems() {
  try {
    const snap = await getDocs(collection(db, 'email_outbox'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Outbox items fetch fallback:', err?.message);
    return [];
  }
}

export async function markOutboxItemCompleted(id, actorEmail = 'admin') {
  const docRef = doc(db, 'email_outbox', id);
  await updateDoc(docRef, {
    status: 'manually_completed',
    dispatchedBy: actorEmail,
    dispatchedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logAdminAction({
    action: 'outbox_manual_completed',
    targetType: 'email_outbox',
    targetId: id,
    details: 'Marked email outbox item as manually completed',
    actorEmail,
  });
}

// ==================== BASE64 MEDIA ASSETS ====================

export async function getAllMediaAssets() {
  try {
    const snap = await getDocs(collection(db, 'media_assets'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Media assets fetch fallback:', err?.message);
    return [];
  }
}

export async function saveMediaAsset(assetData, actorEmail = 'admin') {
  const id = assetData.id || `media-${Date.now()}`;
  const docRef = doc(db, 'media_assets', id);
  const payload = {
    ...assetData,
    id,
    createdAt: serverTimestamp(),
  };
  await setDoc(docRef, payload);
  await logAdminAction({
    action: 'upload_media_asset',
    targetType: 'media_asset',
    targetId: id,
    details: `Uploaded Base64 image asset ${assetData.fileName} (${Math.round((assetData.byteSize || 0) / 1024)} KiB)`,
    actorEmail,
  });
  return payload;
}

export async function deleteMediaAsset(id, actorEmail = 'admin') {
  await deleteDoc(doc(db, 'media_assets', id));
  await logAdminAction({
    action: 'delete_media_asset',
    targetType: 'media_asset',
    targetId: id,
    details: `Deleted media asset ${id}`,
    actorEmail,
  });
}

// ==================== AUDIT LOGGING ====================

export async function logAdminAction({ action, targetType, targetId, details, actorEmail = 'admin' }) {
  try {
    const colRef = collection(db, 'audit_logs');
    await addDoc(colRef, {
      action,
      targetType,
      targetId,
      details,
      actorEmail,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Audit log write error:', err?.message);
  }
}

export async function getAuditLogs() {
  try {
    const snap = await getDocs(collection(db, 'audit_logs'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Audit logs fetch fallback:', err?.message);
    return [];
  }
}
