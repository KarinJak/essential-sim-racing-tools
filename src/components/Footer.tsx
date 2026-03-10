import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logoText}>ESRT</span>
          <p className={styles.tagline}>Race smarter, not harder.</p>
        </div>
        <p className={styles.copy}>
          © {new Date().getFullYear()} Essential Sim Racing Tools &mdash; Built for sim racers, by
          sim racers.
        </p>
      </div>
    </footer>
  );
}
