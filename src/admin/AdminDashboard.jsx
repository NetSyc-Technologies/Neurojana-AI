import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Inbox,
  FileText,
  Briefcase,
  BookOpen,
  FolderGit2,
  Image as ImageIcon,
  MailCheck,
  Send,
  Sliders,
  History,
  Shield,
  LogOut,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  getSiteSettings,
  updateSiteSettings,
  getAllServices,
  saveService,
  deleteService,
  getAllBlogPosts,
  saveBlogPost,
  getAllProjects,
  saveProject,
  getAllSubscribers,
  getAllAppointments,
  updateAppointmentStatus,
  getAllEmployees,
  saveEmployee,
  getAllInquiries,
  updateInquiryStatus,
  getOutboxItems,
  markOutboxItemCompleted,
  getAllMediaAssets,
  saveMediaAsset,
  deleteMediaAsset,
  getAuditLogs,
} from '../services/db.js';
import { compressImageToBase64 } from '../services/imageCompression.js';
import { emailGateway } from '../services/emailGateway.js';

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({ inquiries: 0, pendingApts: 0, approvedApts: 0, subscribers: 0, posts: 0 });
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentModalMode, setAppointmentModalMode] = useState(''); // 'approve' | 'reschedule' | 'cancel'
  const [selectedOutboxItem, setSelectedOutboxItem] = useState(null);
  const [serviceModal, setServiceModal] = useState(null);
  const [postModal, setPostModal] = useState(null);
  const [employeeModal, setEmployeeModal] = useState(null);

  // Form helpers
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  // Media upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [apts, emps, inqs, srvs, bposts, projs, subs, outb, media, audits, settings] = await Promise.all([
        getAllAppointments(),
        getAllEmployees(),
        getAllInquiries(),
        getAllServices(),
        getAllBlogPosts(),
        getAllProjects(),
        getAllSubscribers(),
        getOutboxItems(),
        getAllMediaAssets(),
        getAuditLogs(),
        getSiteSettings(),
      ]);

      setAppointments(apts);
      setEmployees(emps);
      setInquiries(inqs);
      setServices(srvs);
      setPosts(bposts);
      setProjects(projs);
      setSubscribers(subs);
      setOutbox(outb);
      setMediaAssets(media);
      setAuditLogs(audits);
      setSiteSettings(settings);

      setStats({
        inquiries: inqs.filter((i) => i.status === 'new').length,
        pendingApts: apts.filter((a) => a.status === 'pending_review').length,
        approvedApts: apts.filter((a) => a.status === 'approved').length,
        subscribers: subs.filter((s) => s.subscriptionStatus === 'active').length,
        posts: bposts.filter((p) => p.published).length,
      });
    } catch (err) {
      showToast('Error loading dashboard data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
  }, [isAdmin, navigate]);

  // Handle appointment status transitions
  const handleAppointmentAction = async (status) => {
    if (!selectedAppointment) return;
    try {
      const assignedEmp = employees.find((e) => e.id === assignedEmployeeId) || null;
      await updateAppointmentStatus(selectedAppointment.id, {
        status,
        reason: rescheduleReason,
        proposedDate: rescheduleDate || null,
        proposedTime: rescheduleTime || null,
        meetingLink,
        employee: assignedEmp,
        notes: adminNotes,
        actorEmail: user?.email || 'admin',
      });

      showToast(`Appointment status updated to ${status}. Notification prepared in outbox.`, 'success');
      setSelectedAppointment(null);
      setAppointmentModalMode('');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to update appointment: ' + err.message, 'error');
    }
  };

  // Handle Base64 image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const compressed = await compressImageToBase64(file);
      await saveMediaAsset({
        fileName: compressed.fileName,
        dataBase64: compressed.dataBase64,
        mimeType: compressed.mimeType,
        byteSize: compressed.byteSize,
        width: compressed.width,
        height: compressed.height,
        alt: file.name,
      }, user?.email);

      showToast(`Image uploaded (${Math.round(compressed.byteSize / 1024)} KiB compressed Base64).`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Image processing error: ' + err.message, 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Export Subscribers to CSV
  const handleExportSubscribers = () => {
    const csv = emailGateway.exportSubscribersCSV(subscribers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurojana_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Subscribers CSV exported successfully.', 'success');
  };

  if (!isAdmin) return null;

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div>
            <div className="brand-title">NEUROJANA AI</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN CONSOLE</div>
          </div>
          <button onClick={loadDashboardData} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>

        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <div className="admin-nav-section-title">Operations</div>
          <button className={`admin-nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            <CalendarCheck size={18} />
            <span>Appointments</span>
            {stats.pendingApts > 0 && <span className="badge">{stats.pendingApts}</span>}
          </button>
          <button className={`admin-nav-item ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
            <Users size={18} />
            <span>Employees</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
            <Inbox size={18} />
            <span>Inbox / Leads</span>
            {stats.inquiries > 0 && <span className="badge">{stats.inquiries}</span>}
          </button>

          <div className="admin-nav-section-title">Content & Media</div>
          <button className={`admin-nav-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
            <Briefcase size={18} />
            <span>Services</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'blog' ? 'active' : ''}`} onClick={() => setActiveTab('blog')}>
            <BookOpen size={18} />
            <span>Blog Articles</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>
            <FolderGit2 size={18} />
            <span>Portfolio</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
            <ImageIcon size={18} />
            <span>Media (Base64)</span>
          </button>

          <div className="admin-nav-section-title">Audience & Outbox</div>
          <button className={`admin-nav-item ${activeTab === 'subscribers' ? 'active' : ''}`} onClick={() => setActiveTab('subscribers')}>
            <MailCheck size={18} />
            <span>Subscribers</span>
            <span className="badge">{stats.subscribers}</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'outbox' ? 'active' : ''}`} onClick={() => setActiveTab('outbox')}>
            <Send size={18} />
            <span>Email Outbox</span>
            {outbox.filter((o) => o.status === 'pending_manual').length > 0 && (
              <span className="badge">{outbox.filter((o) => o.status === 'pending_manual').length}</span>
            )}
          </button>

          <div className="admin-nav-section-title">System & Security</div>
          <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Sliders size={18} />
            <span>Site Settings</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            <History size={18} />
            <span>Audit Trail</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'admin_info' ? 'active' : ''}`} onClick={() => setActiveTab('admin_info')}>
            <Shield size={18} />
            <span>Google Profile</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
            {user?.email}
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>
              {activeTab.replace('_', ' ')}
            </h1>
          </div>

          <div className="admin-topbar-right">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>View Live Site</span>
              <ExternalLink size={14} />
            </a>
            <div className="status-pill active" style={{ fontSize: '0.75rem' }}>
              <span>Firestore Connected</span>
            </div>
          </div>
        </header>

        {/* Content View per Tab */}
        <div className="admin-content-area">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Pending Bookings</span>
                  <span className="stat-value" style={{ color: stats.pendingApts > 0 ? '#d97706' : 'inherit' }}>
                    {stats.pendingApts}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Approved Appointments</span>
                  <span className="stat-value" style={{ color: '#059669' }}>{stats.approvedApts}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">New Inbound Leads</span>
                  <span className="stat-value" style={{ color: stats.inquiries > 0 ? '#2563eb' : 'inherit' }}>
                    {stats.inquiries}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Active Subscribers</span>
                  <span className="stat-value">{stats.subscribers}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Published Articles</span>
                  <span className="stat-value">{stats.posts}</span>
                </div>
              </div>

              {/* Recent Appointments Card */}
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>Recent Consultation Requests</h3>
                  <button onClick={() => setActiveTab('appointments')} className="btn btn-secondary btn-sm">
                    <span>View All Appointments</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Requested Slot</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map((apt) => (
                        <tr key={apt.id}>
                          <td><strong>{apt.referenceId || apt.id}</strong></td>
                          <td>
                            <div>{apt.fullName}</div>
                            <small style={{ color: '#64748b' }}>{apt.email}</small>
                          </td>
                          <td>{apt.serviceName}</td>
                          <td>{apt.preferredDate} at {apt.preferredTime}</td>
                          <td>
                            <span className={`status-pill ${apt.status}`}>{apt.status.replace('_', ' ')}</span>
                          </td>
                          <td>
                            <button
                              onClick={() => { setSelectedAppointment(apt); setAppointmentModalMode('approve'); }}
                              className="btn btn-secondary btn-sm"
                            >
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No consultation requests submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>All Consultation Bookings</h3>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ref Code</th>
                        <th>Client</th>
                        <th>Contact</th>
                        <th>Requested Date/Time</th>
                        <th>Service</th>
                        <th>Assigned Staff</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((apt) => (
                        <tr key={apt.id}>
                          <td><strong>{apt.referenceId || apt.id}</strong></td>
                          <td>
                            <strong>{apt.fullName}</strong>
                            {apt.company && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{apt.company}</div>}
                          </td>
                          <td>
                            <div>{apt.email}</div>
                            <small style={{ color: '#64748b' }}>{apt.phone}</small>
                          </td>
                          <td>
                            <div>{apt.proposedDate || apt.preferredDate} at {apt.proposedTime || apt.preferredTime}</div>
                            <small style={{ color: '#64748b' }}>{apt.timezone}</small>
                          </td>
                          <td>{apt.serviceName}</td>
                          <td>{apt.assignedEmployeeName || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                          <td>
                            <span className={`status-pill ${apt.status}`}>{apt.status.replace('_', ' ')}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => { setSelectedAppointment(apt); setAppointmentModalMode('approve'); }}
                                className="btn btn-secondary btn-sm"
                              >
                                <span>Manage</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No appointments found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMPLOYEES */}
          {activeTab === 'employees' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>Staff Directory</h3>
                  <button onClick={() => setEmployeeModal({ fullName: '', email: '', phone: '', role: 'Engineering Lead', active: true })} className="btn btn-primary btn-sm">
                    <Plus size={16} />
                    <span>Add Employee</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Work Email</th>
                        <th>Phone</th>
                        <th>Role / Designation</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td><strong>{emp.fullName}</strong></td>
                          <td>{emp.email}</td>
                          <td>{emp.phone || 'N/A'}</td>
                          <td>{emp.role}</td>
                          <td>
                            <span className={`status-pill ${emp.active ? 'active' : 'cancelled_by_admin'}`}>
                              {emp.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => setEmployeeModal(emp)} className="btn btn-secondary btn-sm">
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {employees.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No employees saved yet. Add staff profiles to assign them to consultations.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INBOX / LEADS */}
          {activeTab === 'inbox' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>Inbound Contact Leads</h3>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message Preview</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => (
                        <tr key={inq.id}>
                          <td><strong>{inq.name}</strong></td>
                          <td>{inq.email}</td>
                          <td>{inq.subject}</td>
                          <td style={{ maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {inq.message}
                          </td>
                          <td>
                            <span className={`status-pill ${inq.status}`}>{inq.status}</span>
                          </td>
                          <td>
                            <button
                              onClick={async () => {
                                const nextStatus = inq.status === 'new' ? 'responded' : 'archived';
                                await updateInquiryStatus(inq.id, nextStatus, '', user?.email);
                                showToast(`Inquiry marked as ${nextStatus}`, 'success');
                                loadDashboardData();
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              <span>{inq.status === 'new' ? 'Mark Responded' : 'Archive'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {inquiries.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No contact inquiries yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>Services CMS</h3>
                  <button
                    onClick={() => setServiceModal({ title: '', slug: '', category: 'Engineering', summary: '', description: '', published: true, order: services.length + 1 })}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={16} />
                    <span>Create Service</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Category</th>
                        <th>Order</th>
                        <th>Published</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((srv) => (
                        <tr key={srv.id}>
                          <td><strong>{srv.title}</strong></td>
                          <td><code>/services/{srv.slug}</code></td>
                          <td>{srv.category}</td>
                          <td>{srv.order}</td>
                          <td>
                            <span className={`status-pill ${srv.published ? 'published' : 'draft'}`}>
                              {srv.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button onClick={() => setServiceModal(srv)} className="btn btn-secondary btn-sm">
                                <Edit size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete service "${srv.title}"?`)) {
                                    await deleteService(srv.id, user?.email);
                                    showToast('Service deleted', 'success');
                                    loadDashboardData();
                                  }
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#ef4444' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BLOG */}
          {activeTab === 'blog' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>Engineering Articles</h3>
                  <button
                    onClick={() => setPostModal({ title: '', slug: '', author: 'Neurojana AI', readTime: '4 min read', summary: '', content: '<p>Write article body...</p>', tags: ['Engineering'], published: true })}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={16} />
                    <span>New Article</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Author</th>
                        <th>Read Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.id}>
                          <td><strong>{post.title}</strong></td>
                          <td><code>/blog/{post.slug}</code></td>
                          <td>{post.author}</td>
                          <td>{post.readTime}</td>
                          <td>
                            <span className={`status-pill ${post.published ? 'published' : 'draft'}`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => setPostModal(post)} className="btn btn-secondary btn-sm">
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEDIA LIBRARY (BASE64 IN FIRESTORE) */}
          {activeTab === 'media' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Media Assets (Base64 in Firestore)</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                      Images are compressed to WebP/JPEG (&lt;200 KiB target, &lt;750 KiB limit) and stored directly in Firestore.
                    </p>
                  </div>

                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                    <Plus size={16} />
                    <span>{uploadingImage ? 'Compressing...' : 'Upload Image'}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                  </label>
                </div>

                <div className="media-grid">
                  {mediaAssets.map((asset) => (
                    <div key={asset.id} className="media-card">
                      <div className="media-thumb-box">
                        <img src={asset.dataBase64} alt={asset.alt || asset.fileName} />
                      </div>
                      <div className="media-info">
                        <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.fileName}</strong>
                        <span style={{ color: '#64748b' }}>{Math.round((asset.byteSize || 0) / 1024)} KiB · {asset.mimeType}</span>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(asset.dataBase64);
                              showToast('Base64 string copied to clipboard', 'success');
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1, fontSize: '0.75rem', padding: '0.3rem' }}
                          >
                            <Copy size={12} />
                            <span>Copy</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this media asset?')) {
                                await deleteMediaAsset(asset.id, user?.email);
                                showToast('Asset deleted', 'success');
                                loadDashboardData();
                              }
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#ef4444', padding: '0.3rem' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {mediaAssets.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No media assets uploaded yet. Upload JPEG, PNG, or WebP images.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Audience & Subscribers</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Merged records from unified subscribers & legacy launch subscribers.
                    </p>
                  </div>
                  <button onClick={handleExportSubscribers} className="btn btn-primary btn-sm">
                    <Download size={16} />
                    <span>Export Opt-in CSV</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Consent Recorded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub.id || sub.email}>
                          <td><strong>{sub.email}</strong></td>
                          <td>
                            <span className={`status-pill ${sub.subscriptionStatus}`}>
                              {sub.subscriptionStatus}
                            </span>
                          </td>
                          <td>{sub.source || 'website'}</td>
                          <td>{sub.consentMarketing ? 'Yes (Affirmative)' : 'No'}</td>
                        </tr>
                      ))}
                      {subscribers.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No subscribers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMAIL OUTBOX */}
          {activeTab === 'outbox' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Email Outbox (Strict Frontend Mode)</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Prepared notification drafts. Resend secrets are never stored in client code. Review and dispatch via mailto: or view rendered template.
                    </p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outbox.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.recipientName || item.recipient}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.recipient}</div>
                          </td>
                          <td>{item.type}</td>
                          <td>{item.subject}</td>
                          <td>
                            <span className={`status-pill ${item.status}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => setSelectedOutboxItem(item)}
                                className="btn btn-secondary btn-sm"
                              >
                                <Eye size={14} />
                                <span>Preview</span>
                              </button>

                              {item.status === 'pending_manual' && (
                                <a
                                  href={emailGateway.generateMailtoLink(item.recipient, item.subject, item.textBody)}
                                  onClick={() => markOutboxItemCompleted(item.id, user?.email)}
                                  className="btn btn-primary btn-sm"
                                  title="Open in Mail Client & Mark Completed"
                                >
                                  <Send size={14} />
                                  <span>Dispatch mailto:</span>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {outbox.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            Email outbox is empty.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '640px' }}>
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>Global Website Settings</h3>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await updateSiteSettings(siteSettings, user?.email);
                    showToast('Settings saved to Firestore', 'success');
                  }}
                  style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div className="form-group">
                    <label className="form-label">Company Public Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={siteSettings.companyName || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, companyName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={siteSettings.contactEmail || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Consultation Timezone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={siteSettings.defaultTimezone || 'Asia/Kolkata'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, defaultTimezone: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                    <span>Save Site Settings</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div>
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>Activity & Audit Trail</h3>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Details</th>
                        <th>Actor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td><strong>{log.action}</strong></td>
                          <td>{log.targetType} ({log.targetId})</td>
                          <td>{log.details}</td>
                          <td>{log.actorEmail}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No audit events logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GOOGLE PROFILE & SECURITY CHECKLIST */}
          {activeTab === 'admin_info' && (
            <div style={{ maxWidth: '640px' }}>
              <div className="data-card">
                <div className="data-card-header">
                  <h3 style={{ fontSize: '1.15rem' }}>Active Google Identity</h3>
                </div>

                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Verified Email:</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user?.email}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Google UID:</span>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{user?.uid}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Admin Status:</span>
                    <div style={{ color: '#059669', fontWeight: 700 }}>✓ Allowlist Authorized</div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <button onClick={logout} className="btn btn-secondary" style={{ color: '#ef4444' }}>
                      <LogOut size={16} />
                      <span>Sign Out from Admin Session</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* APPOINTMENT REVIEW MODAL */}
      {selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
              Manage Appointment: {selectedAppointment.referenceId || selectedAppointment.id}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              Client: <strong>{selectedAppointment.fullName}</strong> ({selectedAppointment.email} / {selectedAppointment.phone})
            </p>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div><strong>Service:</strong> {selectedAppointment.serviceName}</div>
              <div><strong>Requested:</strong> {selectedAppointment.preferredDate} at {selectedAppointment.preferredTime} ({selectedAppointment.timezone})</div>
              {selectedAppointment.message && <div style={{ marginTop: '0.5rem' }}><strong>Requirements:</strong> {selectedAppointment.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Assign Employee</label>
              <select
                className="form-control"
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.role})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Meeting Link (Google Meet / Zoom)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://meet.google.com/xyz-abc"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Notes</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Notes on client requirements or agenda..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleAppointmentAction('approved')} className="btn btn-primary">
                <CheckCircle2 size={16} />
                <span>Approve & Queue Notice</span>
              </button>
              <button onClick={() => handleAppointmentAction('rejected')} className="btn btn-secondary" style={{ color: '#ef4444' }}>
                <XCircle size={16} />
                <span>Reject</span>
              </button>
              <button onClick={() => setSelectedAppointment(null)} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OUTBOX ITEM PREVIEW MODAL */}
      {selectedOutboxItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Outbox Notice Preview</h2>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem' }}>
              <div><strong>Recipient:</strong> {selectedOutboxItem.recipient}</div>
              <div><strong>Subject:</strong> {selectedOutboxItem.subject}</div>
              <div><strong>Status:</strong> {selectedOutboxItem.status}</div>
            </div>

            <div className="outbox-rendered-body" dangerouslySetInnerHTML={{ __html: selectedOutboxItem.htmlBody }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <a
                href={emailGateway.generateMailtoLink(selectedOutboxItem.recipient, selectedOutboxItem.subject, selectedOutboxItem.textBody)}
                onClick={() => {
                  markOutboxItemCompleted(selectedOutboxItem.id, user?.email);
                  setSelectedOutboxItem(null);
                  loadDashboardData();
                }}
                className="btn btn-primary"
              >
                <Send size={16} />
                <span>Dispatch via Mail Client</span>
              </a>

              <button onClick={() => setSelectedOutboxItem(null)} className="btn btn-secondary">
                <span>Close Preview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE ADD/EDIT MODAL */}
      {employeeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
              {employeeModal.id ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveEmployee(employeeModal, user?.email);
                showToast('Employee saved', 'success');
                setEmployeeModal(null);
                loadDashboardData();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={employeeModal.fullName}
                  onChange={(e) => setEmployeeModal({ ...employeeModal, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={employeeModal.email}
                  onChange={(e) => setEmployeeModal({ ...employeeModal, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={employeeModal.phone || ''}
                  onChange={(e) => setEmployeeModal({ ...employeeModal, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={employeeModal.role || ''}
                  onChange={(e) => setEmployeeModal({ ...employeeModal, role: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary"><span>Save Employee</span></button>
                <button type="button" onClick={() => setEmployeeModal(null)} className="btn btn-secondary"><span>Cancel</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE EDIT MODAL */}
      {serviceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
              {serviceModal.id ? 'Edit Service' : 'Create Service'}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveService(serviceModal, user?.email);
                showToast('Service saved', 'success');
                setServiceModal(null);
                loadDashboardData();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="form-group">
                <label className="form-label">Service Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={serviceModal.title}
                  onChange={(e) => setServiceModal({ ...serviceModal, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  className="form-control"
                  value={serviceModal.slug}
                  onChange={(e) => setServiceModal({ ...serviceModal, slug: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Summary</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={serviceModal.summary || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, summary: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="srvPub"
                  checked={Boolean(serviceModal.published)}
                  onChange={(e) => setServiceModal({ ...serviceModal, published: e.target.checked })}
                />
                <label htmlFor="srvPub">Published on live website</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary"><span>Save Service</span></button>
                <button type="button" onClick={() => setServiceModal(null)} className="btn btn-secondary"><span>Cancel</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
