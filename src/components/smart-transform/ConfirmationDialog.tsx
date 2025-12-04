import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationDialogProps {
    onConfirm: () => void;
    onReject: () => void;
}

export function ConfirmationDialog({ onConfirm, onReject }: ConfirmationDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">변환 확인</h3>
                            <p className="text-sm text-gray-400">이 작업은 원본 데이터 구조를 변경할 수 있습니다.</p>
                        </div>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed mb-6">
                        AI가 제안한 변환 결과를 확인하셨나요? <br />
                        확정 시 데이터 파이프라인에 이 단계가 추가됩니다.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onReject}
                            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            확인 및 적용
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
