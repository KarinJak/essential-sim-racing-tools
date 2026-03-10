import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ESRT — Essential Sim Racing Tools',
  description:
    'A collection of essential tools for sim racers — calculators, planners, and references to help you race smarter.',
  keywords: [
    'sim racing',
    'AMS2',
    'Automobilista 2',
    'race calculator',
    'fuel calculator',
    'sim tools',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main
          style={{
            minHeight: `calc(100vh - var(--nav-height))`,
            paddingTop: 'var(--nav-height)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
