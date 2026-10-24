import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import DOMPurify from "dompurify";
import { getPublishedProjects } from "../services/db.js";
import NewsletterBand from "../components/NewsletterBand.jsx";
import PageIntro, { SoftwareSketch } from "../components/PageIntro.jsx";
export default function PortfolioPage() {
  const { slug } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getPublishedProjects()
      .then((list) => {
        if (active) setProjects(list);
      })
      .catch(() => {
        if (active)
          setError("We couldn’t load the projects. Please try again shortly.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const project = projects.find((p) => p.slug === slug);
  if (slug && !loading)
    return (
      <main id="main" className="editorial-page">
        <PageIntro
          eyebrow="SELECTED WORK"
          title={project?.title || "Project not found."}
        >
          <p>
            {project?.summary ||
              "This case study may have moved or is not yet published."}
          </p>
          <Link className="text-link" to="/portfolio">
            <ArrowLeft size={16} /> All work
          </Link>
        </PageIntro>
        {project && (
          <section className="section">
            <div className="container project-detail">
              {project.coverImage && (
                <img
                  className="project-detail-cover"
                  src={project.coverImage}
                  alt={project.title}
                />
              )}
              {project.content && (
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(project.content),
                  }}
                />
              )}
              {project.description && <p>{project.description}</p>}
              <Link to="/contact" className="btn btn-primary">
                Discuss a similar project <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}
        <NewsletterBand source="portfolio" />
      </main>
    );
  return (
    <main id="main" className="editorial-page portfolio-page">
      <PageIntro
        eyebrow="SELECTED WORK"
        title={
          <>
            Ideas made
            <br />
            <em>real.</em>
          </>
        }
        aside={
          <p className="intro-margin-note">
            Web. Mobile. Custom software.
            <br />
            Built with purpose.
          </p>
        }
      >
        <p>
          A closer look at the digital products and platforms we build.
          Thoughtful design, considered engineering, and practical outcomes.
        </p>
      </PageIntro>
      <section className="section work-section">
        <div className="container">
          <div className="collection-heading">
            <span>THE WORK</span>
            <span>
              {loading
                ? "Loading…"
                : projects.length
                  ? String(projects.length).padStart(2, "0") + " projects"
                  : "Case studies"}
            </span>
          </div>
          {loading ? (
            <div
              className="content-skeleton"
              role="status"
              aria-label="Loading projects"
            />
          ) : error ? (
            <div className="editorial-empty" role="alert">
              <h2>We’ll be right back.</h2>
              <p>{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="work-preview">
              <SoftwareSketch />
              <div className="work-preview-copy">
                <span className="eyebrow">
                  <LockKeyhole size={14} /> CLIENT PRIVACY, ALWAYS
                </span>
                <h2>
                  Good work.
                  <br />
                  <em>Shared with care.</em>
                </h2>
                <p>
                  We publish case studies with our clients’ permission. While we
                  prepare the next collection, let’s talk about what we could
                  build for you.
                </p>
                <Link to="/contact" className="btn btn-primary">
                  Discuss your project <ArrowRight size={17} />
                </Link>
                <Link to="/services" className="text-link">
                  Explore our services <ArrowRight size={16} />
                </Link>
                <small>Illustrative interface — not a client project.</small>
              </div>
            </div>
          ) : (
            <div className="work-grid">
              {projects.map((p, i) => (
                <article className="work-card" key={p.id}>
                  <Link
                    to={"/portfolio/" + p.slug}
                    className="work-card-image"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {p.coverImage ? (
                      <img src={p.coverImage} alt="" loading="lazy" />
                    ) : (
                      <SoftwareSketch />
                    )}
                  </Link>
                  <div className="work-card-heading">
                    <h2>
                      <Link to={"/portfolio/" + p.slug}>{p.title}</Link>
                    </h2>
                    <span className="item-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p>{p.summary}</p>
                  <Link
                    className="text-link"
                    to={"/portfolio/" + p.slug}
                    aria-label={"View " + p.title}
                  >
                    View case study <ArrowRight size={17} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <NewsletterBand source="portfolio" />
    </main>
  );
}
