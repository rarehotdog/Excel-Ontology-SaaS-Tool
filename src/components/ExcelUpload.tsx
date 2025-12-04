import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface ExcelUploadProps {
  onFileUpload: (file: File, preview: any[]) => void;
}

export function ExcelUpload({ onFileUpload }: ExcelUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
      setSelectedFile(file);
      
      // Mock data preview
      const mockPreview = [
        { id: 1, name: '프로젝트 A', status: '진행중', budget: 5000000, completion: 75 },
        { id: 2, name: '프로젝트 B', status: '완료', budget: 3000000, completion: 100 },
        { id: 3, name: '프로젝트 C', status: '대기', budget: 7500000, completion: 0 },
        { id: 4, name: '프로젝트 D', status: '진행중', budget: 4200000, completion: 45 },
        { id: 5, name: '프로젝트 E', status: '진행중', budget: 6800000, completion: 60 },
      ];
      
      onFileUpload(file, mockPreview);
    } else {
      alert('Excel 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-12 transition-colors
            ${dragActive 
              ? 'border-blue-500 bg-blue-500/5' 
              : 'border-gray-700 bg-gray-900/30'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>

            <h3 className="text-lg text-white mb-2">
              Excel 파일을 업로드하세요
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              드래그 앤 드롭 또는 클릭하여 파일을 선택하세요
            </p>

            <button
              onClick={onButtonClick}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              파일 선택
            </button>

            <div className="mt-6 text-xs text-gray-500">
              지원 형식: .xlsx, .xls, .csv
            </div>
          </div>
        </div>

        {/* Recent Files */}
        <div className="mt-8">
          <h4 className="text-sm text-gray-400 mb-3">최근 파일</h4>
          <div className="space-y-2">
            {['sales_report_2024.xlsx', 'project_data.xlsx', 'customer_analysis.csv'].map((fileName, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-900/30 border border-gray-800 rounded hover:border-gray-700 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-200">{fileName}</div>
                  <div className="text-xs text-gray-500">2024-12-{(idx + 1).toString().padStart(2, '0')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
