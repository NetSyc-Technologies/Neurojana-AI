import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, BookOpen } from "lucide-react";
import { getPublishedBlogPosts } from "../services/db.js";
import NewsletterBand from "../components/NewsletterBand.jsx";
import PageIntro from "../components/PageIntro.jsx";
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getPublishedBlogPosts()
      .then((list) => {
        if (active) setPosts(list);
      })
      .catch(() => {
        if (active)
          setError("Articles could not be loaded. Please try again shortly.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const allTags = ["All", ...new Set(posts.flatMap((p) => p.tags || []))];
  const filteredPosts = posts.filter(
    (post) =>
      ((post.title || "") + " " + (post.summary || ""))
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase()) &&
      (selectedTag === "All" || post.tags?.includes(selectedTag)),
  );
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("All");
  };
  return (
    <main id="main" className="editorial-page journal-page">
      <PageIntro
        eyebrow="THE NEUROJANA JOURNAL"
        title={
          <>
            Ideas, notes,
            <br />
            and <em>perspectives.</em>
          </>
        }
        aside={
          <div className="journal-mark" aria-hidden="true">
            <BookOpen size={64} strokeWidth={0.8} />
            <span>From the studio</span>
          </div>
        }
      >
        <p>
          Thoughts on building better software. Explore web development, mobile
          experiences, and the decisions behind useful digital products.
        </p>
      </PageIntro>
      <section className="section journal-section">
        <div className="container">
          <div className="journal-toolbar">
            <div className="journal-tabs" aria-label="Article categories">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  aria-pressed={selectedTag === tag}
                  className={selectedTag === tag ? "active" : ""}
                >
                  {tag === "All" ? "All articles" : tag}
                </button>
              ))}
            </div>
            <div className="journal-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search articles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search articles"
              />
            </div>
          </div>
          <div className="journal-count" role="status">
            {loading
              ? "Opening the notebook…"
              : filteredPosts.length +
                (filteredPosts.length === 1 ? " article" : " articles")}
          </div>
          {error ? (
            <div className="editorial-empty" role="alert">
              <h2>We couldn’t load the journal.</h2>
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="content-skeleton" aria-label="Loading articles" />
          ) : filteredPosts.length === 0 ? (
            <div className="editorial-empty">
              <BookOpen size={32} strokeWidth={1.2} />
              <h2>
                {posts.length
                  ? "No matches this time."
                  : "The next chapter is on its way."}
              </h2>
              <p>
                {posts.length
                  ? "Try a different search or explore all articles."
                  : "New notes on design, development, and what we’re learning will appear here."}
              </p>
              {posts.length > 0 && (
                <button className="btn btn-secondary" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="journal-grid">
              {filteredPosts.map((post, i) => (
                <article
                  key={post.id}
                  className={
                    "journal-card " + (i === 0 ? "journal-featured" : "")
                  }
                >
                  <Link
                    to={"/blog/" + post.slug}
                    className="journal-cover"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" loading="lazy" />
                    ) : (
                      <div className={"journal-art art-" + (i % 3)}>
                        <span>NEUROJANA / NOTES</span>
                        <div className="journal-art-lines">
                          <i />
                          <i />
                          <i />
                          <i />
                        </div>
                        <span>{post.tags?.[0] || "Ideas & engineering"}</span>
                      </div>
                    )}
                  </Link>
                  <div className="journal-card-body">
                    <div className="article-meta">
                      <span>{post.tags?.[0] || "Engineering"}</span>
                      <span>{post.readTime || "4 min read"}</span>
                    </div>
                    <h2>
                      <Link to={"/blog/" + post.slug}>{post.title}</Link>
                    </h2>
                    <p>{post.summary}</p>
                    <div className="journal-card-footer">
                      <span>{post.author || "Neurojana AI"}</span>
                      <Link
                        to={"/blog/" + post.slug}
                        className="text-link"
                        aria-label={"Read " + post.title}
                      >
                        Read article <ArrowRight size={17} />
                      </Link>
                    </div>
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
