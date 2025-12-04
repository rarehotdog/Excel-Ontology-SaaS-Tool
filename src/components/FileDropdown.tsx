import { useState } from 'react';
import { FileSpreadsheet, Check, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FileDropdownProps {
    sources: any[];
    selectedFiles: string[];
    onToggleFile: (filename: string) => void;
    onClearAll: () => void;
}

export function FileDropdown({ sources, selectedFiles, onToggleFile, onClearAll }: FileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Dropdown Button - Clean and Simple */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
            >
                <FileSpreadsheet className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <div className="flex flex-col items-start flex-1">
                    <span className="text-xs text-gray-500 leading-tight">Analysis Files</span>
                    <span className="text-sm font-medium text-gray-900 leading-tight">
                        {selectedFiles.length > 0
                            ? `${selectedFiles.length} selected`
                            : 'Select files'
                        }
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel - Clean Design */}
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[420px] max-h-[520px] overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-gray-600" />
                                Select Files for Analysis
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Choose one or more files to analyze</p>
                        </div>

                        {/* File List */}
                        <div className="p-5 max-h-[340px] overflow-y-auto">
                            {sources.length === 0 ? (
                                <div className="text-center py-16 text-gray-500">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="font-medium text-sm">No data sources available</p>
                                    <p className="text-xs text-gray-400 mt-1">Upload files in the Data Sources tab</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sources.map((source) => (
                                        <div
                                            key={source.id}
                                            onClick={() => onToggleFile(source.name)}
                                            className={`
                        flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                        ${selectedFiles.includes(source.name)
                                                    ? 'border-gray-900 bg-gray-50'
                                                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                                }
                      `}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${source.color === 'emerald' ? 'bg-emerald-100' : ''}
                          ${source.color === 'blue' ? 'bg-blue-100' : ''}
                          ${source.color === 'purple' ? 'bg-purple-100' : ''}
                          ${source.color === 'pink' ? 'bg-pink-100' : ''}
                          ${source.color === 'orange' ? 'bg-orange-100' : ''}
                        `}>
                                                    <FileSpreadsheet className={`
                            w-5 h-5
                            ${source.color === 'emerald' ? 'text-emerald-600' : ''}
                            ${source.color === 'blue' ? 'text-blue-600' : ''}
                            ${source.color === 'purple' ? 'text-purple-600' : ''}
                            ${source.color === 'pink' ? 'text-pink-600' : ''}
                            ${source.color === 'orange' ? 'text-orange-600' : ''}
                          `} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-gray-900 truncate">{source.name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                        <span>{source.rows.toLocaleString()} rows</span>
                                                        <span>•</span>
                                                        <span>{source.type}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-3
                        ${selectedFiles.includes(source.name)
                                                    ? 'border-gray-900 bg-gray-900'
                                                    : 'border-gray-300'
                                                }
                      `}>
                                                {selectedFiles.includes(source.name) && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClearAll();
                                }}
                                disabled={selectedFiles.length === 0}
                                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Done ({selectedFiles.length})
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
