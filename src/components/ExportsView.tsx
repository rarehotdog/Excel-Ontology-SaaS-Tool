import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Database, Share2, Sparkles, RefreshCw, Eye, X, Code } from 'lucide-react';

export function ExportsView() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null); // File metadata for preview
  const [previewData, setPreviewData] = useState<any[]>([]); // Actual data rows
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleDownload = async (filename: string, format: 'csv' | 'excel' | 'json') => {
    try {
      const res = await fetch(`http://localhost:8000/export/download?filename=${filename}&format=${format}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        let ext = 'csv';
        if (format === 'excel') ext = 'xlsx';
        if (format === 'json') ext = 'json';

        a.download = `${filename.split('.')[0]}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handlePreview = async (file: any) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
    // In a real app, we might fetch a sample here. 
    // For now, we use the 'head' data already in metadata if available, 
    // or we could fetch it. Let's assume 'head' is in file metadata from /data/list
    if (file.head) {
      setPreviewData(file.head);
    }
  };

  return (
    <div className="h-full overflow-auto relative">
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
                <p className="text-gray-600">Download, preview, and integrate your data.</p>
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
          {/* Export Options */}
          <div className="grid grid-cols-4 gap-6">
            <div className="group bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-8 shadow-xl shadow-emerald-200/50 text-white transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">Excel</h3>
              <p className="text-sm text-emerald-100">Full formatting supported</p>
            </div>

            <div className="group bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-8 shadow-xl shadow-blue-200/50 text-white transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">CSV</h3>
              <p className="text-sm text-blue-100">Universal compatibility</p>
            </div>

            <div className="group bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-8 shadow-xl shadow-purple-200/50 text-white transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">JSON</h3>
              <p className="text-sm text-purple-100">Web & API ready</p>
            </div>

            <div className="group bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl p-8 shadow-xl shadow-pink-200/50 text-white opacity-60 cursor-not-allowed">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">Database</h3>
              <p className="text-sm text-pink-100">Coming Soon</p>
            </div>
          </div>

          {/* File List */}
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
                        onClick={() => handlePreview(file)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                      <button
                        onClick={() => handleDownload(file.filename, 'json')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors"
                      >
                        <Code className="w-4 h-4" /> JSON
                      </button>
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

      {/* Preview Modal */}
      {isPreviewOpen && previewFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{previewFile.filename}</h3>
                <p className="text-sm text-gray-500">Previewing first 5 rows</p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewFile.columns.map((col: string) => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {previewFile.columns.map((col: string) => (
                          <td key={`${idx}-${col}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(previewFile.filename, 'excel')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200"
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
