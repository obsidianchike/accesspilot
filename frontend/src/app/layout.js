import { DM_Sans, Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// ─── Fonts ───────────────────────────────────────────────
// DM Sans  — clean, modern body font
// Syne     — geometric display font for headings
// JetBrains Mono — code snippets in fix panels

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

// ─── Metadata ────────────────────────────────────────────
export const metadata = {
  title: 'AccessPilot — AI Accessibility Copilot',
  description:
    'AccessPilot scans websites, identifies accessibility barriers, and generates AI-powered fixes to make the web accessible for everyone.',
  keywords: [
    'accessibility', 'WCAG', 'a11y', 'axe-core',
    'Azure OpenAI', 'AI accessibility', 'web accessibility audit',
  ],
  openGraph: {
    title: 'AccessPilot — AI Accessibility Copilot',
    description:
      'Scan any website for accessibility barriers. Get AI-generated fixes instantly.',
    type: 'website',
  },
}

// ─── Root Layout ─────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
