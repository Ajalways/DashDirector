import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Upload, 
  Search, 
  Eye,
  Download,
  Calendar,
  User,
  Tag,
  Brain,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  category: string;
  entityType?: string;
  entityId?: string;
  ocrText?: string;
  tags: string[];
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: 'general', label: 'General' },
  { value: 'receipt', label: 'Receipts' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'contract', label: 'Contracts' },
  { value: 'permit', label: 'Permits' },
  { value: 'report', label: 'Reports' },
  { value: 'tax', label: 'Tax Documents' },
  { value: 'legal', label: 'Legal Documents' },
];

export default function Documents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState('general');

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', selectedCategory],
    retry: false,
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents/search', searchQuery, selectedCategory],
    enabled: searchQuery.trim().length > 0,
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Upload Successful',
        description: 'Document has been uploaded and processed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: () => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', uploadCategory);

    uploadMutation.mutate(formData);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Eye className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const displayedDocuments = searchQuery.trim() ? searchResults : documents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
            <p className="text-muted-foreground">
              Upload, organize, and analyze your business documents with AI
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.txt,.doc,.docx"
          />
        </div>
      </div>

      {/* Upload Category Selection */}
      {uploadMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Uploading Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>Processing document with AI analysis...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by content, name, or metadata..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={uploadCategory} onValueChange={setUploadCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                Upload as {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        {categories.slice(0, 3).map((category) => {
          const count = documents.filter((doc: Document) => doc.category === category.value).length;
          return (
            <Card key={category.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {category.value} documents
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery.trim() ? `Search Results (${displayedDocuments.length})` : 'All Documents'}
          </CardTitle>
          <CardDescription>
            {searchLoading && searchQuery.trim() ? 'Searching documents...' : 
             'Manage and analyze your uploaded documents'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || (searchLoading && searchQuery.trim()) ? (
            <div className="flex items-center space-x-2 py-8">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>Loading documents...</span>
            </div>
          ) : displayedDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery.trim() ? 'No documents found' : 'No documents uploaded'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery.trim() 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Upload your first document to get started with AI-powered analysis.'
                }
              </p>
              {!searchQuery.trim() && (
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedDocuments.map((document: Document) => (
                <div key={document.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.fileType)}
                      <div>
                        <h3 className="font-medium">{document.originalName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(document.fileSize)} • {document.fileType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{document.category}</Badge>
                      {document.ocrText && (
                        <Badge variant="secondary">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Analyzed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {document.ocrText && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium mb-2">AI-Extracted Content:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {document.ocrText}
                      </p>
                    </div>
                  )}

                  {document.tags && document.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Uploaded {new Date(document.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>By {document.uploadedById}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}