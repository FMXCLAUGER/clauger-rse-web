import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { SkipLink } from "@/components/a11y/SkipLink"
import { SearchModalWithSuspense } from "@/components/search/SearchModalWithSuspense"
import { ChatbotWithSuspense } from "@/components/chatbot/ChatbotWithSuspense"
import { Toaster } from "sonner"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rse.clauger.com"),
  title: {
    default: "Rapport RSE Clauger 2025 - Premier Rapport Durable",
    template: "%s | Clauger RSE 2025",
  },
  description:
    "Découvrez le premier rapport durable de Clauger. Un engagement structuré autour de 3 piliers : Environnement (4.8/10), Social (7.4/10) et Gouvernance (6.2/10). Note globale : 62/100.",
  keywords: [
    "RSE",
    "Clauger",
    "rapport durable",
    "développement durable",
    "environnement",
    "social",
    "gouvernance",
    "ESG",
    "responsabilité sociale",
    "bilan carbone",
  ],
  authors: [{ name: "Clauger" }],
  creator: "Clauger",
  publisher: "Clauger",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: "Rapport RSE Clauger 2025",
    description:
      "Premier rapport durable de Clauger - Passion, Innovation, Performance, Solidarité. Note globale 62/100.",
    siteName: "Clauger RSE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rapport RSE Clauger 2025",
    description: "Découvrez notre premier rapport durable - Note globale 62/100",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "verification_token",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
        <SkipLink />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SearchModalWithSuspense />
          <ChatbotWithSuspense />
          {children}
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
          />
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
