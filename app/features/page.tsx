import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Zap, 
  Shield, 
  Wand2, 
  Clock, 
  Download, 
  Globe, 
  Cpu, 
  Lock,
  CheckCircle,
  ArrowRight,
  Eye,
  BarChart3,
  RefreshCw,
  Database
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Features - PDF2Excel.app | Advanced PDF Table Extraction',
  description: 'Discover powerful features: AI table detection, 95%+ accuracy, batch processing, API access, and secure cloud processing. Extract PDF tables to Excel effortlessly.',
  keywords: ['pdf to excel features', 'table extraction features', 'pdf conversion capabilities', 'batch processing', 'api access'],
  openGraph: {
    title: 'Advanced PDF Table Extraction Features | PDF2Excel.app',
    description: 'AI-powered table detection, batch processing, API access, and enterprise security features.',
    images: ['/og-features.jpg'],
  },
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="bg-orange-100 text-orange-800 px-4 py-2 mb-6 text-sm font-medium">
                ✨ Advanced Features
              </Badge>
              <h1 className="text-5xl font-black text-gray-900 mb-6">
                Powerful Features for
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> Professional </span>
                PDF Processing
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover why thousands of professionals choose PDF2Excel.app for their document processing needs. 
                Advanced AI, enterprise security, and lightning-fast performance.
              </p>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From basic extraction to enterprise integrations, we've got you covered
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* AI Table Detection */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                <CardContent className="p-8">
                  <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Wand2 className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">AI Table Detection</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced AI automatically identifies and extracts tables with 95%+ accuracy. 
                    No manual selection needed - just upload and extract.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Complex table structures</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Multi-page documents</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Headers & footers preserved</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Lightning Speed */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                <CardContent className="p-8">
                  <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
                  <p className="text-gray-600 mb-4">
                    Process documents in under 30 seconds. Our optimized cloud infrastructure 
                    ensures quick turnaround times for all file sizes.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Sub-30 second processing</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Real-time progress updates</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Global CDN delivery</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Multiple Export Formats */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                <CardContent className="p-8">
                  <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Download className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Multiple Formats</h3>
                  <p className="text-gray-600 mb-4">
                    Export to Excel (.xlsx), CSV, or JSON. Choose the format that works 
                    best for your workflow and analysis needs.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Excel (.xlsx) with formatting</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />CSV for data analysis</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />JSON for developers</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Enterprise Security */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                <CardContent className="p-8">
                  <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
                  <p className="text-gray-600 mb-4">
                    Bank-level security with automatic file deletion, encrypted processing, 
                    and SOC 2 compliant infrastructure.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Auto file deletion (1 hour)</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Encrypted transmission</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />No permanent storage</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Batch Processing */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                <CardContent className="p-8">
                  <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Database className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Batch Processing</h3>
                  <p className="text-gray-600 mb-4">
                    Process multiple PDFs at once with our batch upload feature. 
                    Perfect for handling large document sets efficiently.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Up to 50 files at once</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Progress tracking</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Bulk download option</li>
                  </ul>
                </CardContent>
              </Card>

              {/* API Access */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                <CardContent className="p-8">
                  <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Cpu className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Developer API</h3>
                  <p className="text-gray-600 mb-4">
                    Integrate PDF table extraction into your applications with our 
                    REST API. Complete with SDKs and comprehensive documentation.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />RESTful API design</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Python & Node.js SDKs</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Webhook support</li>
                  </ul>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                Advanced Capabilities
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional features designed for demanding workflows
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-12">
              
              {/* Preview & Confidence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center mb-6">
                    <Eye className="h-8 w-8 text-orange-500 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Preview & Confidence Scoring</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Preview extracted tables before downloading and see confidence scores 
                    for each extraction. Make informed decisions about data quality.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Live table preview with highlighting
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      AI confidence scoring (0-100%)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Quality metrics and recommendations
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <BarChart3 className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600">Preview Interface Mockup</p>
                  </div>
                </div>
              </div>

              {/* Smart Processing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg order-2 lg:order-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <RefreshCw className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600">Smart Processing Pipeline</p>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center mb-6">
                    <RefreshCw className="h-8 w-8 text-orange-500 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Smart Processing Pipeline</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Our intelligent processing pipeline automatically selects the best 
                    extraction method for each document, ensuring optimal results.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Automatic method selection (OCR, text extraction, AI)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Fallback processing for edge cases
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Quality validation and error correction
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-black text-white mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who save hours every week with PDF2Excel.app
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-4 text-lg">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-4 text-lg">
                View Pricing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}