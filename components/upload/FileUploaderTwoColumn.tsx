'use client'

import React from 'react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, HardDrive, FileCheck, Type, Lightbulb, Upload, AlertTriangle, Target, CheckCircle, XCircle, FolderOpen, Sparkles } from 'lucide-react'

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  disabled?: boolean
}

export default function FileUploaderTwoColumn({ onFileUpload, disabled = false }: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError('File is too large. Maximum size is 10MB.')
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload a PDF file.')
      } else {
        setError('File upload failed. Please try again.')
      }
      return
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Additional client-side validation
      if (file.size > 10 * 1024 * 1024) {
        setError('File is too large. Maximum size is 10MB.')
        return
      }

      if (file.type !== 'application/pdf') {
        setError('Invalid file type. Please upload a PDF file.')
        return
      }

      onFileUpload(file)
    }
  }, [onFileUpload])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled
  })

  // Determine dropzone style classes
  const getDropzoneClass = () => {
    let classes = 'dropzone'
    
    if (disabled) {
      classes += ' opacity-50 cursor-not-allowed'
    } else if (isDragReject) {
      classes += ' reject'
    } else if (isDragAccept) {
      classes += ' accept'
    } else if (isDragActive) {
      classes += ' active'
    }
    
    return classes
  }

  return (
    <div className="w-full">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Left Column - Upload Area */}
        <div className="flex flex-col">
          <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 transition-all duration-300 bg-gradient-to-br from-orange-25 to-amber-25 hover:shadow-glow-orange flex-1 min-h-[500px]">
            <CardContent {...getRootProps({ className: `p-8 ${getDropzoneClass()} h-full` })}>
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center space-y-6 h-full justify-center">
                {/* Premium animated icon */}
                <div className="relative">
                  <div className={`bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-6 shadow-2xl transition-all duration-500 ${
                    isDragActive ? 'scale-110 shadow-glow-orange animate-glow' : 'hover:scale-105'
                  } ${disabled ? 'opacity-50' : ''}`}>
                    <Upload className={`h-16 w-16 text-white transition-all duration-300 ${
                      isDragActive ? 'animate-bounce-subtle' : 'group-hover:scale-110'
                    }`} />
                  </div>
                  
                  {/* Dynamic glow effects */}
                  {isDragActive && (
                    <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl opacity-30 animate-pulse-subtle"></div>
                  )}
                  {isDragAccept && (
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl opacity-30 animate-pulse-subtle"></div>
                  )}
                  {isDragReject && (
                    <div className="absolute -inset-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-3xl opacity-30 animate-pulse-subtle"></div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className={`text-2xl font-black text-gray-900 mb-3 transition-all duration-300 ${
                    isDragActive ? 'text-orange-600 scale-105' : ''
                  }`}>
                    {isDragActive 
                      ? (isDragAccept ? 'Perfect! Drop it here!' : 'Wrong file type') 
                      : 'Upload Your PDF'
                    }
                  </h3>
                  <p className={`text-lg text-gray-600 mb-4 font-medium transition-all duration-300 ${
                    isDragActive ? 'text-orange-700' : ''
                  }`}>
                    {isDragActive 
                      ? (isDragAccept ? 'Release to start processing' : 'Only PDF files supported') 
                      : 'Drag & drop or click to browse'
                    }
                  </p>
                  
                  {!disabled && (
                    <button
                      type="button"
                      className="group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-large hover:shadow-glow-orange transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="flex items-center space-x-2">
                        <FolderOpen className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Choose File</span>
                        <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Requirements */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-gray-900 text-center lg:text-left">File Requirements</h3>
          </div>
          
          {/* Requirements Grid */}
          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border border-orange-100 hover:shadow-md transition-all duration-300 hover:border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 rounded-lg p-2 shadow-sm">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-gray-900 text-base mb-1">PDF Format Only</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Standard PDF documents work best</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-orange-100 hover:shadow-md transition-all duration-300 hover:border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 rounded-lg p-2 shadow-sm">
                    <HardDrive className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-gray-900 text-base mb-1">10MB Max Size</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Optimized for fast processing</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-orange-100 hover:shadow-md transition-all duration-300 hover:border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 rounded-lg p-2 shadow-sm">
                    <FileCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-gray-900 text-base mb-1">100 Pages Limit</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Perfect for most documents</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-orange-100 hover:shadow-md transition-all duration-300 hover:border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 rounded-lg p-2 shadow-sm">
                    <Type className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-gray-900 text-base mb-1">Text-Based PDFs</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Searchable text works best</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-500 rounded-lg p-2 shadow-sm">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-bold text-gray-900 text-base mb-2">Pro Tips</CardTitle>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                        <span>Use text-searchable PDFs</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                        <span>Clear borders extract better</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                        <span>Avoid rotated tables</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mt-8 animate-slide-down bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-3 shadow-medium">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-red-800 mb-2">Upload Error</CardTitle>
                <CardDescription className="text-red-700 font-medium text-lg">{error}</CardDescription>
              </div>
            </div>
            <div className="mt-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-red-100">
              <p className="text-sm text-red-600 font-medium flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span><strong>Quick fix:</strong> Make sure your file is a PDF under 10MB with readable text content.</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}