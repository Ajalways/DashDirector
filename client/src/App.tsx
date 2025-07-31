import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect, Suspense, lazy } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

// Lazy load pages for code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const FraudDetection = lazy(() => import("@/pages/FraudDetection"));
const AiFraudDetection = lazy(() => import("@/pages/AiFraudDetection"));
const Accounting = lazy(() => import("@/pages/Accounting"));
const Documents = lazy(() => import("@/pages/Documents"));
const PerformanceInsights = lazy(() => import("@/pages/PerformanceInsights"));
const EmployeeDirectory = lazy(() => import("@/pages/EmployeeDirectory"));
const TeamManagement = lazy(() => import("@/pages/TeamManagement"));
const Settings = lazy(() => import("@/pages/Settings"));
const WhatChanged = lazy(() => import("@/pages/WhatChanged"));
const BusinessAssistant = lazy(() => import("@/pages/BusinessAssistant"));
const OwnerPanel = lazy(() => import("@/pages/OwnerPanel"));
const DomainSetup = lazy(() => import("@/pages/DomainSetup"));
const FinancialAnalysis = lazy(() => import("@/pages/FinancialAnalysis"));
const SpendingAnalyzer = lazy(() => import("@/pages/SpendingAnalyzer"));
const LazyBusinessRecommendations = lazy(() => import("@/components/LazyBusinessRecommendations"));
const EnterpriseSettings = lazy(() => import("@/pages/EnterpriseSettings"));
const NotFound = lazy(() => import("@/pages/not-found"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/">
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/tasks">
              <ProtectedRoute>
                <AppLayout>
                  <Tasks />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/fraud-detection">
              <ProtectedRoute>
                <AppLayout>
                  <FraudDetection />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/ai-fraud-detection">
              <ProtectedRoute>
                <AppLayout>
                  <AiFraudDetection />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/accounting">
              <ProtectedRoute>
                <AppLayout>
                  <Accounting />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/documents">
              <ProtectedRoute>
                <AppLayout>
                  <Documents />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/performance">
              <ProtectedRoute>
                <AppLayout>
                  <PerformanceInsights />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/employees">
              <ProtectedRoute>
                <AppLayout>
                  <EmployeeDirectory />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/team">
              <ProtectedRoute>
                <AppLayout>
                  <TeamManagement />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/what-changed">
              <ProtectedRoute>
                <AppLayout>
                  <WhatChanged />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/business-assistant">
              <ProtectedRoute>
                <AppLayout>
                  <BusinessAssistant />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/owner-panel">
              <ProtectedRoute>
                <AppLayout>
                  <OwnerPanel />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/settings">
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/enterprise">
              <ProtectedRoute>
                <AppLayout>
                  <EnterpriseSettings />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/domain-setup">
              <ProtectedRoute>
                <AppLayout>
                  <DomainSetup />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/financial-analysis">
              <ProtectedRoute>
                <AppLayout>
                  <FinancialAnalysis />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/spending-analyzer">
              <ProtectedRoute>
                <AppLayout>
                  <SpendingAnalyzer />
                </AppLayout>
              </ProtectedRoute>
            </Route>
            <Route path="/business-recommendations">
              <ProtectedRoute>
                <AppLayout>
                  <LazyBusinessRecommendations />
                </AppLayout>
              </ProtectedRoute>
            </Route>
          </>
        )}
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
}

export default App;