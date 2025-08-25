'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Heart, Mail, Github, Twitter, Linkedin, FileText } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gradient-to-br from-orange-50 via-white to-amber-50 border-t border-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-2.5 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900">
                    PDF2Excel.app
                  </h1>
                </a>
              </div>
              <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-md">
                Extract PDF tables to Excel in seconds with our AI-powered platform. 
                Trusted by professionals worldwide for accurate, fast, and secure document processing.
              </p>
              
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 text-sm">
                    PDF Table Extraction
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 text-sm">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Support & Resources */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-orange-600 transition-colors duration-200 text-sm">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="mb-8 bg-orange-200/50" />
          
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            
            {/* Legal Links */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span>© {currentYear} PDF2Excel.app.</span>
                <span className="hidden md:inline">Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-current hidden md:inline" />
                <span className="hidden md:inline">for data professionals</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/privacy" className="hover:text-orange-600 transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-orange-600 transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-orange-600 transition-colors duration-200">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            {/* Social Links & CTA */}
            <div className="flex items-center space-x-4">
              
              {/* Social Media Links */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6 bg-orange-200/50" />
              
              {/* CTA Button */}
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-glow-orange transition-all duration-300">
                Try Free Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}