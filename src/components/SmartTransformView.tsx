import { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, Code, Play, CheckCircle, AlertCircle, MessageSquare, Send, Bot, User } from 'lucide-react';

interface SchemaField {
    name: string;
    type: string;
    description: string;
}

interface Schema {
    name: string;
    fields: SchemaField[];
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'plan' | 'code' | 'error';
    metadata?: any;
}

export function SmartTransformView() {
    // Transform State
    const [step, setStep] = useState(1);
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    const [sourceFile, setSourceFile] = useState<string>('');
    const [availableFiles, setAvailableFiles] = useState<any[]>([]);
    const [schema, setSchema] = useState<Schema | null>(null);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [generatedCode, setGeneratedCode] = useState('');
    const [transformResult, setTransformResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Chat State
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', content: '안녕하세요! 데이터 변환이나 분석에 대해 무엇이든 물어보세요. (예: "상위 5개 행 보여줘")' }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Fetch available files on mount
    useEffect(() => {
        fetch('http://localhost:8000/data/list')
            .then(res => res.json())
            .then(data => setAvailableFiles(data))
            .catch(err => console.error(err));
    }, []);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReferenceFile(file);
            setLoading(true);

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
                    file_id: sourceFile, // Changed to file_id to match backend
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content })
            });
            const data = await res.json();

            if (data.success) {
                const aiMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.summary || "작업을 완료했습니다.",
                    type: 'text'
                };
                setMessages(prev => [...prev, aiMsg]);

                // If data returned, update preview
                if (data.data) {
                    setTransformResult({
                        filename: "AI Result",
                        columns: data.columns,
                        shape: [data.data.length, data.columns.length],
                        head: data.data.slice(0, 5)
                    });
                }
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `오류가 발생했습니다: ${data.error}`,
                    type: 'error'
                }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "서버 통신 중 오류가 발생했습니다.",
                type: 'error'
            }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="h-full flex overflow-hidden bg-gray-50">
            {/* Left Sidebar: Chat Interface */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-violet-600" />
                        Talk to Excel
                    </h2>
                    <p className="text-xs text-gray-500">AI에게 데이터 분석을 요청하세요</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-violet-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            disabled={isChatLoading}
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim() || isChatLoading}
                            className="absolute right-2 top-2 p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Content: Transform Wizard */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                                <FileSpreadsheet className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl text-gray-900 mb-1">Smart Transformer</h1>
                                <p className="text-gray-600">Transform data using AI or Manual Mapping</p>
                            </div>
                        </div>
                    </div>

                    {/* Result Preview (Top Priority if available) */}
                    {transformResult && (
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-violet-100 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Result Preview</h3>
                                        <p className="text-gray-500">
                                            {transformResult.filename ? `Saved as ${transformResult.filename}` : "Generated from AI Analysis"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {transformResult.shape[0]} rows • {transformResult.shape[1]} columns
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            {transformResult.columns.map((col: string) => (
                                                <th key={col} className="px-4 py-3 border-b border-gray-200 whitespace-nowrap">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transformResult.head.map((row: any, i: number) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                {transformResult.columns.map((col: string) => (
                                                    <td key={col} className="px-4 py-3 text-gray-700 whitespace-nowrap">{row[col]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setTransformResult(null)}
                                    className="text-sm text-gray-500 hover:text-gray-900 underline"
                                >
                                    Clear Result
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Steps (Only show if not in result mode or if user wants to see them) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Step 1: Reference & Source */}
                        <div className={`bg-white rounded-3xl p-6 shadow-lg transition-all ${step === 1 ? 'ring-2 ring-violet-500' : 'opacity-70'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold">1</div>
                                <h3 className="font-semibold text-gray-900">Select Files</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reference File</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                                        <input type="file" onChange={handleReferenceUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-violet-500 transition-colors" />
                                        <span className="text-sm text-gray-500 group-hover:text-violet-600">{referenceFile ? referenceFile.name : "Upload Reference"}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Source Data</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
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
                                        <span className="text-sm text-gray-500 truncate max-w-[150px]">{schema.name}</span>
                                        <button onClick={handleAutoMap} className="text-xs text-violet-600 font-medium hover:underline">Auto-Map</button>
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {schema.fields.map(field => (
                                            <div key={field.name} className="flex items-center gap-2">
                                                <div className="flex-1 text-sm font-medium text-gray-700 truncate" title={field.description}>{field.name}</div>
                                                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <select
                                                    className="flex-1 p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
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
                                    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto max-h-40 custom-scrollbar">
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

                </div>
            </div>
        </div>
    );
}
