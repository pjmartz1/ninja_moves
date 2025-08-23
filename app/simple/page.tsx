'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SimplePage() {
  console.log('SimplePage rendering...')
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Simple Test</h1>
        
        <Card className="max-w-2xl mx-auto border-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-2xl">This should be a GREEN BORDER card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">If you see this with a thick green border, shadcn/ui Cards are working in this layout!</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}