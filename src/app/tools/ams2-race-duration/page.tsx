import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';
import RaceDurationCalculator from '@/components/tools/RaceDurationCalculator';

export const metadata: Metadata = {
  title: 'AMS2 Race Duration Calculator — ESRT',
  description:
    'Calculate total laps, fuel requirements, pit stop strategy and simulated race time for Automobilista 2.',
};

export default function AMS2RaceDurationPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/tools" className={styles.breadcrumbLink}>Tools</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>Race Duration Calculator</span>
        </nav>

        {/* Header */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className="badge badge-yellow">AMS2</span>
            <h1 className={styles.pageTitle}>Race Duration Calculator</h1>
            <p className={styles.pageDesc}>
              Enter your race settings to instantly calculate laps, fuel strategy, pit stops, and
              simulate in-game day/night progression using AMS&nbsp;2&apos;s time multiplier.
            </p>
          </div>
        </header>

        {/* Calculator */}
        <RaceDurationCalculator />
      </div>
    </div>
  );
}
