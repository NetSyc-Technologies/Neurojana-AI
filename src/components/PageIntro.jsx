import React from "react";
export default function PageIntro({ eyebrow, title, children, aside }) {
  return (
    <header className="page-intro">
      <div className="container page-intro-grid">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {children && <div className="page-intro-copy">{children}</div>}
        </div>
        {aside && <div className="page-intro-aside">{aside}</div>}
      </div>
    </header>
  );
}
export function SoftwareSketch() {
  return (
    <div className="software-sketch" aria-hidden="true">
      <div className="sketch-window">
        <div className="sketch-toolbar">
          <i />
          <i />
          <i />
          <span>neurojana ai</span>
        </div>
        <div className="sketch-content">
          <div className="sketch-sidebar">
            <img src="/assets/logo.png" alt="" />
            <i />
            <i />
            <i />
          </div>
          <div className="sketch-workspace">
            <span className="sketch-caption">
              A little clarity. A lot of possibility.
            </span>
            <div className="sketch-line" />
            <div className="sketch-line short" />
            <div className="sketch-chart">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="sketch-tiles">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
      <span className="sketch-note">
        Thoughtfully designed. Carefully built.
      </span>
    </div>
  );
}
