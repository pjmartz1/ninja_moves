import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Terms of Service - PDF2Excel.app',
  description: 'Terms of Service for PDF2Excel.app - PDF table extraction service.',
  robots: 'index, follow',
}

export default function TermsPage() {

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-gray-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-8 prose prose-lg max-w-none">
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-6">
                  By accessing and using PDF2Excel.app ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
                <p className="text-gray-700 mb-4">
                  PDF2Excel.app provides an online service for extracting tables from PDF documents and converting them to various formats 
                  including Excel (.xlsx), CSV, and JSON. The service uses artificial intelligence and machine learning algorithms to 
                  automatically detect and extract tabular data.
                </p>
                <p className="text-gray-700 mb-6">
                  We offer both free and paid tiers of service with different usage limits and features.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                <p className="text-gray-700 mb-4">
                  To access certain features of our service, you may be required to create an account. When creating an account, you must:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update any changes to your information</li>
                  <li>Accept full responsibility for all activities under your account</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Usage Limits and Restrictions</h2>
                <p className="text-gray-700 mb-4">
                  Usage limits vary by subscription tier:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li><strong>Free Tier:</strong> 5 pages per day, 50 pages per month</li>
                  <li><strong>Starter:</strong> 500 pages per month</li>
                  <li><strong>Professional:</strong> 1,500 pages per month</li>
                  <li><strong>Business:</strong> 5,000 pages per month</li>
                </ul>
                <p className="text-gray-700 mb-6">
                  You agree not to exceed your allocated usage limits or attempt to circumvent them through multiple accounts 
                  or other means.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. File Processing and Data Security</h2>
                <p className="text-gray-700 mb-4">
                  When you upload files to our service:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>Files are processed securely using encrypted connections</li>
                  <li>Files are automatically deleted from our servers within 1 hour of processing</li>
                  <li>We do not permanently store your uploaded documents</li>
                  <li>You retain all rights to your original documents and extracted data</li>
                </ul>
                <p className="text-gray-700 mb-6">
                  You are responsible for ensuring you have the right to upload and process any documents you submit to our service.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Uses</h2>
                <p className="text-gray-700 mb-4">
                  You agree not to use the service for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li>Processing documents containing illegal content</li>
                  <li>Uploading malware, viruses, or malicious code</li>
                  <li>Attempting to reverse engineer or compromise our systems</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Processing documents you don't have permission to access</li>
                  <li>Excessive automated requests that may disrupt service availability</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
                <p className="text-gray-700 mb-4">
                  For paid subscriptions:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>Payments are processed monthly in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                  <li>Failure to pay may result in service suspension</li>
                </ul>
                <p className="text-gray-700 mb-6">
                  You may cancel your subscription at any time, with access continuing until the end of your billing period.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
                <p className="text-gray-700 mb-6">
                  While we strive for 99.9% uptime, we do not guarantee uninterrupted service availability. 
                  We may perform maintenance, updates, or experience technical difficulties that temporarily affect service access.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 mb-6">
                  PDF2Excel.app is provided "as is" without warranties of any kind. We are not liable for any damages arising 
                  from your use of the service, including but not limited to data loss, business interruption, or inaccuracies 
                  in extracted data. Your use of the service is at your own risk.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
                <p className="text-gray-700 mb-6">
                  We reserve the right to terminate or suspend your account and access to the service at our sole discretion, 
                  without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, 
                  us, or third parties.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
                <p className="text-gray-700 mb-6">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via 
                  email or through our service. Your continued use of the service after such modifications constitutes 
                  acceptance of the updated terms.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                  <p><strong>Email:</strong> support@pdf2excel.app</p>
                  <p><strong>Website:</strong> https://pdf2excel.app</p>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}