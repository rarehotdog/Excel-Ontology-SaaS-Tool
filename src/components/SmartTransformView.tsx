import { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, Code, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface SchemaField {
    name: string;
    type: string;
    description: string;
}

interface Schema {
    name: string;
    fields: SchemaField[];
}

export function SmartTransformView() {
    const [step, setStep] = useState(1);
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    const [sourceFile, setSourceFile] = useState<string>('');
    const [availableFiles, setAvailableFiles] = useState<any[]>([]);
    const [schema, setSchema] = useState<Schema | null>(null);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [generatedCode, setGeneratedCode] = useState('');
    const [transformResult, setTransformResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Fetch available files on mount
    useEffect(() => {
        fetch('http://localhost:8000/data/list')
            .then(res => res.json())
            .then(data => setAvailableFiles(data))
            .catch(err => console.error(err));
    }, []);

    const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReferenceFile(file);
            setLoading(true);

            // Mock parsing
            try {
                const res = await fetch('http://localhost:8000/smart/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name })
                });
                const data = await res.json();
                if (data.success) {
                    setSchema(data.schema);
                    setStep(2);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAutoMap = () => {
        if (!schema || !sourceFile) return;

        // Simple auto-map logic (name matching)
        const newMapping: Record<string, string> = {};
        const sourceColumns = availableFiles.find(f => f.filename === sourceFile)?.columns || [];

        schema.fields.forEach(field => {
            const match = sourceColumns.find((col: string) =>
                col.toLowerCase().includes(field.name.toLowerCase()) ||
                field.name.toLowerCase().includes(col.toLowerCase())
            );
            if (match) {
                newMapping[field.name] = match;
            }
        });
        setMapping(newMapping);
    };

    const handleGenerateCode = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/smart/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_filename: sourceFile,
                    mapping: mapping
                })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedCode(data.code);
                setStep(3);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTransform = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/smart/transform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_filename: sourceFile,
                    mapping: mapping,
                    output_name: `transformed_${sourceFile.split('.')[0]}`
                })
            });
            const data = await res.json();
            if (data.success) {
                setTransformResult(data.metadata);
                setStep(4);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-auto p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                            <FileSpreadsheet className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl text-gray-900 mb-1">Smart Transformer</h1>
                            <p className="text-gray-600">Transform data to match any reference format using AI</p>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Step 1: Reference & Source */}
                    <div className={`bg-white rounded-3xl p-6 shadow-lg transition-all ${step === 1 ? 'ring-2 ring-violet-500' : 'opacity-70'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold">1</div>
                            <h3 className="font-semibold text-gray-900">Select Files</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reference File (Image/Excel)</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input type="file" onChange={handleReferenceUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                    <span className="text-sm text-gray-500">{referenceFile ? referenceFile.name : "Upload Reference"}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Source Data File</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    value={sourceFile}
                                    onChange={(e) => setSourceFile(e.target.value)}
                                >
                                    <option value="">Select a file...</option>
                                    {availableFiles.map((f: any) => (
                                        <option key={f.filename} value={f.filename}>{f.filename}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Mapping */}
                    <div className={`bg-white rounded-3xl p-6 shadow-lg transition-all ${step === 2 ? 'ring-2 ring-violet-500' : 'opacity-70'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold">2</div>
                            <h3 className="font-semibold text-gray-900">Map Columns</h3>
                        </div>

                        {schema && sourceFile ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Target Schema: {schema.name}</span>
                                    <button onClick={handleAutoMap} className="text-xs text-violet-600 font-medium hover:underline">Auto-Map</button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {schema.fields.map(field => (
                                        <div key={field.name} className="flex items-center gap-2">
                                            <div className="flex-1 text-sm font-medium text-gray-700 truncate" title={field.description}>{field.name}</div>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                            <select
                                                className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                                                value={mapping[field.name] || ''}
                                                onChange={(e) => setMapping({ ...mapping, [field.name]: e.target.value })}
                                            >
                                                <option value="">Skip</option>
                                                {availableFiles.find(f => f.filename === sourceFile)?.columns.map((col: string) => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleGenerateCode}
                                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    <Code className="w-4 h-4" /> Generate Code
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">Complete Step 1 first</div>
                        )}
                    </div>

                    {/* Step 3: Transform */}
                    <div className={`bg-white rounded-3xl p-6 shadow-lg transition-all ${step >= 3 ? 'ring-2 ring-violet-500' : 'opacity-70'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold">3</div>
                            <h3 className="font-semibold text-gray-900">Transform</h3>
                        </div>

                        {generatedCode ? (
                            <div className="space-y-4">
                                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                    <pre className="text-xs text-green-400 font-mono">{generatedCode}</pre>
                                </div>
                                <button
                                    onClick={handleTransform}
                                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : <><Play className="w-4 h-4" /> Run Transformation</>}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">Complete Step 2 first</div>
                        )}
                    </div>
                </div>

                {/* Result Preview */}
                {transformResult && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Transformation Complete</h3>
                                    <p className="text-gray-500">Saved as {transformResult.filename}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {transformResult.shape[0]} rows • {transformResult.shape[1]} columns
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        {transformResult.columns.map((col: string) => (
                                            <th key={col} className="px-4 py-3 rounded-t-lg">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transformResult.head.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            {transformResult.columns.map((col: string) => (
                                                <td key={col} className="px-4 py-3 text-gray-700">{row[col]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
