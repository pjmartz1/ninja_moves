'use client'

import React, { useState } from 'react'
import { Menu, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface HeaderProps {
  onSignInClick: () => void
}

export default function Header({ onSignInClick }: HeaderProps) {
  return (
    <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo - matching footer style */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-2.5 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            PDFTablePro
          </h1>
        </div>

        {/* Desktop Navigation - with Login button */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
            Pricing
          </a>
          <a href="#docs" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
            Documentation
          </a>
          <div className="flex items-center space-x-3 ml-4">
            <Button
              variant="orangeOutline"
              onClick={onSignInClick}
              className="font-medium"
            >
              Login
            </Button>
            <Button
              variant="orange"
              onClick={onSignInClick}
              className="font-medium"
            >
              Sign Up
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-orange-600">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-3">
                  <a href="#features" className="block text-gray-700 hover:text-orange-600 font-medium py-2 transition-colors">
                    Features
                  </a>
                  <a href="#pricing" className="block text-gray-700 hover:text-orange-600 font-medium py-2 transition-colors">
                    Pricing
                  </a>
                  <a href="#docs" className="block text-gray-700 hover:text-orange-600 font-medium py-2 transition-colors">
                    Documentation
                  </a>
                </div>
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Button
                    variant="orangeOutline"
                    onClick={onSignInClick}
                    className="w-full font-medium"
                  >
                    Login
                  </Button>
                  <Button
                    variant="orange"
                    onClick={onSignInClick}
                    className="w-full font-medium"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}