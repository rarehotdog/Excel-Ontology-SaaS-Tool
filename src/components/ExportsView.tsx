import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Database, Share2, Sparkles, RefreshCw } from 'lucide-react';

export function ExportsView() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/data/list');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename: string, format: 'csv' | 'excel') => {
    try {
      const res = await fetch(`http://localhost:8000/export/download?filename=${filename}&format=${format}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = format === 'excel' ? `${filename.split('.')[0]}.xlsx` : `${filename.split('.')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-teal-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
                <Download className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900 mb-1">Export Center</h1>
                <p className="text-gray-600">Download your transformed data</p>
              </div>
            </div>
            <button
              onClick={fetchFiles}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh List</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Export Options (Static for now) */}
          <div className="grid grid-cols-4 gap-6">
            <div className="group bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-8 shadow-xl shadow-emerald-200/50 text-white transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">Excel</h3>
              <p className="text-sm text-emerald-100">Supported</p>
            </div>

            <div className="group bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-8 shadow-xl shadow-blue-200/50 text-white transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">CSV</h3>
              <p className="text-sm text-blue-100">Supported</p>
            </div>

            <div className="group bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-8 shadow-xl shadow-purple-200/50 text-white opacity-60 cursor-not-allowed">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">Database</h3>
              <p className="text-sm text-purple-100">Coming Soon</p>
            </div>

            <div className="group bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl p-8 shadow-xl shadow-pink-200/50 text-white opacity-60 cursor-not-allowed">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">API</h3>
              <p className="text-sm text-pink-100">Coming Soon</p>
            </div>
          </div>

          {/* Export History / File List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-teal-100/50 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-teal-50 to-emerald-50">
              <h3 className="text-xl text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                Available Files
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {files.map((file) => (
                <div key={file.filename} className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-2xl hover:shadow-lg transition-all hover:scale-[1.01]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg text-gray-900 mb-2">{file.filename}</h4>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            {file.columns.length} Columns
                          </span>
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            {file.shape[0]} Rows
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownload(file.filename, 'csv')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
                      >
                        <FileText className="w-4 h-4" /> CSV
                      </button>
                      <button
                        onClick={() => handleDownload(file.filename, 'excel')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4" /> Excel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {files.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  No files available. Upload or transform data first.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
