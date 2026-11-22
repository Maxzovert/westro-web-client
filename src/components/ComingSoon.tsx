"use client";

export function ComingSoon() {
  return (
    <main className="coming-soon" aria-label="Wastro coming soon">
      <div className="coming-soon-bg" aria-hidden="true">
        <img src="/coming-soon-bg.jpg" alt="" width={1260} height={720} decoding="async" fetchPriority="high" />
      </div>

      <div className="coming-soon-scrim" aria-hidden="true" />

      <img
        className="coming-soon-logo"
        src="/logo.png"
        alt="Wastro"
        width={639}
        height={280}
        decoding="async"
        fetchPriority="high"
      />

      <figure className="coming-soon-hero">
        <img
          src="/coming-soon-team.png"
          alt="Wastro medical professionals in scrubs"
          width={2880}
          height={1754}
          decoding="async"
          fetchPriority="high"
        />
      </figure>

      <section className="coming-soon-copy">
        <h1 className="coming-soon-title">
          It&apos;s Not a Dress.
          <span>
            It&apos;s an <em>Armor.</em>
          </span>
        </h1>

        <p className="coming-soon-text">Premium medical apparel for professionals.</p>

        <span className="coming-soon-badge">coming soon</span>

        <p className="coming-soon-note">A brand of Wastro Group</p>
      </section>
    </main>
  );
}
