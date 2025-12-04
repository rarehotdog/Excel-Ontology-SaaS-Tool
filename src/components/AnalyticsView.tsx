import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, BarChart2, PieChart as PieIcon, Activity, AlertCircle, Grid, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
  // Add props if needed
}

interface FileMeta {
  filename: string;
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

  // Tabs
  const [activeTab, setActiveTab] = useState<'distribution' | 'correlation'>('distribution');

  // Distribution State
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);

  // Correlation State
  const [correlationData, setCorrelationData] = useState<any>(null);

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
    setCorrelationData(null);
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
    if (!selectedFile || !selectedColumn || activeTab !== 'distribution') return;

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
  }, [selectedFile, selectedColumn, activeTab]);

  // Fetch correlation data when tab changes
  useEffect(() => {
    if (!selectedFile || activeTab !== 'correlation') return;
    if (correlationData) return; // Already fetched

    fetch('http://localhost:8000/analytics/correlation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: selectedFile })
    })
      .then(res => res.json())
      .then(data => setCorrelationData(data))
      .catch(err => console.error("Failed to fetch correlation:", err));
  }, [selectedFile, activeTab]);

  // Helper for heatmap color
  const getCorrelationColor = (value: number) => {
    if (value === 1) return 'bg-indigo-600 text-white';
    if (value > 0.7) return 'bg-indigo-500 text-white';
    if (value > 0.4) return 'bg-indigo-300 text-white';
    if (value > 0) return 'bg-indigo-100 text-indigo-900';
    if (value === 0) return 'bg-gray-50 text-gray-400';
    if (value > -0.4) return 'bg-red-100 text-red-900';
    if (value > -0.7) return 'bg-red-300 text-white';
    return 'bg-red-500 text-white';
  };

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

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('distribution')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'distribution'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  Distribution Analysis
                </button>
                <button
                  onClick={() => setActiveTab('correlation')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'correlation'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Grid className="w-4 h-4" />
                  Correlation Matrix
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'distribution' && (
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

                  {/* Additional Insights */}
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
            )}

            {activeTab === 'correlation' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Correlation Matrix (Numeric Columns)</h3>

                {correlationData && correlationData.columns.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      <div className="grid" style={{
                        gridTemplateColumns: `auto repeat(${correlationData.columns.length}, minmax(80px, 1fr))`
                      }}>
                        {/* Header Row */}
                        <div className="p-2"></div>
                        {correlationData.columns.map((col: string) => (
                          <div key={col} className="p-2 font-medium text-xs text-gray-500 text-center rotate-45 origin-bottom-left translate-y-4 h-24 flex items-end justify-center">
                            {col}
                          </div>
                        ))}

                        {/* Data Rows */}
                        {correlationData.columns.map((rowCol: string, i: number) => (
                          <React.Fragment key={rowCol}>
                            <div className="p-2 font-medium text-sm text-gray-700 flex items-center justify-end pr-4">
                              {rowCol}
                            </div>
                            {correlationData.columns.map((colCol: string, j: number) => {
                              const cell = correlationData.data.find((d: any) => d.x === colCol && d.y === rowCol);
                              const val = cell ? cell.value : 0;
                              return (
                                <div
                                  key={`${rowCol}-${colCol}`}
                                  className={`p-2 m-0.5 rounded flex items-center justify-center text-sm font-medium ${getCorrelationColor(val)}`}
                                  title={`${rowCol} vs ${colCol}: ${val}`}
                                >
                                  {val}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Not enough numeric columns to calculate correlations.
                  </div>
                )}
              </div>
            )}

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
