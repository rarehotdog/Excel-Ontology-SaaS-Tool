import { useState, useEffect } from 'react';
import { Scale, ArrowRightLeft, FileSpreadsheet, AlertCircle, CheckCircle2, ArrowRight, DollarSign, List } from 'lucide-react';

export function ReconciliationView() {
    const [sources, setSources] = useState<any[]>([]);
    const [internalFile, setInternalFile] = useState<string>('');
    const [externalFile, setExternalFile] = useState<string>('');
    const [isReconciling, setIsReconciling] = useState(false);
    const [results, setResults] = useState<any>(null);

    // Step 2: Column Mapping
    const [step, setStep] = useState(1);
    const [columns, setColumns] = useState<string[]>([]);
    const [keyColumns, setKeyColumns] = useState<string[]>([]);
    const [valueColumns, setValueColumns] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'mismatches' | 'missing_ext' | 'missing_int'>('mismatches');

    useEffect(() => {
        fetchDataSources();
    }, []);

    const fetchDataSources = async () => {
        try {
            const response = await fetch('http://localhost:8000/data/list');
            if (response.ok) {
                const data = await response.json();
                setSources(data);
            }
        } catch (error) {
            console.error('Failed to fetch data sources:', error);
        }
    };

    const handleFileSelection = () => {
        if (!internalFile || !externalFile) {
            alert('Please select both Internal and External files.');
            return;
        }

        // Fetch columns for the internal file (assuming similar schema for now, or we could fetch both)
        const file = sources.find(s => s.filename === internalFile);
        if (file) {
            setColumns(file.columns);
            setStep(2);
        }
    };

    const toggleColumn = (col: string, type: 'key' | 'value') => {
        if (type === 'key') {
            setKeyColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
        } else {
            setValueColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
        }
    };

    const handleReconcile = async () => {
        if (keyColumns.length === 0 || valueColumns.length === 0) {
            alert('Please select at least one Key column and one Value column.');
            return;
        }

        setIsReconciling(true);
        try {
            const requestBody = {
                internal_filename: internalFile,
                external_filename: externalFile,
                key_columns: keyColumns,
                value_columns: valueColumns
            };

            const response = await fetch('http://localhost:8000/etl/reconcile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error('Reconciliation failed');

            const data = await response.json();
            setResults(data.results);
            setStep(3);
        } catch (error) {
            console.error('Reconciliation error:', error);
            alert('Failed to reconcile.');
        } finally {
            setIsReconciling(false);
        }
    };

    const reset = () => {
        setStep(1);
        setResults(null);
        setKeyColumns([]);
        setValueColumns([]);
    };

    return (
        <div className="h-full overflow-auto p-8 bg-gray-50">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Scale className="w-8 h-8 text-indigo-600" />
                        Settlement Engine
                    </h1>
                    <p className="text-gray-500 mt-1">Automated reconciliation and discrepancy detection.</p>
                </div>
                {step > 1 && (
                    <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-900 underline">
                        Start Over
                    </button>
                )}
            </div>

            {/* Step 1: File Selection */}
            {step === 1 && (
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-blue-500" /> Internal Data
                            </h3>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={internalFile}
                                onChange={(e) => setInternalFile(e.target.value)}
                            >
                                <option value="">Select File...</option>
                                {sources.map(s => <option key={s.filename} value={s.filename}>{s.filename}</option>)}
                            </select>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-green-500" /> External Data
                            </h3>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                value={externalFile}
                                onChange={(e) => setExternalFile(e.target.value)}
                            >
                                <option value="">Select File...</option>
                                {sources.map(s => <option key={s.filename} value={s.filename}>{s.filename}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={handleFileSelection}
                            disabled={!internalFile || !externalFile}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Next: Map Columns <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Column Mapping */}
            {step === 2 && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Map Reconciliation Logic</h2>

                        <div className="grid grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">1. Match Records By (Key)</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    {columns.map(col => (
                                        <label key={`key-${col}`} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${keyColumns.includes(col) ? 'bg-indigo-50 border-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input
                                                type="checkbox"
                                                checked={keyColumns.includes(col)}
                                                onChange={() => toggleColumn(col, 'key')}
                                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-900">{col}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">2. Compare Values (Value)</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    {columns.map(col => (
                                        <label key={`val-${col}`} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${valueColumns.includes(col) ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input
                                                type="checkbox"
                                                checked={valueColumns.includes(col)}
                                                onChange={() => toggleColumn(col, 'value')}
                                                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-900">{col}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleReconcile}
                                disabled={isReconciling || keyColumns.length === 0 || valueColumns.length === 0}
                                className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isReconciling ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <ArrowRightLeft className="w-5 h-5" />
                                )}
                                Run Reconciliation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && results && (
                <div className="space-y-6 max-w-7xl mx-auto">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-sm font-medium mb-1">Match Rate</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    {Math.round((results.summary.matched_count / results.summary.total_internal) * 100)}%
                                </span>
                                <span className="text-sm text-gray-500">
                                    ({results.summary.matched_count} / {results.summary.total_internal})
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-sm font-medium mb-1">Financial Impact</div>
                            <div className={`text-3xl font-bold ${results.summary.net_financial_impact > 0 ? 'text-green-600' : results.summary.net_financial_impact < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {results.summary.net_financial_impact > 0 ? '+' : ''}
                                {results.summary.net_financial_impact.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-sm font-medium mb-1">Unmatched (Internal)</div>
                            <div className="text-3xl font-bold text-orange-600">{results.summary.missing_in_external_count}</div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-sm font-medium mb-1">Unmatched (External)</div>
                            <div className="text-3xl font-bold text-blue-600">{results.summary.missing_in_internal_count}</div>
                        </div>
                    </div>

                    {/* Detailed View */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('mismatches')}
                                className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'mismatches' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Value Mismatches ({results.summary.value_mismatch_count})
                            </button>
                            <button
                                onClick={() => setActiveTab('missing_ext')}
                                className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'missing_ext' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Missing in External ({results.summary.missing_in_external_count})
                            </button>
                            <button
                                onClick={() => setActiveTab('missing_int')}
                                className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'missing_int' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Missing in Internal ({results.summary.missing_in_internal_count})
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'mismatches' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Internal</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">External</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Diff</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.mismatches.map((m: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{JSON.stringify(m.key)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.column}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{m.internal_value}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{m.external_value}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">{m.diff}</td>
                                                </tr>
                                            ))}
                                            {results.mismatches.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                                        No value mismatches found for matched records.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'missing_ext' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {keyColumns.map(col => (
                                                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                                                ))}
                                                {/* Show other columns if available in data, for now just keys */}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.missing_in_external.map((row: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    {keyColumns.map(col => (
                                                        <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row[col]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                            {results.missing_in_external.length === 0 && (
                                                <tr>
                                                    <td colSpan={keyColumns.length} className="px-6 py-12 text-center text-gray-500">
                                                        All internal records found in external data.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'missing_int' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {keyColumns.map(col => (
                                                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.missing_in_internal.map((row: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    {keyColumns.map(col => (
                                                        <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row[col]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                            {results.missing_in_internal.length === 0 && (
                                                <tr>
                                                    <td colSpan={keyColumns.length} className="px-6 py-12 text-center text-gray-500">
                                                        All external records found in internal data.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
