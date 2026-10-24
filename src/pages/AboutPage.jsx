import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, Smartphone, Workflow } from "lucide-react";
import NewsletterBand from "../components/NewsletterBand.jsx";
import PageIntro, { SoftwareSketch } from "../components/PageIntro.jsx";
const principles = [
  [
    "Understand first.",
    "We start with your business, your users, and the problem worth solving. The technology follows.",
  ],
  [
    "Make it useful.",
    "Clear interfaces, dependable performance, and the details that make everyday work easier.",
  ],
  [
    "Build to last.",
    "Maintainable code and considered architecture give your software room to grow with you.",
  ],
  [
    "Work together.",
    "A shared direction, clear communication, and room for feedback throughout the project.",
  ],
];
export default function AboutPage() {
  return (
    <main id="main" className="editorial-page about-page">
      <PageIntro
        eyebrow="ABOUT NEUROJANA AI"
        title={
          <>
            Good software starts
            <br />
            with <em>understanding.</em>
          </>
        }
        aside={
          <div className="intro-note">
            <img src="/assets/logo.png" alt="Neurojana AI official logo" />
            <p>
              An IT services company.
              <br />A partner in what’s next.
            </p>
          </div>
        }
      >
        <p>
          We turn business ideas into websites, web applications, Android apps,
          and custom software — with care for the people who use them.
        </p>
      </PageIntro>
      <section className="section about-story">
        <div className="container story-grid">
          <SoftwareSketch />
          <div className="story-copy">
            <span className="eyebrow">PURPOSE, BEFORE TECHNOLOGY</span>
            <h2>
              Built around
              <br />
              <em>your business.</em>
            </h2>
            <p>
              Neurojana AI brings design and software development together. From
              a company’s first website to the systems behind its daily
              operations, we help make the next step practical.
            </p>
            <p>
              AI is one part of our toolkit. We use it where it adds value,
              alongside the web, mobile, and software engineering your project
              needs.
            </p>
            <Link to="/services" className="text-link">
              Explore our services <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section principles-section">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <span className="eyebrow">HOW WE THINK</span>
              <h2>
                A few things
                <br />
                we <em>stand by.</em>
              </h2>
            </div>
            <p>
              The way we work matters just as much as the software we deliver.
            </p>
          </div>
          <div className="principle-grid">
            {principles.map(([title, copy], i) => (
              <article key={title} className="principle-item">
                <span className="item-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container capability-strip">
          {[
            [
              Code2,
              "Websites & web applications",
              "From your online presence to the platform your business runs on.",
            ],
            [
              Smartphone,
              "Android applications",
              "Purposeful mobile experiences, designed for everyday use.",
            ],
            [
              Workflow,
              "Custom software & AI",
              "Tools, integrations, and automation built around your workflow.",
            ],
          ].map(([Icon, title, copy]) => (
            <article key={title}>
              <Icon size={24} strokeWidth={1.4} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container">
        <div className="editorial-cta">
          <div>
            <span className="eyebrow">LET’S BUILD SOMETHING USEFUL</span>
            <h2>
              Your idea. <em>Our next conversation.</em>
            </h2>
          </div>
          <Link to="/book-appointment" className="btn btn-primary">
            Book a consultation <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <NewsletterBand source="about" />
    </main>
  );
}
