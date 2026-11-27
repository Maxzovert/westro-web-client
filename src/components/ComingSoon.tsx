"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const collections = [
  ["medflex", "MedFlex", "Everyday scrubs"],
  ["aeroflex", "AeroFlex", "Stretch scrubs"],
  ["coreflex", "CoreFlex", "Doctor coats"],
];

function SpringLogo() {
  const drag = useRef<{ start: number; offset: number; id: number } | null>(null);

  const spring = useRef<Animation | null>(null);

  function rebound(button: HTMLButtonElement, distance: number) {
    spring.current?.cancel();
    button.style.translate = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frames = Array.from({ length: 61 }, (_, i) => ({
      translate: "0 " + (i === 60 ? 0 : Math.max(-4, distance * Math.exp(-i / 11) * Math.cos(i / 4.7))) + "px",
    }));
    spring.current = button.animate(frames, { duration: 940 });
  }

  return (
    <button className="hung-sign" type="button" aria-label="Pull and release the Wastro logo"
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        const button = event.currentTarget;
        const current = parseFloat(getComputedStyle(button).translate.split(" ")[1]) || 0;
        spring.current?.cancel();
        button.style.translate = "0 " + current + "px";
        drag.current = { start: event.clientY - current, offset: current, id: event.pointerId };
        button.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const pull = drag.current;
        if (!pull || pull.id !== event.pointerId) return;
        const delta = Math.max(0, event.clientY - pull.start);
        pull.offset = 110 * (1 - Math.exp(-delta / 110));
        event.currentTarget.style.translate = "0 " + pull.offset + "px";
      }}
      onLostPointerCapture={(event) => {
        const pull = drag.current;
        if (!pull || pull.id !== event.pointerId) return;
        drag.current = null;
        rebound(event.currentTarget, pull.offset || 8);
      }}
      onClick={(event) => { if (event.detail === 0) rebound(event.currentTarget, 35); }}>
      <Image unoptimized src="/logo.png" alt="" width={130} height={57} priority draggable={false} />
    </button>
  );
}

function LaunchRibbons() {
  return (
    <aside className="launch-ribbons" aria-label="Launching on 1 January 2027. Medical apparel. Scrubs and doctor coats.">
      {["Launching on 1 January 2027", "Medical apparel　·　Scrubs　·　Doctor coats"].map(line => (
        <div key={line} className="launch-ribbon" aria-hidden="true"><div className="ribbon-track">
          {[0, 1].map(copy => <span key={copy}>{(line + "　✦　").repeat(4)}</span>)}
        </div></div>
      ))}
    </aside>
  );
}
function StorefrontPreview() {
  const [paused, setPaused] = useState(false);
  return (
    <figure className="display-case" aria-label="Animated preview of the Wastro collection" data-paused={paused}>
      <div className="browser-bar">
        <span className="window-dots" aria-hidden="true">● ● ●</span>
        <span>Storefront preview</span>
        <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "Play preview animation" : "Pause preview animation"}>{paused ? "▶" : "Ⅱ"}</button>
      </div>
      <div className="preview-nav" aria-hidden="true">
        <Image unoptimized src="/logo.png" alt="" width={72} height={32} />
        <span>Shop　 /　 Collections</span>
      </div>
      <div className="preview-window">
        <div className="preview-roll">
          <div className="preview-hero">
            <Image src="/launch/team.webp" alt="Medical team wearing Wastro scrubs" fill quality={90} sizes="(max-width: 600px) 92vw, min(90vw, 81svh, 864px)" priority />
            <div><small>Medical apparel</small><b>Made for<br />every shift.</b></div>
          </div>
          <section className="preview-catalog">
            <h2>The collections</h2>
            <div className="preview-products">{collections.map(([slug, name, detail]) => (
              <div key={slug}><Image src={'/launch/' + slug + '.webp'} quality={90} sizes="(max-width: 600px) 29vw, min(28vw, 26svh, 270px)" width={240} height={280} alt={detail} /><strong>{name}</strong><small>{detail}</small></div>
            ))}</div>
          </section>
        </div>
      </div>
    </figure>
  );
}

export function ComingSoon() {
  return (
    <main className="runway" aria-labelledby="poster-title">
      <SpringLogo />
      <div className="poster-heading">
        <p>Stay tuned</p>
        <h1 id="poster-title"><span>Coming</span> <span>soon</span></h1>
      </div>
      <StorefrontPreview />
      <LaunchRibbons />
      <footer>A brand of <strong>Wastro Group</strong></footer>
    </main>
  );
}
