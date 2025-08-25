'use client'

import React from 'react'
import { Check, Zap, Target, Star, Crown } from 'lucide-react'
import { PRICING_PLANS, formatPrice, type PricingPlan } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PricingCardProps {
  plan: PricingPlan
  config: typeof PRICING_PLANS[PricingPlan]
  onSelectPlan: (plan: PricingPlan) => void
}

function PricingCard({ plan, config, onSelectPlan }: PricingCardProps) {
  return (
    <Card className={`relative transition-all duration-200 hover:shadow-xl ${
      config.popular 
        ? 'border-orange-300 shadow-xl ring-2 ring-orange-200 scale-105' 
        : 'hover:scale-105'
    }`}>
      {config.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1">
            <Star className="h-4 w-4 fill-current mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          {plan === 'BUSINESS' && <Crown className="h-6 w-6 text-orange-500" />}
          {config.name}
        </CardTitle>
        <CardDescription className="text-base">
          {config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center pb-2">
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-900">
              {formatPrice(config.price)}
            </span>
            {config.interval && (
              <span className="ml-2 text-xl text-muted-foreground">/{config.interval}</span>
            )}
          </div>
          {config.price > 0 && (
            <p className="mt-2 text-sm text-orange-600 font-medium">
              {config.limits.monthly > 0 
                ? `${config.limits.monthly.toLocaleString()} pages/month` 
                : 'Unlimited pages'
              }
            </p>
          )}
        </div>

        <Button
          onClick={() => onSelectPlan(plan)}
          className={`w-full mb-6 ${
            config.popular
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
              : plan === 'FREE'
              ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
          size="lg"
        >
          {plan === 'FREE' ? 'Get Started Free' : 'Choose Plan'}
        </Button>
        
        <ul className="space-y-3 text-left">
          {config.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                config.popular ? 'text-orange-500' : 'text-green-500'
              }`} />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

interface PricingSectionProps {
  onSelectPlan?: (plan: PricingPlan) => void
}

export default function PricingSection({ onSelectPlan = () => {} }: PricingSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include our premium table extraction with 95%+ accuracy.
          </p>
          
          {/* Value Proposition */}
          <Card className="mt-8 inline-block bg-orange-50 border-orange-200">
            <CardContent className="flex flex-wrap items-center gap-6 p-6">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-orange-500" />
                <span className="font-semibold text-orange-800">25-50% More Pages</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-orange-500" />
                <span className="font-semibold text-orange-800">17-33% Less Cost</span>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                vs competitors
              </Badge>
            </CardContent>
          </Card>
        </div>
        
        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {(Object.entries(PRICING_PLANS) as [PricingPlan, typeof PRICING_PLANS[PricingPlan]][]).map(([plan, config]) => (
            <PricingCard
              key={plan}
              plan={plan}
              config={config}
              onSelectPlan={onSelectPlan}
            />
          ))}
        </div>
        
        {/* FAQ Teaser */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground">
            Questions about our pricing?{' '}
            <Button variant="link" className="p-0 h-auto font-semibold text-orange-600 hover:text-orange-700">
              Check our FAQ
            </Button>
          </p>
        </div>
        
        {/* Enterprise CTA */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Crown className="h-8 w-8 text-orange-400" />
              Enterprise & Custom Solutions
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg max-w-2xl mx-auto">
              Need unlimited processing, custom integrations, or dedicated infrastructure? 
              We work with large organizations to provide tailored PDF table extraction solutions.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-orange-400 font-bold text-xl mb-2">Unlimited Pages</div>
                <div className="text-gray-400 text-sm">No monthly limits</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-bold text-xl mb-2">99.9% SLA</div>
                <div className="text-gray-400 text-sm">Guaranteed uptime</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-bold text-xl mb-2">Custom Integration</div>
                <div className="text-gray-400 text-sm">API & white-label options</div>
              </div>
            </div>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-3">
              Contact Sales Team
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}