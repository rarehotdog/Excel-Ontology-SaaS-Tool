import { useState, useRef, useEffect } from 'react';
import { Upload, Database, FileSpreadsheet, Plus, Search, Sparkles } from 'lucide-react';

export function DataSources() {
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
        throw new Error('Upload failed');
      }

      const data = await response.json();
      // Refresh list
      await fetchDataSources();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleFileSelection = (filename: string) => {
    setSelectedFiles(prev =>
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
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
      // In a real app, we would let the user configure columns. 
      // For this demo, we assume standard columns or ask user.
      // Hardcoding for demo purposes based on drivers_log.csv structure
      const rules = {
        overlapping_time: { start_col: "start_time", end_col: "end_time", user_id_col: "user_id" },
        zero_distance: { distance_col: "distance", amount_col: "amount" }
      };

      const response = await fetch('http://localhost:8000/etl/anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, rules }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      const { total_anomalies, details } = data.results;

      if (total_anomalies > 0) {
        alert(`Found ${total_anomalies} anomalies!\n\n${details.map((d: any) => `- [${d.type}] ${d.details}`).join('\n')}`);
      } else {
        alert('No anomalies found.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze file. Ensure columns match expected format (start_time, end_time, etc.)');
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
                  onClick={handleMerge}
                  disabled={isMerging}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                  {isMerging ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                  <span>Merge ({selectedFiles.length})</span>
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
                <span>{isUploading ? 'Uploading...' : 'Add Source'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-purple-100/50">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search data sources..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-300 focus:bg-white transition-all"
                />
              </div>
              <select className="px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-700 focus:outline-none focus:border-emerald-300">
                <option>All Types</option>
                <option>Excel</option>
                <option>CSV</option>
                <option>Database</option>
              </select>
            </div>
          </div>

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
                    {/* Checkbox for selection */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedFiles.includes(source.name) ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                      {selectedFiles.includes(source.name) && <div className="w-3 h-3 bg-white rounded-full" />}
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
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyze(source.name);
                      }}
                      className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all hover:scale-105"
                    >
                      Analyze
                    </button>
                    <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all hover:scale-105">
                      View
                    </button>
                    <button className="px-6 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-all hover:scale-105">
                      Configure
                    </button>
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
