import { useState } from 'react';
import { Wand2, Upload, Check, X, AlertCircle } from 'lucide-react';
import { DataPreview } from './DataPreview';
import { ConfirmationDialog } from './ConfirmationDialog';

interface TransformPanelProps {
    data: any[];
    fileName: string;
}

export function TransformPanel({ data, fileName }: TransformPanelProps) {
    const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [transformedData, setTransformedData] = useState<any[] | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTransform = () => {
        // Mock transformation
        const mockTransformed = data.map(item => ({
            ...item,
            transformed: true,
            efficiency: Math.round(Math.random() * 100),
        }));
        setTransformedData(mockTransformed);
        setShowConfirmation(true);
    };

    const handleConfirm = () => {
        setShowConfirmation(false);
        // Apply transformation
        alert('변환이 완료되었습니다!');
    };

    const handleReject = () => {
        setShowConfirmation(false);
        setTransformedData(null);
    };

    return (
        <div className="h-full flex bg-gray-950">
            {/* Left Panel - Input */}
            <div className="w-1/2 border-r border-gray-800 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-lg text-white mb-1">데이터 변환</h2>
                    <p className="text-sm text-gray-400">자연어로 원하는 결과물을 설명하세요</p>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Natural Language Input */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            변환 요청
                        </label>
                        <textarea
                            value={naturalLanguageInput}
                            onChange={(e) => setNaturalLanguageInput(e.target.value)}
                            placeholder="예: '이 데이터를 월별 매출 보고서 형식으로 만들어줘' 또는 '프로젝트 상태별로 그룹화하고 예산 합계를 계산해줘'"
                            className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Reference Upload */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            레퍼런스 이미지/슬라이드 (선택)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="reference-upload"
                            />
                            <label
                                htmlFor="reference-upload"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded hover:border-gray-600 transition-colors cursor-pointer"
                            >
                                <Upload className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-400">
                                    {referenceImage ? '이미지 변경' : '레퍼런스 업로드'}
                                </span>
                            </label>
                        </div>
                        {referenceImage && (
                            <div className="mt-3 relative">
                                <img
                                    src={referenceImage}
                                    alt="Reference"
                                    className="w-full rounded border border-gray-700"
                                />
                                <button
                                    onClick={() => setReferenceImage(null)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Transform Button */}
                    <button
                        onClick={handleTransform}
                        disabled={!naturalLanguageInput.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded transition-colors"
                    >
                        <Wand2 className="w-5 h-5" />
                        변환 실행
                    </button>

                    {/* Original Data Preview */}
                    <div>
                        <h3 className="text-sm text-gray-300 mb-3">원본 데이터</h3>
                        <DataPreview data={data} />
                    </div>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-1/2 flex flex-col bg-gray-950">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-lg text-white mb-1">결과 미리보기</h2>
                    <p className="text-sm text-gray-400">변환된 데이터를 확인하세요</p>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {transformedData ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                                <span className="text-sm text-yellow-200">검토 필요: 변환된 결과를 확인하고 승인하세요</span>
                            </div>
                            <DataPreview data={transformedData} />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">변환 결과가 여기에 표시됩니다</p>
                            </div>
                        </div>
                    )}
                </div>

                {transformedData && (
                    <div className="p-6 border-t border-gray-800 flex gap-3">
                        <button
                            onClick={handleReject}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                            다시 시도
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                            <Check className="w-5 h-5" />
                            변환 확정
                        </button>
                    </div>
                )}
            </div>

            {showConfirmation && (
                <ConfirmationDialog
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                />
            )}
        </div>
    );
}
