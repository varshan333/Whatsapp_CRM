import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WhatsApp CRM | Enterprise Communication Platform',
  description:
    'Automate and manage all your WhatsApp communications with our enterprise-grade CRM platform. Streamline workflows, enhance customer relationships, and scale your business.',
  keywords: [
    'WhatsApp CRM',
    'automation',
    'customer communication',
    'business messaging',
    'enterprise',
  ],
  authors: [{ name: 'WhatsApp CRM' }],
  creator: 'WhatsApp CRM',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://whatsappcrm.com',
    title: 'WhatsApp CRM | Enterprise Communication Platform',
    description:
      'Automate and manage all your WhatsApp communications with our enterprise-grade CRM platform.',
    siteName: 'WhatsApp CRM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp CRM | Enterprise Communication Platform',
    description:
      'Automate and manage all your WhatsApp communications with our enterprise-grade CRM platform.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0F9D58" />
      </head>
      <body
        className={`${inter.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
