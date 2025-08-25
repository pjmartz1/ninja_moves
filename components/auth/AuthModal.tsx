'use client'

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  view?: 'sign_in' | 'sign_up'
}

export default function AuthModal({ isOpen, onClose, view = 'sign_in' }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 relative shadow-large border border-orange-100 animate-scale-in">
        {/* Premium header with gradient background */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-orange-400 to-amber-400 rounded-t-3xl opacity-10"></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white hover:shadow-medium transition-all duration-200"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="relative z-10 mb-8 text-center">
          {/* Premium logo/icon */}
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-4 shadow-medium mx-auto w-16 h-16 flex items-center justify-center mb-6">
            <span className="text-2xl">✨</span>
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            {view === 'sign_up' ? 'Join PDFTablePro' : 'Welcome Back!'}
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            {view === 'sign_up' 
              ? 'Unlock 5 daily extractions and premium features'
              : 'Sign in to access your dashboard and usage history'
            }
          </p>
        </div>

        <div className="relative z-10">
          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#f97316',
                    brandAccent: '#ea580c',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#fff7ed',
                    defaultButtonBackgroundHover: '#ffedd5',
                    inputBackground: 'white',
                    inputBorder: '#fed7aa',
                    inputBorderHover: '#fdba74',
                    inputBorderFocus: '#f97316',
                  },
                },
              },
              className: {
                anchor: 'text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200',
                button: 'rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:shadow-medium hover:scale-105',
                input: 'rounded-xl border-2 border-orange-100 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 font-medium',
                label: 'block text-sm font-bold text-gray-700 mb-2',
                message: 'text-sm text-red-600 mt-2 font-medium',
              },
            }}
            providers={['google']}
            redirectTo={`${window.location.origin}/auth/callback`}
            showLinks={true}
            magicLink={true}
            socialLayout="horizontal"
          />
        </div>

        {/* Premium Benefits Section */}
        <div className="mt-8 pt-6 border-t border-orange-100 relative z-10">
          <div className="text-center mb-6">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              🎉 Free Account Benefits
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Everything you need to get started, completely free
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl p-1.5 shadow-medium">
                  <span className="text-white text-xs">📊</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">5 Daily Extractions</div>
                  <div className="text-xs text-gray-600">Perfect for testing</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-1.5 shadow-medium">
                  <span className="text-white text-xs">📁</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">All Formats</div>
                  <div className="text-xs text-gray-600">CSV, Excel, JSON</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl p-1.5 shadow-medium">
                  <span className="text-white text-xs">📈</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">Usage Dashboard</div>
                  <div className="text-xs text-gray-600">Track your progress</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-1.5 shadow-medium">
                  <span className="text-white text-xs">💬</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">Email Support</div>
                  <div className="text-xs text-gray-600">We're here to help</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upgrade hint */}
          {view === 'sign_up' && (
            <div className="mt-6 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-4 border border-orange-200">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900 mb-1">
                  🚀 Need more? Upgrade anytime!
                </div>
                <div className="text-xs text-gray-600">
                  Pro plans start at just $19.99/month with 500+ daily extractions
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}