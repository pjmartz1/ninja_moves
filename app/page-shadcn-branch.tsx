'use client'

import React, { useState } from 'react'
import FileUploader from '@/components/upload/FileUploader'
import ProgressBar from '@/components/upload/ProgressBar'
import DownloadButtons from '@/components/results/DownloadButtons'
import AuthModal from '@/components/auth/AuthModal'
import UserDashboard from '@/components/auth/UserDashboard'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Menu, Zap, Target, ShieldCheck, FileText, Download, Users } from 'lucide-react'

export default function ShadcnBranchPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setProcessingProgress(0)
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/extract', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setExtractedData(data)
        setProcessingProgress(100)
      } else {
        throw new Error('Extraction failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsProcessing(false)
      clearInterval(progressInterval)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header - shadcn/ui neutral theme with proper navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <FileText className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                PDFTablePro
              </span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#features"
              >
                Features
              </a>
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#pricing"
              >
                Pricing
              </a>
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#docs"
              >
                Documentation
              </a>
            </nav>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader>
                <SheetTitle>
                  <a className="flex items-center" href="/">
                    <FileText className="mr-2 h-4 w-4" />
                    PDFTablePro
                  </a>
                </SheetTitle>
              </SheetHeader>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  <a href="#features">Features</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#docs">Documentation</a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="md:hidden">
                <a className="flex items-center space-x-2" href="/">
                  <FileText className="h-5 w-5" />
                  <span className="font-bold">PDFTablePro</span>
                </a>
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                Login
              </Button>
              <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
                <DialogTrigger asChild>
                  <Button size="sm">Sign Up</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Account</DialogTitle>
                    <DialogDescription>
                      Sign up to access premium features and track your usage.
                    </DialogDescription>
                  </DialogHeader>
                  <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
                </DialogContent>
              </Dialog>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - shadcn/ui neutral theme */}
      <section className="relative">
        <div className="container flex min-h-[600px] flex-col items-center justify-center space-y-4 py-16 text-center">
          <div className="mx-auto max-w-[980px] space-y-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1]">
              Extract PDF Tables to Excel in{' '}
              <span className="relative inline-block px-2 py-1 rounded-md bg-primary/10 text-primary">
                10 Seconds
              </span>
            </h1>
            <p className="mx-auto max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              AI-powered table extraction with{' '}
              <span className="font-semibold text-foreground">95%+ accuracy</span>.{' '}
              <br className="hidden sm:inline" />
              No manual selection, no software installation, no accuracy nightmares.
            </p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {!isProcessing && !extractedData && (
            <FileUploader onFileUpload={handleFileUpload} />
          )}
          
          {isProcessing && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
              <ProgressBar progress={processingProgress} />
            </div>
          )}
          
          {extractedData && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
              <DownloadButtons tables={extractedData.tables || []} processingTime={extractedData.processing_time || 0} />
            </div>
          )}
        </div>
      </section>

      {/* Features Section - shadcn/ui neutral theme */}
      <section id="features" className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-[980px] space-y-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose PDFTablePro
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Experience the fastest and most accurate PDF table extraction available.
              </p>
            </div>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-md bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2 pt-4">
                <h3 className="font-bold">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Extract tables in under 30 seconds with our optimized AI engine powered by advanced algorithms
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-md bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2 pt-4">
                <h3 className="font-bold">95%+ Accuracy</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI algorithms ensure precise table structure recognition across all document types
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-md bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2 pt-4">
                <h3 className="font-bold">Enterprise Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Files auto-deleted after processing with enterprise-grade security and privacy protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}