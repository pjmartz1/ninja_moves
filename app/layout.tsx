import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/auth/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDFTablePro - Extract PDF Tables to Excel in 10 Seconds | AI-Powered Table Extraction',
  description: 'Extract PDF tables to Excel/CSV with 95%+ accuracy. Free AI-powered tool transforms any PDF table into formatted spreadsheets instantly. No manual selection, no software installation required.',
  keywords: [
    'pdf table extraction',
    'extract tables from pdf python',
    'extract a table from pdf to excel',
    'extract table from pdf to excel',
    'extract table data from pdf',
    'get table from pdf',
    'pdf to excel converter',
    'pdf to csv converter',
    'table extraction tool',
    'pdf data extraction',
    'automated table processing',
    'financial pdf processing',
    'research table extraction',
    'business document automation'
  ],
  authors: [{ name: 'PDFTablePro Team', url: 'https://pdftablepro.com' }],
  creator: 'PDFTablePro',
  publisher: 'PDFTablePro',
  category: 'Business Software',
  classification: 'PDF Processing Tool',
  openGraph: {
    title: 'PDFTablePro - Extract PDF Tables to Excel in 10 Seconds',
    description: 'AI-powered PDF table extraction with 95%+ accuracy. Transform financial statements, research papers, and business documents into Excel/CSV instantly.',
    type: 'website',
    url: 'https://pdftablepro.com',
    siteName: 'PDFTablePro',
    locale: 'en_US',
    images: [
      {
        url: 'https://pdftablepro.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PDFTablePro - AI-Powered PDF Table Extraction Tool',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFTablePro - Extract PDF Tables to Excel in 10 Seconds',
    description: 'AI-powered PDF table extraction with 95%+ accuracy. Free trial available.',
    images: ['https://pdftablepro.com/twitter-image.png'],
    creator: '@PDFTablePro',
    site: '@PDFTablePro',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://pdftablepro.com',
  },
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  other: {
    'msapplication-TileColor': '#f97316',
    'theme-color': '#f97316',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'PDFTablePro',
    'application-name': 'PDFTablePro',
    'mobile-web-app-capable': 'yes',
    'msapplication-navbutton-color': '#f97316',
    'msapplication-starturl': '/',
    'format-detection': 'telephone=no',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://pdftablepro.com/#software',
        name: 'PDFTablePro',
        description: 'AI-powered PDF table extraction tool that converts PDF tables to Excel/CSV with 95%+ accuracy in under 30 seconds.',
        url: 'https://pdftablepro.com',
        applicationCategory: 'BusinessApplication',
        operatingSystem: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
        softwareVersion: '1.0.0',
        datePublished: '2025-01-01',
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          '@type': 'Organization',
          name: 'PDFTablePro',
          url: 'https://pdftablepro.com'
        },
        publisher: {
          '@type': 'Organization',
          name: 'PDFTablePro',
          url: 'https://pdftablepro.com'
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: '0',
          availability: 'https://schema.org/InStock',
          validFrom: '2025-01-01'
        },
        featureList: [
          'AI-powered table detection',
          'PDF to Excel conversion',
          'PDF to CSV conversion', 
          'Batch processing',
          '95%+ accuracy rate',
          'Under 30 second processing',
          'No software installation required',
          'Secure file processing'
        ],
        screenshot: 'https://pdftablepro.com/screenshot.png',
        downloadUrl: 'https://pdftablepro.com',
        installUrl: 'https://pdftablepro.com',
        sameAs: [
          'https://twitter.com/PDFTablePro',
          'https://linkedin.com/company/pdftablepro'
        ]
      },
      {
        '@type': 'WebApplication', 
        '@id': 'https://pdftablepro.com/#webapp',
        name: 'PDFTablePro Web App',
        description: 'Online PDF table extraction tool - extract tables from PDF files to Excel and CSV formats instantly.',
        url: 'https://pdftablepro.com',
        applicationCategory: 'BusinessApplication',
        browserRequirements: 'Requires JavaScript enabled',
        permissions: 'https://pdftablepro.com/privacy',
        storageRequirements: '50MB',
        memoryRequirements: '1GB',
        processorRequirements: 'Any modern processor',
        featureList: [
          'Drag and drop file upload',
          'Real-time processing status',
          'Multiple export formats',
          'User authentication',
          'Usage analytics',
          'Tier-based access control'
        ]
      },
      {
        '@type': 'Organization',
        '@id': 'https://pdftablepro.com/#organization', 
        name: 'PDFTablePro',
        url: 'https://pdftablepro.com',
        logo: 'https://pdftablepro.com/logo.png',
        description: 'Leading provider of AI-powered PDF table extraction solutions for businesses, researchers, and finance professionals.',
        foundingDate: '2025',
        sameAs: [
          'https://twitter.com/PDFTablePro',
          'https://linkedin.com/company/pdftablepro'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'support@pdftablepro.com',
          availableLanguage: 'English'
        }
      },
      {
        '@type': 'Service',
        '@id': 'https://pdftablepro.com/#service',
        name: 'PDF Table Extraction Service',
        description: 'Professional PDF table extraction service for converting PDF documents to Excel and CSV formats with AI-powered accuracy.',
        provider: {
          '@type': 'Organization',
          name: 'PDFTablePro',
          url: 'https://pdftablepro.com'
        },
        serviceType: 'PDF Processing',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'PDF Table Extraction Plans',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'Free Plan',
              description: '5 PDF pages daily, 50 pages monthly',
              price: '0',
              priceCurrency: 'USD'
            },
            {
              '@type': 'Offer', 
              name: 'Starter Plan',
              description: '500 pages monthly with batch processing',
              price: '19.99',
              priceCurrency: 'USD'
            },
            {
              '@type': 'Offer',
              name: 'Professional Plan', 
              description: '1,500 pages monthly with API access',
              price: '49.99',
              priceCurrency: 'USD'
            }
          ]
        }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://pdftablepro.com/#website',
        url: 'https://pdftablepro.com',
        name: 'PDFTablePro',
        description: 'Extract PDF tables to Excel/CSV with AI-powered precision',
        inLanguage: 'en-US',
        isPartOf: {
          '@id': 'https://pdftablepro.com/#organization'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://pdftablepro.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href="https://pdftablepro.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="google-site-verification" content="your-google-site-verification-code" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="web" />
        <meta name="rating" content="general" />
        <meta httpEquiv="content-language" content="en-us" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />
        <meta name="directory" content="submission" />
        <meta name="category" content="business,software,pdf,data,conversion" />
        <meta name="date" content={new Date().toISOString().split('T')[0]} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-white">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}