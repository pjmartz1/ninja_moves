'use client'

import React from 'react'
import FileUploader from '@/components/upload/FileUploader'

export default function TestFileUploaderPage() {
  console.log('TestFileUploaderPage rendering...')
  
  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name)
  }
  
  try {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8">
        <h1 className="text-2xl font-bold text-center mb-8">FileUploader Component Test</h1>
        
        <div className="max-w-2xl mx-auto">
          <FileUploader onFileUpload={handleFileUpload} />
        </div>
        
        <p className="text-center text-lg mt-8">If you see the file uploader with shadcn/ui Cards above, it works!</p>
      </main>
    )
  } catch (error) {
    console.error('Error rendering FileUploader:', error)
    return <div className="p-8 text-red-500">ERROR: FileUploader failed to render - {String(error)}</div>
  }
}