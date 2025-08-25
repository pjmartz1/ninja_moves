import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Privacy Policy - PDF2Excel.app',
  description: 'Privacy Policy for PDF2Excel.app - How we protect your data and documents.',
  robots: 'index, follow',
}

export default function PrivacyPage() {

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-8 prose prose-lg max-w-none">
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 mb-6">
                  PDF2Excel.app ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                  how we collect, use, disclose, and safeguard your information when you use our PDF table extraction service.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
                <p className="text-gray-700 mb-4">
                  When you create an account or use our service, we may collect:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                  <li>Email address and account credentials</li>
                  <li>Name and contact information (if provided)</li>
                  <li>Payment information (processed by third-party payment processors)</li>
                  <li>PDF documents you upload for processing</li>
                  <li>Support communications and feedback</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
                <p className="text-gray-700 mb-4">
                  We automatically collect certain information when you use our service:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                  <li>IP address and general location information</li>
                  <li>Browser type, version, and operating system</li>
                  <li>Usage patterns and service interactions</li>
                  <li>Processing statistics and performance metrics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li><strong>Service Provision:</strong> Processing your PDF documents and extracting table data</li>
                  <li><strong>Account Management:</strong> Creating and maintaining your user account</li>
                  <li><strong>Usage Tracking:</strong> Monitoring your usage against subscription limits</li>
                  <li><strong>Payment Processing:</strong> Handling subscription payments and billing</li>
                  <li><strong>Communication:</strong> Sending service updates, support responses, and important notices</li>
                  <li><strong>Improvement:</strong> Analyzing service usage to improve our algorithms and user experience</li>
                  <li><strong>Security:</strong> Protecting against fraud, abuse, and security threats</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Document Processing and Data Security</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Document Handling</h3>
                <p className="text-gray-700 mb-4">
                  When you upload PDF documents to our service:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>Files are transmitted using secure, encrypted connections (HTTPS/TLS)</li>
                  <li>Documents are processed in memory with minimal disk storage</li>
                  <li>All uploaded files are automatically deleted within 1 hour of processing</li>
                  <li>We do not permanently store, read, or retain your document contents</li>
                  <li>Extracted data is only temporarily cached for download purposes</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Security Measures</h3>
                <p className="text-gray-700 mb-6">
                  We implement industry-standard security measures including encryption in transit and at rest, 
                  secure cloud infrastructure, regular security audits, and access controls to protect your information.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or rent your personal information. We may share information only in these circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li><strong>Service Providers:</strong> Third-party services that help us operate (payment processors, hosting providers)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
                <p className="text-gray-700 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Maintain your login session</li>
                  <li>Remember your preferences</li>
                  <li>Analyze service usage and performance</li>
                  <li>Provide personalized experiences</li>
                </ul>
                <p className="text-gray-700 mb-6">
                  You can control cookies through your browser settings, though this may affect service functionality.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                <p className="text-gray-700 mb-4">
                  We retain information for different periods based on type and purpose:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                  <li><strong>Uploaded Documents:</strong> Automatically deleted within 1 hour</li>
                  <li><strong>Account Information:</strong> Retained while your account is active</li>
                  <li><strong>Usage Data:</strong> Retained for up to 2 years for analytics and billing</li>
                  <li><strong>Payment Records:</strong> Retained as required by law and for tax purposes</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Privacy Rights</h2>
                <p className="text-gray-700 mb-4">
                  Depending on your location, you may have rights including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Access:</strong> Request information about data we have about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request transfer of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                </ul>
                <p className="text-gray-700 mb-6">
                  To exercise these rights, contact us at privacy@pdf2excel.app.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-700 mb-6">
                  Our services may involve transferring your information to countries outside your residence. 
                  We ensure appropriate safeguards are in place to protect your information in accordance with applicable laws.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p className="text-gray-700 mb-6">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If we become aware that we have collected information 
                  from a child under 13, we will delete such information promptly.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Services</h2>
                <p className="text-gray-700 mb-6">
                  Our service may contain links to third-party websites or integrate with third-party services. 
                  This Privacy Policy does not apply to those external services. We recommend reviewing their privacy policies.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 mb-6">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes 
                  by email or through our service. Your continued use after such changes constitutes acceptance of the updated policy.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                  <p><strong>Email:</strong> privacy@pdf2excel.app</p>
                  <p><strong>Support:</strong> support@pdf2excel.app</p>
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