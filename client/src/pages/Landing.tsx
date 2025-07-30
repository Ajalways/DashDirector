import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Users, BarChart3, Zap, Globe } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    try {
      // More reliable redirect for Firefox compatibility
      window.location.assign('/api/login');
    } catch (error) {
      // Fallback for problematic browsers
      console.warn('Primary redirect failed, using fallback:', error);
      window.open('/api/login', '_self');
    }
  };

  const handleViewDemo = () => {
    window.location.href = '/api/demo';
  };

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'KPI Dashboard',
      description: 'Modular widgets, charts, filters, and drill-downs for comprehensive analytics.',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Task Management',
      description: 'Customizable task boards with Kanban views. Rename to anything - Leads, Tickets, Cases.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Fraud Detection',
      description: 'Pattern detection, AI summaries, evidence links, and fraud case tracking.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Management',
      description: 'Role-based permissions, user invitations, and collaborative workspaces.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'White-Label Branding',
      description: 'Custom logos, colors, themes, and complete brand customization.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-Time Updates',
      description: 'Live activity feeds, notifications, and collaborative features.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                PulseBoardAI
              </h1>
            </div>
            <Button onClick={handleLogin} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4">
            AI-Powered Business Intelligence
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Scale Your Business with
            <span className="text-primary block">PulseBoardAI</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Powerful business intelligence platform with customizable branding, fraud detection, 
            team management, and comprehensive analytics. Built for modern businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-4">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={handleViewDemo} className="text-lg px-8 py-4">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive platform with modular features that adapt to your business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Foundation */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Enterprise Success
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Enterprise-grade foundation with data security, user management, and scalability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Secure Data Management
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Enterprise-grade data security with role-based permissions and access control
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Demo Account Mode
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Read-only or temporary data for public test accounts
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Modular Codebase
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Easy to enable/disable modules via flags or subscription level
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Full Admin Management
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Complete control over company settings, users, and configurations
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-purple-100 dark:from-primary/20 dark:to-purple-900/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Deploy
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Production-ready platform that scales with your business. Deploy to any cloud provider.
              </p>
              <Button onClick={handleLogin} className="w-full">
                Start Building Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PulseBoardAI</span>
            </div>
            <p className="text-gray-400">
              © 2024 PulseBoardAI. AI-powered business intelligence platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
