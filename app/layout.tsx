import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/auth/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDF to Excel Converter - Extract Tables Online Free | PDF2Excel.app',
  description: 'Convert PDF to Excel instantly. Extract tables from PDF files with 95%+ accuracy. Free online tool - no software installation required. AI-powered table extraction in seconds.',
  keywords: [
    'pdf to excel',
    'convert pdf to excel',
    'pdf to excel converter',
    'convert pdf to excel free',
    'pdf table to excel',
    'extract data from pdf to excel',
    'extract table from pdf to excel',
    'extract a table from pdf to excel',
    'pdf table extraction',
    'convert pdf table to excel online',
    'extract tables from pdf python',
    'pdf to csv converter',
    'automated pdf processing',
    'financial pdf to excel',
    'research table extraction',
    'business document conversion'
  ],
  authors: [{ name: 'PDF2Excel.app Team', url: 'https://pdf2excel.app' }],
  creator: 'PDF2Excel.app',
  publisher: 'PDF2Excel.app',
  category: 'Business Software',
  classification: 'PDF Processing Tool',
  openGraph: {
    title: 'PDF to Excel Converter - Extract Tables Online Free | PDF2Excel.app',
    description: 'Convert PDF to Excel instantly with 95%+ accuracy. Free online PDF table extraction tool. Transform financial statements, research papers, and business documents to Excel/CSV.',
    type: 'website',
    url: 'https://pdf2excel.app',
    siteName: 'PDF2Excel.app',
    locale: 'en_US',
    images: [
      {
        url: 'https://pdf2excel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PDF to Excel Converter - Free Online Tool | PDF2Excel.app',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF to Excel Converter - Free Online Tool',
    description: 'Convert PDF to Excel instantly. 95%+ accuracy. Free tool with no software installation required.',
    images: ['https://pdf2excel.app/twitter-image.png'],
    creator: '@PDF2Excel.app',
    site: '@PDF2Excel.app',
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
    canonical: 'https://pdf2excel.app',
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
    'apple-mobile-web-app-title': 'PDF2Excel.app',
    'application-name': 'PDF2Excel.app',
    'mobile-web-app-capable': 'yes',
    'msapplication-navbutton-color': '#f97316',
    'msapplication-starturl': '/',
    'format-detection': 'telephone=no',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        '@id': 'https://pdf2excel.app/#software',
        name: 'PDF2Excel.app',
        description: 'AI-powered PDF table extraction tool that converts PDF tables to Excel/CSV with 95%+ accuracy in under 30 seconds.',
        url: 'https://pdf2excel.app',
        applicationCategory: 'BusinessApplication',
        operatingSystem: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
        softwareVersion: '1.0.0',
        datePublished: '2025-01-01',
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          '@type': 'Organization',
          name: 'PDF2Excel.app',
          url: 'https://pdf2excel.app'
        },
        publisher: {
          '@type': 'Organization',
          name: 'PDF2Excel.app',
          url: 'https://pdf2excel.app'
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
        screenshot: 'https://pdf2excel.app/screenshot.png',
        downloadUrl: 'https://pdf2excel.app',
        installUrl: 'https://pdf2excel.app',
        sameAs: [
          'https://twitter.com/PDF2Excel.app',
          'https://linkedin.com/company/pdftablepro'
        ]
      },
      {
        '@type': 'WebApplication', 
        '@id': 'https://pdf2excel.app/#webapp',
        name: 'PDF2Excel.app Web App',
        description: 'Online PDF table extraction tool - extract tables from PDF files to Excel and CSV formats instantly.',
        url: 'https://pdf2excel.app',
        applicationCategory: 'BusinessApplication',
        browserRequirements: 'Requires JavaScript enabled',
        permissions: 'https://pdf2excel.app/privacy',
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
        '@id': 'https://pdf2excel.app/#organization', 
        name: 'PDF2Excel.app',
        url: 'https://pdf2excel.app',
        logo: 'https://pdf2excel.app/logo.png',
        description: 'Leading provider of AI-powered PDF table extraction solutions for businesses, researchers, and finance professionals.',
        foundingDate: '2025',
        sameAs: [
          'https://twitter.com/PDF2Excel.app',
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
        '@id': 'https://pdf2excel.app/#service',
        name: 'PDF Table Extraction Service',
        description: 'Professional PDF table extraction service for converting PDF documents to Excel and CSV formats with AI-powered accuracy.',
        provider: {
          '@type': 'Organization',
          name: 'PDF2Excel.app',
          url: 'https://pdf2excel.app'
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
        '@id': 'https://pdf2excel.app/#website',
        url: 'https://pdf2excel.app',
        name: 'PDF2Excel.app',
        description: 'Extract PDF tables to Excel/CSV with AI-powered precision',
        inLanguage: 'en-US',
        isPartOf: {
          '@id': 'https://pdf2excel.app/#organization'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://pdf2excel.app/search?q={search_term_string}',
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
        <link rel="canonical" href="https://pdf2excel.app" />
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