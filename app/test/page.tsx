'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  console.log('TestPage rendering...')
  
  try {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Component Test</h1>
        
        <Card className="mb-4 border-2 border-red-500">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>If you can see this RED BORDER card, shadcn/ui is working!</p>
          </CardContent>
        </Card>
        
        <div className="bg-blue-500 text-white p-4">
          This should be a blue box with white text
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in TestPage:', error)
    return <div className="p-8">ERROR: {String(error)}</div>
  }
}