'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getSupabaseClient, type HistoryRecord, initializeDatabase } from '@/lib/supabase';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [activeTab, setActiveTab] = useState('title'); // Default to title tab only
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

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
      // Only load title generation history
      const query = supabaseClient
        .from('history')
        .select('*')
        .eq('type', 'title')
        .order('created_at', { ascending: false });

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

  const handleRecordClick = (record: HistoryRecord) => {
    setSelectedRecord(record);
  };
  
  const renderTitleList = () => {
    return (
      <div className="space-y-4">
        {history.map((record) => (
          <Card 
            key={record.id} 
            className={`cursor-pointer transition-colors ${selectedRecord?.id === record.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
            onClick={() => handleRecordClick(record)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{formatDate(record.created_at!)}</CardTitle>
              <CardDescription>Topic: {record.input}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {(() => {
                    try {
                      const titles = JSON.parse(record.output);
                      return `${titles.length} title${titles.length !== 1 ? 's' : ''} generated`;
                    } catch (e) {
                      return 'Error parsing titles';
                    }
                  })()}
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderSelectedRecord = () => {
    if (!selectedRecord) {
      return (
        <div className="text-center py-12 text-gray-500">
          Select a record from the list to view details
        </div>
      );
    }
    
    try {
      const titles = JSON.parse(selectedRecord.output);
      
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium">Topic: {selectedRecord.input}</h3>
            <span className="text-sm text-gray-500">{formatDate(selectedRecord.created_at!)}</span>
          </div>
          
          <div className="space-y-4">
            {titles.map((title: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-lg">{title.title}</h4>
                <div className="mt-2 text-sm flex flex-wrap gap-2">
                  <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">News Score: {title.newsScore}</span>
                  <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Search Score: {title.searchScore}</span>
                  <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded">Overall Score: {title.score}</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{title.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      return <div className="text-red-500">Error parsing title data</div>;
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Title Generation History</h1>
      
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
          No title generation history found. Generate some titles first!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Generated Titles</h2>
            {renderTitleList()}
          </div>

          <div className="md:col-span-2 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Title Details</h2>
            {renderSelectedRecord()}
          </div>
        </div>
      )}
    </div>
  );
}
