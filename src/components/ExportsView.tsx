import { Download, FileSpreadsheet, FileText, Database, Share2, Sparkles } from 'lucide-react';

export function ExportsView() {
  const exports = [
    { id: 1, name: 'Monthly Sales Report', format: 'Excel', date: '2024-12-04', size: '2.4 MB', status: 'completed', color: 'emerald' },
    { id: 2, name: 'Customer Analytics', format: 'CSV', date: '2024-12-03', size: '1.1 MB', status: 'completed', color: 'blue' },
    { id: 3, name: 'Project Dashboard', format: 'PDF', date: '2024-12-03', size: '890 KB', status: 'completed', color: 'purple' },
    { id: 4, name: 'Financial Summary Q4', format: 'Excel', date: '2024-12-02', size: '3.2 MB', status: 'processing', color: 'pink' },
  ];

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
                <Download className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900 mb-1">Exports</h1>
                <p className="text-gray-600">변환된 데이터를 다양한 형식으로 내보내기</p>
              </div>
            </div>
            <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white rounded-2xl shadow-lg shadow-teal-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Sparkles className="w-6 h-6" />
              <span>New Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Export Options */}
          <div className="grid grid-cols-4 gap-6">
            <button className="group bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 rounded-3xl p-8 shadow-xl shadow-emerald-200/50 text-white hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">Excel</h3>
              <p className="text-sm text-emerald-100">Export as .xlsx</p>
            </button>

            <button className="group bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 rounded-3xl p-8 shadow-xl shadow-blue-200/50 text-white hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">CSV</h3>
              <p className="text-sm text-blue-100">Export as .csv</p>
            </button>

            <button className="group bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 rounded-3xl p-8 shadow-xl shadow-purple-200/50 text-white hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">Database</h3>
              <p className="text-sm text-purple-100">Export to DB</p>
            </button>

            <button className="group bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 rounded-3xl p-8 shadow-xl shadow-pink-200/50 text-white hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-1">API</h3>
              <p className="text-sm text-pink-100">Export via API</p>
            </button>
          </div>

          {/* Export History */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-xl text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                Export History
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {exports.map((exp) => (
                <div key={exp.id} className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-2xl hover:shadow-lg transition-all hover:scale-102 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br transition-all group-hover:scale-110
                        ${exp.color === 'emerald' ? 'from-emerald-400 to-emerald-600 shadow-emerald-200' : ''}
                        ${exp.color === 'blue' ? 'from-blue-400 to-blue-600 shadow-blue-200' : ''}
                        ${exp.color === 'purple' ? 'from-purple-400 to-purple-600 shadow-purple-200' : ''}
                        ${exp.color === 'pink' ? 'from-pink-400 to-pink-600 shadow-pink-200' : ''}
                      `}>
                        <FileSpreadsheet className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg text-gray-900 mb-2">{exp.name}</h4>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            {exp.format}
                          </span>
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            {exp.date}
                          </span>
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            {exp.size}
                          </span>
                          <span className={`
                            px-4 py-1.5 rounded-full text-xs
                            ${exp.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                            ${exp.status === 'processing' ? 'bg-blue-100 text-blue-700 animate-pulse' : ''}
                          `}>
                            {exp.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 hover:scale-105 transition-all">
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
