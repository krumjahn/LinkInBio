'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getSupabaseClient, type HistoryRecord, initializeDatabase } from '@/lib/supabase';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize database and load history
    const init = async () => {
      try {
        console.log('History page: Initializing...');
        // Try to initialize the database first
        const initResult = await initializeDatabase();
        console.log('History page: Database initialization result:', initResult);
        
        // Then load the history
        console.log('History page: Loading history...');
        await loadHistory();
      } catch (error) {
        console.error('History page: Error initializing:', error);
        setError('Failed to initialize database: ' + (error instanceof Error ? error.message : String(error)));
      }
    };
    init();
  }, [activeTab]);

  const loadHistory = async () => {
    try {
      console.log('loadHistory: Starting to load history...');
      setLoading(true);
      setError(null);
      
      // Create a fresh client instance for client-side use
      console.log('loadHistory: Creating Supabase client...');
      const supabaseClient = getSupabaseClient();
      console.log('loadHistory: Supabase client created successfully');
      
      // First, check if we can connect to Supabase
      console.log('loadHistory: Testing Supabase connection...');
      const { data: healthCheck, error: healthError } = await supabaseClient
        .from('history')
        .select('count');

      if (healthError) {
        console.error('loadHistory: Supabase connection error:', healthError);
        console.error('loadHistory: Error details:', {
          message: healthError.message,
          code: healthError.code,
          details: healthError.details,
          hint: healthError.hint
        });
        
        if (healthError.message.includes('invalid api key')) {
          setError('Database authentication error. Please check your API key configuration.');
        } else if (healthError.message.includes('relation "history" does not exist')) {
          setError('History table not found. Please run some analyses to create it.');
        } else {
          setError(`Database connection error: ${healthError.message}`);
        }
        return;
      }
      
      console.log('loadHistory: Connection test successful:', healthCheck);

      // If connection is good, proceed with the query
      let query = supabaseClient
        .from('history')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('type', activeTab);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading history:', error);
        setError(`Failed to load history: ${error.message}`);
        return;
      }
      
      setHistory(data || []);
    } catch (error: any) {
      console.error('Error loading history:', error);
      setError(`Unexpected error: ${error?.message || 'Failed to load history'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderContent = (record: HistoryRecord) => {
    try {
      const output = JSON.parse(record.output);
      
      switch (record.type) {
        case 'news':
          return (
            <div className="space-y-4">
              <p className="font-medium">Search Query: {record.input}</p>
              <div className="space-y-2">
                {output.map((article: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-gray-600">{article.description}</p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-blue-600 hover:underline">
                      Read more
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'title':
          return (
            <div className="space-y-4">
              <p className="font-medium">Topic: {record.input}</p>
              <div className="space-y-2">
                {output.map((title: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">{title.title}</h4>
                    <div className="mt-2 text-sm">
                      <span className="text-blue-600">News Score: {title.newsScore}</span>
                      <span className="mx-2">•</span>
                      <span className="text-green-600">Search Score: {title.searchScore}</span>
                      <span className="mx-2">•</span>
                      <span className="text-purple-600">Overall Score: {title.score}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{title.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          );

        default:
          return <pre className="whitespace-pre-wrap">{JSON.stringify(output, null, 2)}</pre>;
      }
    } catch (error) {
      return <pre className="whitespace-pre-wrap">{record.output}</pre>;
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Analysis History</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No history found. Try running some analyses first!
        </div>
      ) : (
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="news">News Analysis</TabsTrigger>
          <TabsTrigger value="title">Title Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {history.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <CardTitle>{record.type === 'news' ? 'News Analysis' : 'Title Generation'}</CardTitle>
                  <CardDescription>{formatDate(record.created_at!)}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(record)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="news" className="mt-6">
          <div className="space-y-4">
            {history.filter(r => r.type === 'news').map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <CardTitle>News Analysis</CardTitle>
                  <CardDescription>{formatDate(record.created_at!)}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(record)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="title" className="mt-6">
          <div className="space-y-4">
            {history.filter(r => r.type === 'title').map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <CardTitle>Title Generation</CardTitle>
                  <CardDescription>{formatDate(record.created_at!)}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(record)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
