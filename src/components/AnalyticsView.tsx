import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, BarChart2, PieChart as PieIcon, Activity, AlertCircle } from 'lucide-react';

interface AnalyticsViewProps {
  // Add props if needed
}

interface FileMeta {
  filename: str;
  columns: string[];
  shape: [number, number];
  head: any[];
}

interface SummaryStats {
  total_rows: number;
  total_columns: number;
  missing_values: number;
  completeness: number;
  columns: {
    name: string;
    type: string;
    missing: number;
    unique: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AnalyticsView() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);

  // Fetch file list on mount
  useEffect(() => {
    fetch('http://localhost:8000/data/list')
      .then(res => res.json())
      .then(data => {
        setFiles(data);
        if (data.length > 0) {
          setSelectedFile(data[0].filename);
        }
      })
      .catch(err => console.error("Failed to fetch files:", err));
  }, []);

  // Fetch summary when file changes
  useEffect(() => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setSummary(null);
    setChartData(null);
    setSelectedColumn('');

    fetch('http://localhost:8000/analytics/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: selectedFile })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch summary');
        return res.json();
      })
      .then(data => {
        setSummary(data);
        // Default to first column for chart
        if (data.columns.length > 0) {
          setSelectedColumn(data.columns[0].name);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedFile]);

  // Fetch chart data when column changes
  useEffect(() => {
    if (!selectedFile || !selectedColumn) return;

    fetch('http://localhost:8000/analytics/distribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: selectedFile, column: selectedColumn })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          setChartData(data);
        }
      })
      .catch(err => console.error("Failed to fetch chart data:", err));
  }, [selectedFile, selectedColumn]);

  return (
    <div className="h-full overflow-auto p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header & File Selection */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insight Advisor</h1>
            <p className="text-gray-500 mt-1">Explore your data with automated statistics and visualizations.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Analyzing:</span>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              {files.map(f => (
                <option key={f.filename} value={f.filename}>{f.filename}</option>
              ))}
              {files.length === 0 && <option disabled>No files available</option>}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {summary && !loading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Rows</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.total_rows.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Columns</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.total_columns}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <BarChart2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completeness</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.completeness}%</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Missing Values</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.missing_values.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column: Column List */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Data Columns</h3>
                </div>
                <div className="overflow-y-auto max-h-[600px]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summary.columns.map((col) => (
                        <tr
                          key={col.name}
                          onClick={() => setSelectedColumn(col.name)}
                          className={`cursor-pointer hover:bg-indigo-50 transition-colors ${selectedColumn === col.name ? 'bg-indigo-50' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate max-w-[150px]">{col.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{col.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Visualization */}
              <div className="lg:col-span-2 space-y-6">

                {/* Chart Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Distribution: {selectedColumn}</h3>
                    <p className="text-sm text-gray-500">
                      {chartData?.type === 'numeric' ? 'Histogram of values' : 'Top 10 most frequent values'}
                    </p>
                  </div>

                  <div className="h-[300px] w-full">
                    {chartData && chartData.data.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        No data available for this column
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Insights (Placeholder for AI) */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                      <p className="text-indigo-100 text-sm mb-4">
                        Based on the analysis of <strong>{selectedColumn}</strong>, here are some automated observations:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                          Data distribution appears {chartData?.type === 'numeric' ? 'normal' : 'skewed'}.
                        </li>
                        <li className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                          {summary.missing_values > 0 ? `${summary.missing_values} missing values detected across the dataset.` : 'Data quality is high with no missing values.'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

        {!selectedFile && !loading && (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Data Selected</h3>
            <p className="text-gray-500 mt-2">Please upload and select a file to view insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 3v4" />
      <path d="M3 5h4" />
      <path d="M3 9h4" />
    </svg>
  )
}
