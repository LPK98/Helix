import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    import('../main.js');
  }, []);

  return (
    <>
      <div id="loader" className="loader" role="status" aria-live="polite">
        <div className="loader-inner">
          <span className="loader-label">Carving the statue</span>
          <b className="loader-pct"><span id="loaderPct">00</span><small>%</small></b>
          <i className="loader-bar"><u id="loaderBar" /></i>
        </div>
      </div>

      <div className="cursor" id="cursor" aria-hidden="true"><i className="cursor-ring" /><i className="cursor-dot" /></div>

      <header className="nav">
        <a className="brand" href="#top" data-go="0"><span className="brand-mark" />STUDIO</a>
        <div className="nav-mid" aria-live="off"><span id="navIdx">01</span><i /><span id="navLabel">Introduction</span></div>
        <div className="nav-right"><span id="navPct">000</span><small>%</small></div>
      </header>

      <nav className="rail" aria-label="Sections">
        <button type="button" className="rail-dot is-active" data-go="0" aria-label="Introduction"><span>Introduction</span></button>
        <button type="button" className="rail-dot" data-go="1" aria-label="Selected work"><span>Selected work</span></button>
        <button type="button" className="rail-dot" data-go="2" aria-label="Index"><span>Index</span></button>
        <button type="button" className="rail-dot" data-go="3" aria-label="Contact"><span>Contact</span></button>
      </nav>

      <section id="introTrack" className="intro-track">
        <div id="introStage" className="intro-stage">
          <div className="hero-weather" aria-hidden="true"><div className="hero-sky" /><div className="hero-horizon-glow" /><div className="hero-night-wash" /><div className="hero-stars" /><div className="hero-vignette" /></div>
          <div className="hero-sculpture" aria-hidden="true"><canvas id="heroSculpture" /></div>
          <div id="introBlock" className="intro-block">
            <div className="kicker"><i />FORM IN MOTION &nbsp;/&nbsp; PHOTOGRAPHY STUDIO</div>
            <h1><span className="line"><span style={{ '--d': '.15s' }}>Through</span></span><span className="line"><span style={{ '--d': '.28s' }}><em>the Light</em></span></span></h1>
            <p>A visual journey through light, time, and the natural world.</p>
            <div className="intro-actions"><button type="button" className="btn" data-go="1"><span>View the work</span><b>&rarr;</b></button><div className="scroll-cue" aria-hidden="true"><span>SCROLL</span><i /></div></div>
          </div>
          <div id="heroCaptions" className="hero-captions" aria-hidden="true"><p><span>I</span>Form, carved by light.</p><p><span>II</span>Every angle casts a new shadow.</p><p><span>III</span>Now, let it move.</p></div>
          <div className="hero-meta" aria-hidden="true"><span>EST. 2026</span><span>PHOTOGRAPHY &middot; MOTION &middot; FORM</span></div>
          <a className="asset-credit" href="https://zenodo.org/records/10355435" target="_blank" rel="noreferrer">3D SCAN: METRON3D &middot; CC BY 4.0</a>
        </div>
      </section>

      <section id="track" className="track">
        <div className="sticky">
          <div id="transitionShade" className="transition-shade" />
          <div id="transitionTitle" className="transition-title">PARAMETRIC HELIX + BENT CARD GEOMETRY</div>
          <div className="editorial"><h2 className="line1">DESIGN<span className="plus-gap">+</span></h2><h2 className="line2">MOTION</h2></div>
          <canvas id="scene" />
          <div className="hud" aria-hidden="true"><span id="hudLeft">02 &mdash; Selected work</span><span id="hudCount">01 / 09</span></div>
          <div className="progress"><i id="bar" /></div>
        </div>
      </section>

      <section id="outro" className="outro">
        <div id="outroBlock" className="outro-block">
          <div className="kicker"><i />NEXT CHAPTER</div>
          <h2>MAKE IT <em>move</em></h2>
          <p className="outro-copy">Have a story that needs light? Let&rsquo;s shape it together.</p>
          <a className="btn btn-solid" href="mailto:hello@studio.example"><span>Start a project</span><b>&rarr;</b></a>
        </div>
        <footer className="foot"><span>&copy; 2026 STUDIO</span><nav><a href="#">Instagram</a><a href="#">Behance</a><a href="mailto:hello@studio.example">Email</a></nav><button type="button" className="foot-top" data-go="0">Back to top &uarr;</button></footer>
      </section>
    </>
  );
}
