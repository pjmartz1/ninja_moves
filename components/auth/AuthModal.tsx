'use client'

import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { BarChart3, FileText, TrendingUp, Mail, Gift, Rocket, Eye, EyeOff } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  view?: 'sign_in' | 'sign_up'
}

export default function AuthModal({ isOpen, onClose, view = 'sign_in' }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { user, loading } = useAuth()
  
  // Auto-close modal on successful authentication
  useEffect(() => {
    if (user && !loading && isOpen) {
      // Small delay for smooth UX transition
      const timer = setTimeout(() => {
        onClose()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [user, loading, isOpen, onClose])
  
  // Add password visibility toggle to Supabase Auth inputs
  useEffect(() => {
    if (!isOpen) return
    
    const timer = setTimeout(() => {
      const passwordInputs = document.querySelectorAll('input[type="password"]')
      
      passwordInputs.forEach((input) => {
        // Skip if already has toggle
        if (input.parentElement?.querySelector('.password-toggle')) return
        
        const inputElement = input as HTMLInputElement
        const container = inputElement.parentElement
        
        if (container) {
          // Create toggle button
          const toggleButton = document.createElement('button')
          toggleButton.type = 'button'
          toggleButton.className = 'password-toggle absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none'
          
          // Position toggle to perfectly align with input's visual center
          // Direct offset adjustment based on measured 13px difference
          toggleButton.style.top = '50%'
          toggleButton.style.transform = 'translateY(-50%)'
          toggleButton.style.height = '20px'
          toggleButton.style.marginTop = '13px'  // Exact offset to align with input visual center
          toggleButton.style.display = 'flex'
          toggleButton.style.alignItems = 'center'
          toggleButton.style.justifyContent = 'center'
          toggleButton.innerHTML = `
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          `
          
          // Add click handler
          toggleButton.addEventListener('click', () => {
            const isPassword = inputElement.type === 'password'
            inputElement.type = isPassword ? 'text' : 'password'
            
            // Update icon
            toggleButton.innerHTML = isPassword 
              ? `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                 </svg>`
              : `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                 </svg>`
          })
          
          // Style the container as relative and add the button
          container.style.position = 'relative'
          container.style.display = 'block'
          container.appendChild(toggleButton)
        }
      })
    }, 100) // Small delay to ensure Supabase Auth has rendered
    
    return () => clearTimeout(timer)
  }, [isOpen, view])
  
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 relative shadow-large border border-orange-100 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all duration-200"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        {/* Compact header */}
        <div className="mb-6 text-center">
          <h2 id="auth-modal-title" className="text-xl font-bold text-gray-900">
            {view === 'sign_up' ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            PDF2Excel.app
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
                input: 'rounded-xl border-2 border-orange-100 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 font-medium password-input',
                label: 'block text-sm font-bold text-gray-700 mb-2',
                message: 'text-sm text-red-600 mt-2 font-medium',
              },
            }}
            providers={['google']}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
            showLinks={true}
            magicLink={true}
            socialLayout="horizontal"
          />
        </div>

        {/* Premium Benefits Section */}
        <div className="mt-6 pt-4 border-t border-orange-100 relative z-10">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
              <Gift className="h-4 w-4 text-orange-500" />
              Free Account Benefits
            </h3>
            <p className="text-xs text-gray-600">
              Everything you need to get started
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg p-1 shadow-sm">
                  <BarChart3 className="h-3 w-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs">5 Daily Extractions</div>
                  <div className="text-xs text-gray-500">Perfect for testing</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg p-1 shadow-sm">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs">All Formats</div>
                  <div className="text-xs text-gray-500">CSV, Excel, JSON</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg p-1 shadow-sm">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs">Usage Dashboard</div>
                  <div className="text-xs text-gray-500">Track your progress</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg p-1 shadow-sm">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs">Email Support</div>
                  <div className="text-xs text-gray-500">We're here to help</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upgrade hint */}
          {view === 'sign_up' && (
            <div className="mt-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-3 border border-orange-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 mb-1 flex items-center justify-center gap-2">
                  <Rocket className="h-3 w-3 text-orange-600" />
                  Need more? Upgrade anytime!
                </div>
                <div className="text-xs text-gray-600">
                  Pro plans start at $19.99/month
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}