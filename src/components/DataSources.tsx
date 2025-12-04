import { useState, useRef, useEffect } from 'react';
import { Upload, Database, FileSpreadsheet, Plus, Search, Sparkles, BarChart3, Check } from 'lucide-react';

interface DataSourcesProps {
  onAnalyzeComplete?: (data: any) => void;
}

export function DataSources({ onAnalyzeComplete }: DataSourcesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const response = await fetch('http://localhost:8000/data/list');
      if (response.ok) {
        const data = await response.json();
        const mappedSources = data.map((file: any, index: number) => ({
          id: index,
          name: file.filename,
          type: file.filename.endsWith('.csv') ? 'CSV' : 'Excel',
          rows: file.shape[0],
          status: 'active',
          lastSync: new Date().toLocaleString(),
          color: ['emerald', 'blue', 'purple', 'pink', 'orange'][index % 5],
        }));
        setSources(mappedSources);
      }
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await fetch('http://localhost:8000/data/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let message = 'Upload failed';
        try {
          const parsed = JSON.parse(errorBody);
          message =
            parsed?.detail ||
            parsed?.message ||
            (typeof parsed === 'object' ? JSON.stringify(parsed) : parsed) ||
            message;
        } catch {
          message = errorBody || message;
        }
        throw new Error(message);
      }

      const data = await response.json();
      // Refresh list
      await fetchDataSources();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      console.error('Error uploading file:', error);
      alert(`Failed to upload file. ${message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleFileSelection = (filename: string) => {
    setSelectedFiles(prev => {
      // If already selected, deselect it
      if (prev.includes(filename)) {
        return [];
      }
      // Otherwise, select ONLY this file (replace existing selection)
      return [filename];
    });
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 files to merge.');
      return;
    }

    setIsMerging(true);
    try {
      const response = await fetch('http://localhost:8000/etl/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filenames: selectedFiles,
          output_name: `merged_${new Date().getTime()}`
        }),
      });

      if (!response.ok) throw new Error('Merge failed');

      const result = await response.json();
      alert(`Merge successful! Created ${result.metadata.filename}`);

      // Refresh list and clear selection
      await fetchDataSources();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Merge error:', error);
      alert('Failed to merge files.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleAnalyze = async (filename: string) => {
    try {
      // Call the comprehensive analytics endpoint instead of just anomaly detection
      const response = await fetch('http://localhost:8000/analytics/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames: [filename] }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      
      // Pass result to parent to switch view
      if (onAnalyzeComplete) {
        onAnalyzeComplete(data);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze file. Please try again.');
    }
  };

  return (
    <div className="h-full overflow-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Header */}
      <div className="p-8 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900 mb-1">Data Sources</h1>
                <p className="text-gray-600">연결된 데이터 소스를 관리하세요</p>
              </div>
            </div>
            <div className="flex gap-3">
              {selectedFiles.length > 0 && (
                <button
                  onClick={() => {
                    if (selectedFiles.length === 1) {
                      handleAnalyze(selectedFiles[0]);
                    } else {
                      alert('Please select only one file to analyze.');
                    }
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <BarChart3 className="w-6 h-6 text-gray-900" />
                  <span className="font-semibold">Analyze</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Sources Grid */}
          <div className="grid grid-cols-1 gap-6">
            {sources.map((source) => (
              <div
                key={source.id}
                onClick={() => toggleFileSelection(source.name)}
                className={`group bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-102 cursor-pointer border-2 ${selectedFiles.includes(source.name) ? 'border-purple-500 bg-purple-50' : 'border-transparent'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    {/* Single-select indicator (checkbox-style) */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors bg-white ${
                        selectedFiles.includes(source.name)
                          ? 'border-gray-900'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedFiles.includes(source.name) && (
                        <Check className="w-3 h-3 text-gray-900" strokeWidth={3} />
                      )}
                    </div>

                    <div className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                      ${source.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200' : ''}
                      ${source.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200' : ''}
                      ${source.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-200' : ''}
                      ${source.color === 'pink' ? 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-pink-200' : ''}
                      ${source.color === 'orange' ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200' : ''}
                      group-hover:scale-110
                    `}>
                      <FileSpreadsheet className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl text-gray-900">{source.name}</h3>
                        <span className={`
                          px-4 py-1.5 rounded-full text-sm
                          ${source.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                          ${source.status === 'syncing' ? 'bg-blue-100 text-blue-700 animate-pulse' : ''}
                        `}>
                          {source.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-8 text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span>{source.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span>{source.rows.toLocaleString()} rows</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span>Last sync: {source.lastSync}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Upload Area */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-xl shadow-purple-200/50">
            <div className="bg-white/95 backdrop-blur rounded-3xl p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200 animate-pulse">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3">Upload New Data Source</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Drag and drop Excel or CSV files, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-10 py-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:shadow-2xl text-white rounded-2xl shadow-xl shadow-purple-200 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  <span>{isUploading ? 'Uploading...' : 'Select Files'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
