import Link from 'next/link';
import styles from './page.module.css';

const tools = [
  {
    id: 'ams2-race-duration',
    name: 'Race Duration Calculator',
    game: 'Automobilista 2',
    gameShort: 'AMS2',
    description: 'Calculate total laps, fuel requirements, pit stops, and simulated race time using in-game time multipliers.',
    icon: '⏱️',
    accentColor: 'yellow',
    tags: ['Laps', 'Fuel', 'Pit Stops', 'Time Sim'],
    href: '/tools/ams2-race-duration',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`badge badge-yellow animate-fade-in-up ${styles.heroBadge}`}>
            <span>🏎️</span>
            Essential Sim Racing Tools
          </div>

          <h1 className={`animate-fade-in-up-delay-1 ${styles.heroTitle}`}>
            Race Smarter.<br />
            <span className={styles.heroAccent}>Data-Driven.</span>
          </h1>

          <p className={`animate-fade-in-up-delay-2 ${styles.heroSub}`}>
            A growing collection of precision tools for sim racers. Stop guessing — start winning.
          </p>

          <div className={`animate-fade-in-up-delay-3 ${styles.heroCta}`}>
            <Link href="/tools" className="btn btn-primary">
              Browse Tools
            </Link>
            <Link href="/tools/ams2-race-duration" className="btn btn-ghost">
              AMS2 Calculator ↗
            </Link>
          </div>
        </div>

        {/* Decorative element */}
        <div className={styles.heroOrb} aria-hidden="true" />
        <div className={styles.heroOrb2} aria-hidden="true" />
      </section>

      {/* ── Tools Grid ── */}
      <section className={`section ${styles.toolsSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="badge badge-cyan">Tools</span>
            <h2>Available Tools</h2>
            <p>Precision calculators and references built for real sim racing scenarios.</p>
          </div>

          <div className={styles.toolsGrid}>
            {tools.map((tool) => (
              <Link key={tool.id} href={tool.href} className={`glass-card ${styles.toolCard}`}>
                <div className={styles.toolCardTop}>
                  <span className={styles.toolIcon}>{tool.icon}</span>
                  <span className={`badge ${tool.accentColor === 'yellow' ? 'badge-yellow' : 'badge-cyan'}`}>
                    {tool.gameShort}
                  </span>
                </div>

                <div className={styles.toolCardBody}>
                  <h3 className={styles.toolName}>{tool.name}</h3>
                  <p className={styles.toolGame}>{tool.game}</p>
                  <p className={styles.toolDesc}>{tool.description}</p>
                </div>

                <div className={styles.toolCardFooter}>
                  <div className={styles.toolTags}>
                    {tool.tags.map((tag) => (
                      <span key={tag} className={styles.toolTag}>{tag}</span>
                    ))}
                  </div>
                  <span className={styles.toolArrow}>→</span>
                </div>
              </Link>
            ))}

            {/* Coming Soon placeholder */}
            <div className={`glass-card ${styles.toolCard} ${styles.toolCardSoon}`}>
              <div className={styles.toolCardTop}>
                <span className={styles.toolIcon}>🔧</span>
                <span className="badge badge-cyan">Coming Soon</span>
              </div>
              <div className={styles.toolCardBody}>
                <h3 className={styles.toolName}>More Tools</h3>
                <p className={styles.toolDesc}>Tyre strategy calculators, weather planners, and more on the way.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
