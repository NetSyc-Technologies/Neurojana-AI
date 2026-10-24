import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug } from '../services/db.js';
import DOMPurify from 'dompurify';
import { ArrowLeft, Clock, Calendar, User, Share2, Check } from 'lucide-react';
import NewsletterBand from '../components/NewsletterBand.jsx';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBlogPostBySlug(slug).then((res) => {
      setPost(res);
      setLoading(false);
    }).catch(() => { setPost(null); setLoading(false); });
  }, [slug]);

  const handleShare = async () => {
    if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(window.location.href); } catch { return; }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p>Loading article...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Article Not Found</h2>
        <p style={{ margin: '1rem 0 2rem' }}>The article you are looking for does not exist or has been moved.</p>
        <Link to="/blog" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Articles</span>
        </Link>
      </main>
    );
  }

  // Safely sanitize content HTML
  const sanitizedContent = DOMPurify.sanitize(post.content || '');

  return (
    <main id="main" className="editorial-page article-page">
      <article className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} />
            <span>All Articles</span>
          </Link>

          {/* Meta Tags & Read Time */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {post.tags?.map((tag) => (
              <span key={tag} className="status-pill draft" style={{ fontSize: '0.78rem' }}>
                {tag}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.25, marginBottom: '1.25rem' }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={15} />
              {post.author || 'Neurojana AI Engineering'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} />
              {post.readTime || '4 min read'}
            </span>
            {post.publishedAt && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} />
                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <button
              onClick={handleShare}
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              aria-label="Share article link"
            >
              {copied ? <Check size={14} color="#059669" /> : <Share2 size={14} />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>

          {/* Article Lead */}
          {post.summary && (
            <p style={{ fontSize: '1.25rem', lineHeight: 1.75, color: 'var(--text-primary)', fontWeight: 500, margin: '2rem 0' }}>
              {post.summary}
            </p>
          )}

          {/* Sanitized Rich Content */}
          <div
            className="prose"
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              marginTop: '2rem',
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Author Footnote */}
          <div style={{ marginTop: '3.5rem', padding: '1.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              About Neurojana AI
            </div>
            <p style={{ fontSize: '0.95rem', margin: 0 }}>
              Neurojana AI builds bespoke digital products, web applications, Android applications, and custom AI systems for businesses looking for engineering precision.
            </p>
          </div>
        </div>
      </article>

      <NewsletterBand source={`blog-${post.slug}`} />
    </main>
  );
}
