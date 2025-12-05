import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ParsedFile {
    id: string;
    name: string;
    sheets: string[];
    selectedSheet: string;
    data: Record<string, unknown>[];
    columns: string[];
    rowCount: number;
    size: number;
}

interface FileUploaderProps {
    onFilesParsed: (files: ParsedFile[]) => void;
    multiple?: boolean;
    accept?: string;
    maxFiles?: number;
    label?: string;
    description?: string;
}

export function FileUploader({ 
    onFilesParsed, 
    multiple = true, 
    accept = '.xlsx,.xls,.csv',
    maxFiles = 10,
    label = '파일을 드래그하거나 클릭하여 업로드',
    description = 'Excel, CSV 파일을 지원합니다 (최대 50MB)',
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<ParsedFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseFile = async (file: File): Promise<ParsedFile | null> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetNames = workbook.SheetNames;
                    const firstSheet = sheetNames[0];
                    const worksheet = workbook.Sheets[firstSheet];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
                    
                    const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
                    
                    resolve({
                        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: file.name,
                        sheets: sheetNames,
                        selectedSheet: firstSheet,
                        data: jsonData,
                        columns,
                        rowCount: jsonData.length,
                        size: file.size,
                    });
                } catch (err) {
                    console.error('파일 파싱 오류:', err);
                    resolve(null);
                }
            };
            
            reader.onerror = () => resolve(null);
            reader.readAsArrayBuffer(file);
        });
    };

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        setError(null);
        setIsProcessing(true);
        
        const fileArray = Array.from(files).slice(0, maxFiles);
        const validFiles = fileArray.filter(file => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            return ['xlsx', 'xls', 'csv'].includes(ext || '');
        });
        
        if (validFiles.length === 0) {
            setError('지원되지 않는 파일 형식입니다.');
            setIsProcessing(false);
            return;
        }

        const parsedFiles: ParsedFile[] = [];
        for (const file of validFiles) {
            const parsed = await parseFile(file);
            if (parsed) {
                parsedFiles.push(parsed);
            }
        }

        if (parsedFiles.length === 0) {
            setError('파일을 파싱할 수 없습니다.');
            setIsProcessing(false);
            return;
        }

        const newFiles = [...uploadedFiles, ...parsedFiles];
        setUploadedFiles(newFiles);
        onFilesParsed(newFiles);
        setIsProcessing(false);
    }, [uploadedFiles, maxFiles, onFilesParsed]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    const removeFile = useCallback((fileId: string) => {
        const newFiles = uploadedFiles.filter(f => f.id !== fileId);
        setUploadedFiles(newFiles);
        onFilesParsed(newFiles);
    }, [uploadedFiles, onFilesParsed]);

    const changeSheet = useCallback((fileId: string, sheetName: string) => {
        setUploadedFiles(prev => {
            const newFiles = prev.map(f => {
                if (f.id === fileId) {
                    // 시트 변경 시 데이터 재파싱 필요 (실제 구현에선 원본 파일 보관 필요)
                    return { ...f, selectedSheet: sheetName };
                }
                return f;
            });
            onFilesParsed(newFiles);
            return newFiles;
        });
    }, [onFilesParsed]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-4">
            {/* 숨겨진 파일 입력 */}
            <input
                type="file"
                ref={fileInputRef}
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
                className="hidden"
                style={{ display: 'none' }}
            />
            {/* 드래그 앤 드롭 영역 */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
                    isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                        isDragging ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                        <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{label}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                    {isProcessing && (
                        <div className="mt-4 flex items-center gap-2 text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span>파일 처리 중...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                </div>
            )}

            {/* 업로드된 파일 목록 */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                        업로드된 파일 ({uploadedFiles.length})
                    </div>
                    {uploadedFiles.map(file => (
                        <div key={file.id} className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                        <FileSpreadsheet className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{file.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {file.rowCount.toLocaleString()} rows × {file.columns.length} columns • {formatFileSize(file.size)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-1 hover:bg-red-100 rounded-lg transition-all"
                                    >
                                        <X className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* 시트 선택 */}
                            {file.sheets.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">시트:</span>
                                    <select
                                        value={file.selectedSheet}
                                        onChange={(e) => changeSheet(file.id, e.target.value)}
                                        className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                                    >
                                        {file.sheets.map(sheet => (
                                            <option key={sheet} value={sheet}>{sheet}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* 컬럼 미리보기 */}
                            <div className="mt-3 pt-3 border-t border-green-200">
                                <div className="text-xs font-medium text-gray-600 mb-2">컬럼 미리보기:</div>
                                <div className="flex flex-wrap gap-1">
                                    {file.columns.slice(0, 8).map(col => (
                                        <span key={col} className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs border border-gray-100">
                                            {col}
                                        </span>
                                    ))}
                                    {file.columns.length > 8 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                            +{file.columns.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}



