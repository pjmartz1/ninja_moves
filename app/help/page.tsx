import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  FileText, 
  Upload, 
  Download,
  Shield,
  CreditCard,
  Settings,
  Mail,
  MessageCircle,
  Book,
  Zap,
  AlertTriangle
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Help Center - PDF2Excel.app | Support & Documentation',
  description: 'Get help with PDF table extraction. Find guides, tutorials, FAQs, and support resources for PDF2Excel.app.',
  keywords: ['help center', 'support', 'pdf extraction help', 'tutorials', 'faq'],
  openGraph: {
    title: 'Help Center | PDF2Excel.app Support',
    description: 'Find answers to common questions and get support for PDF table extraction.',
    images: ['/og-help.jpg'],
  },
}

export default function HelpPage() {

  const faqs = [
    {
      question: "What types of PDF files are supported?",
      answer: "We support text-based PDF files with tables. Scanned PDFs require OCR processing (available on paid plans). Files must be under 10MB and contain fewer than 100 pages."
    },
    {
      question: "How accurate is the table extraction?",
      answer: "Our AI-powered extraction achieves 95%+ accuracy on most documents. Complex tables with merged cells or unusual formatting may require manual review of the results."
    },
    {
      question: "Are my documents stored on your servers?",
      answer: "No, all uploaded documents are automatically deleted within 1 hour of processing. We use secure, encrypted connections and do not permanently store your files."
    },
    {
      question: "What export formats are available?",
      answer: "You can export extracted tables to Excel (.xlsx), CSV, and JSON formats. Excel exports preserve formatting and structure where possible."
    },
    {
      question: "How do usage limits work?",
      answer: "Usage is measured by PDF pages processed. Free accounts get 5 pages daily (50 monthly). Paid plans offer higher limits with rollover unused pages to the next month."
    },
    {
      question: "Can I process multiple files at once?",
      answer: "Batch processing is available on Starter plans and above. You can upload and process multiple PDFs simultaneously, saving time on large document sets."
    }
  ]

  const helpCategories = [
    {
      icon: Upload,
      title: "Getting Started",
      description: "Learn how to upload and process your first PDF",
      articles: [
        "How to upload a PDF file",
        "Understanding file requirements",
        "Your first table extraction",
        "Account setup and verification"
      ]
    },
    {
      icon: FileText,
      title: "Table Extraction",
      description: "Master the art of PDF table extraction",
      articles: [
        "Best practices for table extraction",
        "Handling complex table structures",
        "Improving extraction accuracy",
        "Preview and confidence scores"
      ]
    },
    {
      icon: Download,
      title: "Export & Formats",
      description: "Export your data in the right format",
      articles: [
        "Excel export formatting options",
        "CSV delimiter and encoding settings",
        "JSON structure and schema",
        "Batch download procedures"
      ]
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      description: "Manage your subscription and billing",
      articles: [
        "Choosing the right plan",
        "Understanding usage limits",
        "Payment methods and billing",
        "Cancellation and refunds"
      ]
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Learn about data protection and security",
      articles: [
        "File security and encryption",
        "Data retention policies",
        "Privacy and GDPR compliance",
        "Enterprise security features"
      ]
    },
    {
      icon: Settings,
      title: "API & Integrations",
      description: "Integrate with your applications",
      articles: [
        "API getting started guide",
        "Authentication and API keys",
        "Rate limits and best practices",
        "Webhook configuration"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <HelpCircle className="h-10 w-10 text-orange-600" />
              </div>
              <h1 className="text-5xl font-black text-gray-900 mb-6">
                How can we help you today?
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Find answers to common questions, explore our guides, or contact our support team
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <input
                  type="text"
                  placeholder="Search for help articles, guides, or FAQs..."
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none bg-white shadow-lg"
                />
                <Button className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <MessageCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
                    <p className="text-gray-600 mb-4">Get instant help from our support team</p>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <Mail className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                    <p className="text-gray-600 mb-4">Send us a detailed message</p>
                    <Button variant="outline" className="w-full border-orange-500 text-orange-600">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <Book className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Documentation</h3>
                    <p className="text-gray-600 mb-4">Browse our complete guides</p>
                    <Button variant="outline" className="w-full border-orange-500 text-orange-600">
                      View Docs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                Browse Help Topics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {helpCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                          <category.icon className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-6">{category.description}</p>
                      <ul className="space-y-3">
                        {category.articles.map((article, articleIndex) => (
                          <li key={articleIndex}>
                            <a href="#" className="text-orange-600 hover:text-orange-700 transition-colors text-sm">
                              {article}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <HelpCircle className="h-5 w-5 text-orange-500 mr-3" />
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 leading-relaxed pl-8">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Status & Updates */}
        <section className="py-16 bg-orange-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">System Status</h3>
                    <p className="text-gray-600">All services running normally</p>
                    <Button variant="outline" className="mt-4">
                      View Status Page
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center mb-4">
                      <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                      <Badge className="bg-orange-100 text-orange-800">Latest Updates</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Service Updates</h3>
                    <p className="text-gray-600">New features and improvements</p>
                    <Button variant="outline" className="mt-4">
                      View Changelog
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Our support team is here to help you succeed with PDF table extraction
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-4">
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-4">
                <MessageCircle className="mr-2 h-5 w-5" />
                Live Chat
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}