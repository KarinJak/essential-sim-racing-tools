import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Tools — ESRT',
  description: 'Browse all essential sim racing tools — calculators, planners and references.',
};

const tools = [
  {
    id: 'ams2-race-duration',
    name: 'Race Duration Calculator',
    game: 'Automobilista 2',
    gameShort: 'AMS2',
    description: 'Calculate total laps, fuel needs, pit stops, and simulated in-game time with configurable time multipliers.',
    icon: '⏱️',
    tags: ['Laps', 'Fuel', 'Pit Stops', 'Time Sim'],
    href: '/tools/ams2-race-duration',
  },
];

export default function ToolsPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.pageHeader}>
          <span className="badge badge-cyan">All Tools</span>
          <h1>Sim Racing Tools</h1>
          <p>Click a tool to open the calculator.</p>
        </header>

        <div className={styles.grid}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.href} className={`glass-card ${styles.card}`}>
              <div className={styles.cardTop}>
                <span className={styles.icon}>{tool.icon}</span>
                <span className="badge badge-yellow">{tool.gameShort}</span>
              </div>
              <h3 className={styles.cardName}>{tool.name}</h3>
              <p className={styles.cardGame}>{tool.game}</p>
              <p className={styles.cardDesc}>{tool.description}</p>
              <div className={styles.cardTags}>
                {tool.tags.map(t => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
