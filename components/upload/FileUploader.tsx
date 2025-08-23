'use client'

import React from 'react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { DocumentArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  disabled?: boolean
}

export default function FileUploader({ onFileUpload, disabled = false }: FileUploaderProps) {
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
      <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 transition-all duration-300 bg-gradient-to-br from-orange-25 to-amber-25 hover:shadow-glow-orange">
        <CardContent {...getRootProps({ className: `p-12 ${getDropzoneClass()}` })}>
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-8">
          {/* Premium animated icon with enhanced interactions */}
          <div className="relative">
            <div className={`bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-8 shadow-2xl transition-all duration-500 ${
              isDragActive ? 'scale-110 shadow-glow-orange animate-glow' : 'hover:scale-105'
            } ${disabled ? 'opacity-50' : ''}`}>
              <DocumentArrowUpIcon className={`h-20 w-20 text-white transition-all duration-300 ${
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
            
            {/* Floating particles effect */}
            {isDragActive && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-float"></div>
                <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-2 left-4 w-1 h-1 bg-white rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-4 right-2 w-1 h-1 bg-white rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h3 className={`text-3xl font-black text-gray-900 mb-4 transition-all duration-300 ${
              isDragActive ? 'text-orange-600 scale-105' : ''
            }`}>
              {isDragActive 
                ? (isDragAccept ? '🎯 Perfect! Drop it here!' : '❌ Wrong file type') 
                : 'Upload Your PDF Document'
              }
            </h3>
            <p className={`text-xl text-gray-600 mb-6 font-medium transition-all duration-300 ${
              isDragActive ? 'text-orange-700' : ''
            }`}>
              {isDragActive 
                ? (isDragAccept ? 'Release to start AI magic ✨' : 'Only PDF files are supported') 
                : 'Drag & drop or click to browse files'
              }
            </p>
            
            {/* Enhanced file requirements with icons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 border transition-all duration-300 ${
                isDragAccept ? 'border-emerald-300 bg-emerald-100' : 'border-emerald-100'
              }`}>
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg p-1">
                  <span className="text-white text-xs">📄</span>
                </div>
                <span className="font-semibold text-gray-700">PDF files only</span>
              </div>
              <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-1">
                  <span className="text-white text-xs">💾</span>
                </div>
                <span className="font-semibold text-gray-700">Up to 10MB</span>
              </div>
              <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-100">
                <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg p-1">
                  <span className="text-white text-xs">📊</span>
                </div>
                <span className="font-semibold text-gray-700">100 pages max</span>
              </div>
            </div>
          </div>
          
          {!disabled && (
            <button
              type="button"
              className="group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xl px-12 py-5 rounded-full shadow-large hover:shadow-glow-orange transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center space-x-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📁</span>
                <span>Choose Your File</span>
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">✨</span>
              </span>
            </button>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Premium error display with enhanced styling */}
      {error && (
        <Card className="mt-8 animate-slide-down bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-3 shadow-medium">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-red-800 mb-2">Upload Error</CardTitle>
                <CardDescription className="text-red-700 font-medium text-lg">{error}</CardDescription>
              </div>
            </div>
            <div className="mt-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-red-100">
              <p className="text-sm text-red-600 font-medium">
                💡 <strong>Quick fix:</strong> Make sure your file is a PDF under 10MB with readable text content.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium file requirements section */}
      <Card className="mt-12 bg-gradient-to-r from-orange-25 to-amber-25 border border-orange-100 shadow-soft">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-3 shadow-medium mx-auto w-12 h-12 flex items-center justify-center mb-4">
            <span className="text-white text-xl">📋</span>
          </div>
          <CardTitle className="text-2xl font-black text-gray-900 mb-2">File Requirements</CardTitle>
          <CardDescription className="text-lg text-gray-600 font-medium">Everything you need to know for perfect results</CardDescription>
        </CardHeader>
        <CardContent>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border border-emerald-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl p-2 shadow-medium">
                  <span className="text-white text-lg">📄</span>
                </div>
                <div>
                  <CardTitle className="font-bold text-gray-900 text-lg mb-1">PDF Format Only</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Standard PDF documents work best</CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border border-blue-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-2 shadow-medium">
                  <span className="text-white text-lg">💾</span>
                </div>
                <div>
                  <CardTitle className="font-bold text-gray-900 text-lg mb-1">10MB Max Size</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Optimized for fast processing</CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border border-purple-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl p-2 shadow-medium">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div>
                  <CardTitle className="font-bold text-gray-900 text-lg mb-1">100 Pages Limit</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Perfect for most documents</CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border border-amber-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-2 shadow-medium">
                  <span className="text-white text-lg">🔤</span>
                </div>
                <div>
                  <CardTitle className="font-bold text-gray-900 text-lg mb-1">Text-Based PDFs</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Searchable text works best</CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Premium pro tip */}
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl p-2 shadow-medium">
                <span className="text-white text-lg">💡</span>
              </div>
              <div>
                <CardTitle className="font-bold text-gray-900 text-lg mb-2">Pro Tips for Best Results</CardTitle>
                <ul className="space-y-2 text-gray-700 font-medium">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    <span>Use text-searchable PDFs for highest accuracy</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    <span>Tables with clear borders extract better</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    <span>Avoid heavily formatted or rotated tables</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </CardContent>
      </Card>
    </div>
  )
}