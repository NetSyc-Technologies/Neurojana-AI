import React, { useRef } from 'react';
import { ArrowUpRight, Play, X, Code2, Smartphone, Layers } from 'lucide-react';

/** A deliberately illustrative composition, using the unmodified brand asset. */
export default function BrandShowcase() {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const closeFilm = () => {
    videoRef.current?.pause();
    dialogRef.current?.close();
  };

  return (
    <div className="brand-showcase">
      <div className="showcase-canvas" aria-hidden="true">
        <div className="showcase-grid" />
        <span className="showcase-index">IDEA → INTERFACE</span>
        <div className="interface-window">
          <div className="window-chrome"><span /><span /><span /><div>Built around your business</div><ArrowUpRight size={13} /></div>
          <div className="window-content">
            <div className="window-wordmark">NEUROJANA AI <span>↗</span></div>
            <div className="window-feature">
              <div><span className="mini-label">THOUGHTFULLY ENGINEERED</span><strong>Made for<br /><em>what’s next.</em></strong><span className="mini-button">Explore the possibilities <ArrowUpRight size={12} /></span></div>
              <img src="/assets/logo.png" width="1254" height="1254" alt="" />
            </div>
            <div className="window-modules"><span><Code2 size={15} />Web experiences</span><span><Layers size={15} />Connected systems</span></div>
          </div>
        </div>
        <div className="interface-phone">
          <div className="phone-speaker" />
          <div className="phone-screen"><img src="/assets/logo.png" width="1254" height="1254" alt="" /><span>Good to go.</span><div className="phone-tile"><Smartphone size={19} /><span>Built for<br /><strong>everyday life.</strong></span></div><div className="phone-line" /><div className="phone-line short" /><div className="phone-action"><ArrowUpRight size={17} /></div></div>
          <div className="phone-home" />
        </div>
        <div className="showcase-note"><span className="note-dot" />One idea. Every screen.</div>
        <span className="showcase-corner">DESIGN / DEVELOP / DELIVER</span>
      </div>
      <div className="showcase-footer"><span>Web. Mobile. Everything in between.</span><button type="button" className="film-trigger" onClick={() => dialogRef.current?.showModal()}><Play size={12} />Brand film</button></div>
      <dialog ref={dialogRef} className="brand-film-dialog" aria-labelledby="brand-film-title" onClose={() => videoRef.current?.pause()} onClick={(event) => { if (event.target === event.currentTarget) closeFilm(); }}>
        <div className="film-dialog-header"><h2 id="brand-film-title">Meet Neurojana AI</h2><button type="button" aria-label="Close brand film" onClick={closeFilm}><X size={20} /></button></div>
        <video ref={videoRef} src="/assets/logo.mp4" controls playsInline preload="none" poster="/assets/logo.png" aria-label="Neurojana AI brand film" />
      </dialog>
    </div>
  );
}
