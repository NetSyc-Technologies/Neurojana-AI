import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedBlogPosts } from '../services/db.js';
import { Clock, ArrowRight, Search, Tag } from 'lucide-react';
import NewsletterBand from '../components/NewsletterBand.jsx';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedBlogPosts().then((res) => {
      setPosts(res);
      setLoading(false);
    });
  }, []);

  const allTags = ['All', ...new Set(posts.flatMap((p) => p.tags || []))];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'All' || (post.tags && post.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <main id="main">
      <section className="section" style={{ paddingBottom: '2.5rem' }}>
        <div className="container">
          <div style={{ maxWidth: '720px' }}>
            <div className="eyebrow">
              <span>ENGINEERING NOTEBOOK</span>
            </div>
            <h1>Insights, architectures, and engineering perspectives.</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Practical articles from the Neurojana AI engineering team on scalable web systems, database design, and AI automation.
            </p>
          </div>

          {/* Search & Tag Bar */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ maxWidth: '480px', position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search articles by title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                aria-label="Search articles"
              />
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`btn btn-sm ${selectedTag === tag ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts List */}
      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem 0' }}>Loading articles...</p>
          ) : filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <h3>No articles found</h3>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Try adjusting your search query or tag filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              {filteredPosts.map((post) => (
                <article key={post.id} className="service-card" style={{ padding: '2.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {post.tags?.map((tag) => (
                      <span key={tag} className="status-pill draft" style={{ fontSize: '0.72rem' }}>
                        {tag}
                      </span>
                    ))}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                      <Clock size={12} />
                      {post.readTime || '4 min read'}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', lineHeight: 1.35 }}>
                    <Link to={`/blog/${post.slug}`} style={{ color: 'inherit' }}>
                      {post.title}
                    </Link>
                  </h2>

                  <p style={{ fontSize: '0.96rem', lineHeight: 1.65 }}>{post.summary}</p>

                  <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {post.author || 'Neurojana AI'}
                    </span>
                    <Link to={`/blog/${post.slug}`} className="card-link">
                      <span>Read Article</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsletterBand source="blog" />
    </main>
  );
}
