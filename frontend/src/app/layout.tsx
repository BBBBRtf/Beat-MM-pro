import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';
import { i18n, Locale } from '@/i18n-config';
import Link from 'next/link'; // Import Link
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'; // Import react-bootstrap components

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'BeatMM Pro',
  description: 'The ultimate music platform',
  manifest: '/manifest.json',
  icons: { apple: '/icons/icon-192x192.png' },
  themeColor: '#ffffff',
};

// A simple component to generate links based on current locale
const LocaleLink = ({ locale, href, children }: { locale: Locale, href: string, children: React.ReactNode }) => {
  return <Link href={href} locale={locale} passHref legacyBehavior><Nav.Link>{children}</Nav.Link></Link>;
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const currentLocale = params.locale;
  const otherLocales = i18n.locales.filter(loc => loc !== currentLocale);

  return (
    <html lang={params.locale}>
      <body className={inter.className}>
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
          <Container>
            <Navbar.Brand as={Link} href={`/${currentLocale}`} locale={currentLocale}>BeatMM Pro</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <LocaleLink locale={currentLocale} href={`/${currentLocale}`}>Home</LocaleLink>
                <LocaleLink locale={currentLocale} href={`/${currentLocale}/upload`}>Upload</LocaleLink>
                {/* <LocaleLink locale={currentLocale} href={`/${currentLocale}/livestream`}>Livestream</LocaleLink> */} {/* Temporarily removed */}
              </Nav>
              <Nav>
                <NavDropdown title="Language" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} href={currentLocale === i18n.defaultLocale ? '/' : `/${i18n.defaultLocale}`} locale={i18n.defaultLocale} active={currentLocale === i18n.defaultLocale}>
                    {i18n.defaultLocale.toUpperCase()} ({i18n.defaultLocale === 'en' ? 'English' : i18n.defaultLocale === 'zh' ? '中文' : 'မြန်မာ'})
                  </NavDropdown.Item>
                  {otherLocales.map((loc) => (
                     <NavDropdown.Item key={loc} as={Link} href={`/${loc}`} locale={loc} active={currentLocale === loc}>
                       {loc.toUpperCase()} ({loc === 'en' ? 'English' : loc === 'zh' ? '中文' : 'မြန်မာ'})
                     </NavDropdown.Item>
                  ))}
                </NavDropdown>
                <LocaleLink locale={currentLocale} href={`/${currentLocale}/profile`}>Profile</LocaleLink>
                <LocaleLink locale={currentLocale} href={`/${currentLocale}/login`}>Login</LocaleLink>
                <LocaleLink locale={currentLocale} href={`/${currentLocale}/register`}>Register</LocaleLink>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <main>{children}</main> {/* Keep children (page content) outside Navbar */}
        <footer className="text-center mt-auto py-3 bg-light">
          <Container>
            <p>&copy; {new Date().getFullYear()} BeatMM Pro. All rights reserved.</p>
          </Container>
        </footer>
      </body>
    </html>
  );
}
