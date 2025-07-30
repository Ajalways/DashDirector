import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import FraudDetection from "@/pages/FraudDetection";
import AiFraudDetection from "@/pages/AiFraudDetection";
import Accounting from "@/pages/Accounting";
import Documents from "@/pages/Documents";
import PerformanceInsights from "@/pages/PerformanceInsights";
import EmployeeDirectory from "@/pages/EmployeeDirectory";
import TeamManagement from "@/pages/TeamManagement";
import Settings from "@/pages/Settings";
import WhatChanged from "@/pages/WhatChanged";
import BusinessAssistant from "@/pages/BusinessAssistant";
import OwnerPanel from "@/pages/OwnerPanel";
import DomainSetup from "@/pages/DomainSetup";
import FinancialAnalysis from "@/pages/FinancialAnalysis";
import SpendingAnalyzer from "@/pages/SpendingAnalyzer";
import LazyBusinessRecommendations from "@/components/LazyBusinessRecommendations";
import EnterpriseSettings from "@/pages/EnterpriseSettings";
import NotFound from "@/pages/not-found";

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
