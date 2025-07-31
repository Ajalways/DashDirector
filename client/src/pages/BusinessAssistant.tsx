import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingDown, 
  DollarSign, 
  Users,
  Clock,
  ArrowLeft,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Link } from 'wouter';

interface Insight {
  type: 'fraud' | 'loss' | 'opportunity' | 'metric';
  title: string;
  value?: string | number;
  records?: Array<{
    id: string;
    type: string;
    title: string;
    amount?: number;
    date?: string;
  }>;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: Insight[];
}

const SAMPLE_QUESTIONS = [
  "Why did I lose money in June?",
  "What's the total payroll this year?", 
  "Which team is costing me more than they bring in?",
  "Show me suspicious transactions",
  "What's my biggest expense category?",
  "Which clients haven't paid their invoices?",
  "How many new customers this quarter?",
  "What changed in my profit margins?"
];

export default function BusinessAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/business-assistant/ask', { question });
      return response.json();
    },
    onSuccess: (data: { answer: string; insights: any[] }) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        insights: data.insights || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Failed to get AI response:', error);
      setIsTyping(false);
      toast({
        title: 'Assistant Error',
        description: 'Failed to get response from business assistant.',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = (question?: string) => {
    const messageText = question || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Send to AI
    askQuestionMutation.mutate(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderInsight = (insight: Insight) => {
    const getInsightIcon = () => {
      switch (insight.type) {
        case 'fraud': return <AlertTriangle className="w-4 h-4 text-red-500" />;
        case 'loss': return <TrendingDown className="w-4 h-4 text-red-500" />;
        case 'opportunity': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
        case 'metric': return <CheckCircle className="w-4 h-4 text-green-500" />;
        default: return <Sparkles className="w-4 h-4 text-blue-500" />;
      }
    };

    const getInsightColor = () => {
      switch (insight.type) {
        case 'fraud': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
        case 'loss': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
        case 'opportunity': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
        case 'metric': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
        default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      }
    };

    return (
      <div key={insight.title} className={`p-3 rounded-lg border ${getInsightColor()}`}>
        <div className="flex items-center gap-2 mb-2">
          {getInsightIcon()}
          <span className="font-medium text-sm">{insight.title}</span>
          {insight.value && (
            <Badge variant="secondary" className="ml-auto">
              {insight.value}
            </Badge>
          )}
        </div>
        {insight.records && insight.records.length > 0 && (
          <div className="space-y-1">
            {insight.records!.slice(0, 3).map((record: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <span>{record.title}</span>
                {record.amount && (
                  <span className="font-mono">${record.amount.toLocaleString()}</span>
                )}
              </div>
            ))}
            {insight.records.length > 3 && (
              <div className="text-xs text-gray-500 italic">
                +{insight.records.length - 3} more records
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary" />
              Business Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ask questions about your business in plain English - no forms or filters needed
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sample Questions Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Try asking...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SAMPLE_QUESTIONS.map((question, idx) => (
              <Button
                key={idx}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto py-2 px-3"
                onClick={() => handleSendMessage(question)}
                disabled={askQuestionMutation.isPending}
              >
                <span className="text-sm leading-relaxed">{question}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Chat with your business data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-[500px] p-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm">Ask anything about your business metrics, finances, or operations</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className="mb-6">
                  <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Insights for assistant messages */}
                      {message.type === 'assistant' && message.insights && message.insights.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.insights.map((insight, idx) => (
                            <div key={idx}>
                              {renderInsight(insight)}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 mb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <Separator />
            
            {/* Input */}
            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your business... (e.g., 'Why did profits drop last month?')"
                  disabled={askQuestionMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || askQuestionMutation.isPending}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}