import { X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AnomalyResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    total_anomalies: number;
    details: any[];
  } | null;
  filename: string;
}

export function AnomalyResultsDialog({ isOpen, onClose, results, filename }: AnomalyResultsDialogProps) {
  if (!results) return null;

  const hasAnomalies = results.total_anomalies > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {hasAnomalies ? (
                <>
                  <span className="text-red-500">⚠️</span>
                  Analysis Results
                </>
              ) : (
                <>
                  <span className="text-green-500">✅</span>
                  Analysis Complete
                </>
              )}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 mt-1">
            Analysis for <span className="font-medium text-gray-900">{filename}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4 pr-4">
          <div className="space-y-6">
            {/* Summary Status */}
            <div className={`p-4 rounded-lg border ${hasAnomalies ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-bold ${hasAnomalies ? 'text-red-600' : 'text-green-600'}`}>
                  {results.total_anomalies}
                </div>
                <div className="text-sm text-gray-600">
                  {hasAnomalies 
                    ? 'Potential anomalies were detected in your data.' 
                    : 'No significant anomalies or outliers were found in the analyzed columns.'}
                </div>
              </div>
            </div>

            {/* Details List */}
            {hasAnomalies && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Detailed Findings</h3>
                {results.details.map((item, index) => (
                  <Alert key={index} variant={item.type === 'Rule Error' ? 'destructive' : 'default'} className="bg-white border-gray-200 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.type === 'Statistical Outlier' ? 'secondary' : item.type === 'Rule Error' ? 'destructive' : 'outline'}>
                          {item.type}
                        </Badge>
                        {item.column && <Badge variant="outline" className="text-xs font-normal text-gray-500">{item.column}</Badge>}
                      </div>
                      <AlertDescription className="text-gray-700 mt-2">
                        {item.details}
                      </AlertDescription>
                      {item.row_index !== undefined && (
                        <div className="text-xs text-gray-400 mt-1">Row: {item.row_index}</div>
                      )}
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {!hasAnomalies && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">All checked patterns (Overlapping Time, Zero Distance) and statistical distributions appear normal.</p>
                <p className="text-xs mt-2 text-gray-400">Try adding more data or configuring specific rules if you expect different results.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


