'use client'

import AuthProvider from '@/components/auth/AuthProvider'
import { Toaster } from 'sonner'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster 
        position="top-center"
        richColors
        closeButton
        expand={false}
        visibleToasts={3}
      />
    </AuthProvider>
  )
}