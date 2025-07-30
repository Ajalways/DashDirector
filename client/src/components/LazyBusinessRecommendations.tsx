import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load the heavy BusinessRecommendations component
const BusinessRecommendationsComponent = lazy(() => import('@/pages/BusinessRecommendations'));

function LoadingFallback() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Business Recommendations</h1>
        <p className="text-muted-foreground">Loading intelligent business insights...</p>
      </div>
      
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Initializing AI recommendation engine...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LazyBusinessRecommendations() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BusinessRecommendationsComponent />
    </Suspense>
  );
}