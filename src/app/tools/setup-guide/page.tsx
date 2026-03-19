import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';
import SetupGuide from '@/components/tools/SetupGuide';

export const metadata: Metadata = {
  title: 'Setup Guide — ESRT',
  description:
    'Interactive car setup troubleshooter — select your handling problem and corner phase to get tailored recommendations for springs, ARBs, dampers, aero, differential, and more.',
};

export default function SetupGuidePage() {
  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/tools" className={styles.breadcrumbLink}>
            Tools
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>Setup Guide</span>
        </nav>

        {/* Header */}
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <span className="badge badge-yellow">All Sims</span>
            <h1 className={styles.pageTitle}>Car Setup Guide</h1>
            <p className={styles.pageDesc}>
              Your virtual race engineer — describe the handling problem and when it
              happens, and get specific setup recommendations to fix it. Works for any sim.
            </p>
          </div>
        </header>

        {/* Setup Guide */}
        <SetupGuide />
      </div>
    </div>
  );
}
