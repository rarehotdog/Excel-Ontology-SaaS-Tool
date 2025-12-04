import { useState, useEffect } from 'react';
import { Scale, ArrowRightLeft, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ReconciliationView() {
    const [sources, setSources] = useState<any[]>([]);
    const [internalFile, setInternalFile] = useState<string>('');
    const [externalFile, setExternalFile] = useState<string>('');
    const [isReconciling, setIsReconciling] = useState(false);
    const [results, setResults] = useState<any>(null);

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

    const handleReconcile = async () => {
        if (!internalFile || !externalFile) {
            alert('Please select both Internal and External files.');
            return;
        }

        setIsReconciling(true);
        try {
            // Hardcoded columns for demo. In real app, user selects columns.
            const requestBody = {
                internal_filename: internalFile,
                external_filename: externalFile,
                key_columns: ["id"], // Assuming 'id' is the common key
                value_columns: ["amount"] // Assuming 'amount' is what we check
            };

            const response = await fetch('http://localhost:8000/etl/reconcile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error('Reconciliation failed');

            const data = await response.json();
            setResults(data.results);
        } catch (error) {
            console.error('Reconciliation error:', error);
            alert('Failed to reconcile. Ensure files have "id" and "amount" columns for this demo.');
        } finally {
            setIsReconciling(false);
        }
    };

    return (
        <div className="h-full overflow-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                            <Scale className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl text-gray-900 mb-1">Settlement Engine</h1>
                            <p className="text-gray-600">내부 데이터와 외부 데이터를 대사하고 차이를 발견하세요</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Internal Source */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-blue-500" /> Internal Data
                    </h3>
                    <select
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
                        value={internalFile}
                        onChange={(e) => setInternalFile(e.target.value)}
                    >
                        <option value="">Select File...</option>
                        {sources.map(s => <option key={s.filename} value={s.filename}>{s.filename}</option>)}
                    </select>
                </div>

                {/* Action */}
                <div className="flex items-center justify-center">
                    <button
                        onClick={handleReconcile}
                        disabled={isReconciling}
                        className="w-full h-full max-h-32 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-3xl shadow-xl shadow-purple-200 hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isReconciling ? (
                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <ArrowRightLeft className="w-10 h-10" />
                        )}
                        <span className="text-lg font-bold">Run Reconciliation</span>
                    </button>
                </div>

                {/* External Source */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-500" /> External Data
                    </h3>
                    <select
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none"
                        value={externalFile}
                        onChange={(e) => setExternalFile(e.target.value)}
                    >
                        <option value="">Select File...</option>
                        {sources.map(s => <option key={s.filename} value={s.filename}>{s.filename}</option>)}
                    </select>
                </div>
            </div>

            {/* Results Area */}
            {results && (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
                            <div className="text-gray-500 text-sm mb-1">Matched</div>
                            <div className="text-3xl font-bold text-gray-900">{results.summary.matched_count}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
                            <div className="text-gray-500 text-sm mb-1">Value Mismatches</div>
                            <div className="text-3xl font-bold text-red-600">{results.summary.value_mismatch_count}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
                            <div className="text-gray-500 text-sm mb-1">Missing in External</div>
                            <div className="text-3xl font-bold text-orange-600">{results.summary.missing_in_external_count}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                            <div className="text-gray-500 text-sm mb-1">Missing in Internal</div>
                            <div className="text-3xl font-bold text-blue-600">{results.summary.missing_in_internal_count}</div>
                        </div>
                    </div>

                    {/* Mismatches Table */}
                    {results.mismatches.length > 0 && (
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <AlertCircle className="w-6 h-6 text-red-500" /> Value Mismatches
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="text-left py-4 px-4 text-gray-500 font-medium">Key (ID)</th>
                                            <th className="text-left py-4 px-4 text-gray-500 font-medium">Column</th>
                                            <th className="text-right py-4 px-4 text-gray-500 font-medium">Internal Value</th>
                                            <th className="text-right py-4 px-4 text-gray-500 font-medium">External Value</th>
                                            <th className="text-right py-4 px-4 text-gray-500 font-medium">Diff</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.mismatches.map((m: any, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-red-50/50 transition-colors">
                                                <td className="py-4 px-4 font-mono text-gray-600">{JSON.stringify(m.key)}</td>
                                                <td className="py-4 px-4 text-gray-900">{m.column}</td>
                                                <td className="py-4 px-4 text-right font-mono">{m.internal_value}</td>
                                                <td className="py-4 px-4 text-right font-mono">{m.external_value}</td>
                                                <td className="py-4 px-4 text-right font-bold text-red-600">{m.diff}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
