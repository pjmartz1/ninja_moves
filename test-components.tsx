import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PDFTableProHero } from '@/components/ui/hero-highlight-demo'

export default function TestComponents() {
  return (
    <div className="p-8">
      <h1>Component Test</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>If you can see this styled card, shadcn/ui is working!</p>
        </CardContent>
      </Card>
      
      <div className="h-64">
        <PDFTableProHero />
      </div>
    </div>
  )
}