import { X, Check, FileSpreadsheet, XCircle } from 'lucide-react';

interface FileSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    sources: any[];
    selectedFiles: string[];
    onToggleFile: (filename: string) => void;
    onClearAll: () => void;
}

export function FileSelectionModal({ isOpen, onClose, sources, selectedFiles, onToggleFile, onClearAll }: FileSelectionModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(4px)'
            }}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl overflow-hidden relative"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '85vh',
                    margin: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                        Select Files for Analysis
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/80 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                    {sources.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No data sources available. Please upload files in the Data Sources tab.
                        </div>
                    ) : (
                        sources.map((source) => (
                            <div
                                key={source.id}
                                onClick={() => onToggleFile(source.name)}
                                className={`
                  flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${selectedFiles.includes(source.name)
                                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                    }
                `}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${source.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : ''}
                    ${source.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                    ${source.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                    ${source.color === 'pink' ? 'bg-pink-100 text-pink-600' : ''}
                    ${source.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
                  `}>
                                        <FileSpreadsheet className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{source.name}</div>
                                        <div className="text-xs text-gray-500">{source.rows.toLocaleString()} rows • {source.type}</div>
                                    </div>
                                </div>

                                <div className={`
                  w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
                  ${selectedFiles.includes(source.name)
                                        ? 'border-black bg-white'
                                        : 'border-gray-400 bg-white hover:border-gray-600'
                                    }
                `}>
                                    {selectedFiles.includes(source.name) && <Check className="w-5 h-5 text-black stroke-[3]" />}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <button
                        onClick={onClearAll}
                        disabled={selectedFiles.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <XCircle className="w-4 h-4" />
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-200"
                    >
                        Done ({selectedFiles.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
