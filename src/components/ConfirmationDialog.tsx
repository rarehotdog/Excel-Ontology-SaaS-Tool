import { Check, X, AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  onConfirm: () => void;
  onReject: () => void;
}

export function ConfirmationDialog({ onConfirm, onReject }: ConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#0d1117] border border-gray-700 rounded-lg w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg text-white mb-1">변환 확인</h3>
            <p className="text-sm text-gray-400">
              변환된 데이터를 확인하셨나요? 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-3 bg-gray-900/50 border border-gray-800 rounded">
            <div className="text-xs text-gray-500 mb-1">변환 상태</div>
            <div className="text-sm text-gray-200">준비 완료</div>
          </div>
          <div className="p-3 bg-gray-900/50 border border-gray-800 rounded">
            <div className="text-xs text-gray-500 mb-1">영향받는 행</div>
            <div className="text-sm text-gray-200">전체 데이터</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            <Check className="w-4 h-4" />
            확정
          </button>
        </div>
      </div>
    </div>
  );
}
