import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';
import BopCalculator from '@/components/tools/BopCalculator';

export const metadata: Metadata = {
  title: 'BoP Calculator — ESRT',
  description:
    'Calculate recommended Ballast and Restrictor values to balance your race grid. Enter fastest lap times and get instant BoP recommendations.',
};

export default function BopCalculatorPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/tools" className={styles.breadcrumbLink}>Tools</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>BoP Calculator</span>
        </nav>

        {/* Header */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className="badge badge-cyan">Assetto Corsa</span>
            <h1 className={styles.pageTitle}>Balance of Performance Calculator</h1>
            <p className={styles.pageDesc}>
              Enter fastest lap times with zero BoP applied, select your track type, and get instant
              recommendations for Ballast&nbsp;(kg) and Restrictor&nbsp;(%) to balance the field.
            </p>
          </div>
        </header>

        {/* Calculator */}
        <BopCalculator />
      </div>
    </div>
  );
}
