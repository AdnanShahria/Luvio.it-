import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Luvio — Your Neighborhood Marketplace & Community',
  description: 'Find local jobs, buy & sell items, and connect with your neighborhood community. Luvio brings neighbors together through services, marketplace, and real-time chat.',
  keywords: ['marketplace', 'community', 'neighborhood', 'jobs', 'services', 'buy sell', 'local'],
  authors: [{ name: 'Luvio' }],
  openGraph: {
    title: 'Luvio — Your Neighborhood Marketplace',
    description: 'Find local jobs, buy & sell items, and connect with your community.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Luvio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luvio — Your Neighborhood Marketplace',
    description: 'Find local jobs, buy & sell items, and connect with your community.',
  },
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}

/**
 * Inline script to prevent flash of wrong theme.
 * Runs before React hydration to set data-theme attribute.
 */
function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('luvio-theme');
        if (!theme) {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch(e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
