import { useState, useEffect } from 'react';
import { Upload, ArrowRightLeft, CheckCircle, AlertTriangle, XCircle, FileSpreadsheet, RefreshCw, Search, Filter, Play } from 'lucide-react';

export function ReconciliationView() {
    const [activeTab, setActiveTab] = useState<'franchise' | 'biz'>('franchise');
    const [files, setFiles] = useState<any[]>([]);

    // Franchise State
    const [adminFile, setAdminFile] = useState('');
    const [callFile, setCallFile] = useState('');
    const [paymentFile, setPaymentFile] = useState('');
    const [billingFile, setBillingFile] = useState('');
    const [franchiseResults, setFranchiseResults] = useState<any>(null);

    // Biz State
    const [fileA, setFileA] = useState('');
    const [fileB, setFileB] = useState('');
    const [bizResults, setBizResults] = useState<any>(null);
    const [diffFilter, setDiffFilter] = useState('');
    const [isReaggregating, setIsReaggregating] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8000/data/list')
            .then(res => res.json())
            .then(data => setFiles(data));
    }, []);

    const handleFranchiseCheck = async () => {
        if (!adminFile) return;
        try {
            const res = await fetch('http://localhost:8000/settlement/franchise/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin_file: adminFile,
                    call_file: callFile,
                    payment_file: paymentFile,
                    billing_file: billingFile
                })
            });
            const data = await res.json();
            setFranchiseResults(data.results);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBizCompare = async () => {
        if (!fileA || !fileB) return;
        try {
            const res = await fetch('http://localhost:8000/settlement/biz/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_a: fileA, file_b: fileB, keys: ['id', 'order_id', 'date'] }) // Mock keys
            });
            const data = await res.json();
            setBizResults(data.results);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBizReaggregate = async () => {
        if (!fileA || !fileB) return;
        setIsReaggregating(true);
        try {
            // Mock filter: exclude recent dates
            const filters = { exclude_date_start: "2024-01-01" };

            const res = await fetch('http://localhost:8000/settlement/biz/reaggregate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_a: fileA,
                    file_b: fileB,
                    keys: ['id', 'order_id', 'date'],
                    filters: filters
                })
            });
            const data = await res.json();
            setBizResults(data.results);
        } catch (err) {
            console.error(err);
        } finally {
            setIsReaggregating(false);
        }
    };

    return (
        <div className="h-full overflow-auto p-8 bg-gray-50">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settlement Engine 2.0</h1>
                <p className="text-gray-600">Advanced reconciliation for Franchise and Biz teams.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('franchise')}
                    className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'franchise' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Franchise Mode
                    {activeTab === 'franchise' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
                </button>
                <button
                    onClick={() => setActiveTab('biz')}
                    className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'biz' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Biz Mode
                    {activeTab === 'biz' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
                </button>
            </div>

            {/* Franchise Mode Content */}
            {activeTab === 'franchise' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Data (Required)</label>
                            <select value={adminFile} onChange={e => setAdminFile(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="">Select File...</option>
                                {files.map(f => <option key={f.filename} value={f.filename}>{f.filename}</option>)}
                            </select>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Call Logs (Optional)</label>
                            <select value={callFile} onChange={e => setCallFile(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="">Select File...</option>
                                {files.map(f => <option key={f.filename} value={f.filename}>{f.filename}</option>)}
                            </select>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Logs (Optional)</label>
                            <select value={paymentFile} onChange={e => setPaymentFile(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="">Select File...</option>
                                {files.map(f => <option key={f.filename} value={f.filename}>{f.filename}</option>)}
                            </select>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Billing Data (Optional)</label>
                            <select value={billingFile} onChange={e => setBillingFile(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="">Select File...</option>
                                {files.map(f => <option key={f.filename} value={f.filename}>{f.filename}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleFranchiseCheck}
                        disabled={!adminFile}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" /> Run Integrity Check
                    </button>

                    {franchiseResults && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-sm text-gray-500 mb-1">Total Records</div>
                                    <div className="text-2xl font-bold text-gray-900">{franchiseResults.summary.total}</div>
                                </div>
                                <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
                                    <div className="text-sm text-green-700 mb-1">Normal (Green)</div>
                                    <div className="text-2xl font-bold text-green-900">{franchiseResults.summary.green}</div>
                                </div>
                                <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
                                    <div className="text-sm text-yellow-700 mb-1">Warning (Yellow)</div>
                                    <div className="text-2xl font-bold text-yellow-900">{franchiseResults.summary.yellow}</div>
                                </div>
                                <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200">
                                    <div className="text-sm text-red-700 mb-1">Critical (Red)</div>
                                    <div className="text-2xl font-bold text-red-900">{franchiseResults.summary.red}</div>
                                </div>
                            </div>

                            {/* Detail Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-700">Detailed Analysis</div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Preview</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {franchiseResults.details.slice(0, 50).map((row: any, idx: number) => (
                                                <tr key={idx} className={row.integrity_status === 'red' ? 'bg-red-50' : row.integrity_status === 'yellow' ? 'bg-yellow-50' : ''}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {row.integrity_status === 'green' && <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Normal</span>}
                                                        {row.integrity_status === 'yellow' && <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Warning</span>}
                                                        {row.integrity_status === 'red' && <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Critical</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{row.issues || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{JSON.stringify(row).slice(0, 50)}...</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Biz Mode Content */}
            {activeTab === 'biz' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">File A (Base)</label>
                            <select value={fileA} onChange={e => setFileA(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="">Select File...</option>
                                {files.map(f => <option key={f.filename} value={f.filename}>{f.filename}</option>)}
                            </select>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">File B (Target)</label>
                            <select value={fileB} onChange={e => setFileB(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="">Select File...</option>
                                {files.map(f => <option key={f.filename} value={f.filename}>{f.filename}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleBizCompare}
                        disabled={!fileA || !fileB}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        <ArrowRightLeft className="w-5 h-5" /> Compare & Analyze
                    </button>

                    {bizResults && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <div className="font-semibold text-gray-700">Discrepancies: {bizResults.total_discrepancies}</div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Filter by reason..."
                                        value={diffFilter}
                                        onChange={(e) => setDiffFilter(e.target.value)}
                                        className="text-sm border rounded px-2 py-1"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason (AI)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diff Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bizResults.discrepancies
                                            .filter((d: any) => d.reason.toLowerCase().includes(diffFilter.toLowerCase()))
                                            .map((row: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-semibold">
                                                            {row.reason}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{row.diff_amount?.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{JSON.stringify(row).slice(0, 50)}...</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                                <button
                                    onClick={handleBizReaggregate}
                                    disabled={isReaggregating}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isReaggregating ? 'animate-spin' : ''}`} />
                                    {isReaggregating ? 'Re-aggregating...' : 'Re-aggregate'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
