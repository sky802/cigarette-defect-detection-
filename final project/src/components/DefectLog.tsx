import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface Defect {
  id: string;
  type: 'torn_paper' | 'filter_defect' | 'size_variance' | 'color_anomaly' | 'end_defect';
  confidence: number;
  timestamp: number;
}

interface DefectLogProps {
  defects: Defect[];
  onClearLog: () => void;
}

const DEFECT_TYPES = {
  torn_paper: { color: 'bg-red-100 text-red-800', label: 'Torn Paper' },
  filter_defect: { color: 'bg-orange-100 text-orange-800', label: 'Filter Defect' },
  size_variance: { color: 'bg-yellow-100 text-yellow-800', label: 'Size Variance' },
  color_anomaly: { color: 'bg-purple-100 text-purple-800', label: 'Color Anomaly' },
  end_defect: { color: 'bg-pink-100 text-pink-800', label: 'End Defect' }
};

export const DefectLog: React.FC<DefectLogProps> = ({ defects, onClearLog }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <AlertTriangle size={20} />
          Defect Log
        </h3>
        <button
          onClick={onClearLog}
          className="text-sm px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Clear Log
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-2">
        {defects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-2 text-gray-400" />
            <p>No defects detected</p>
            <p className="text-sm">System is running smoothly</p>
          </div>
        ) : (
          defects.map((defect) => {
            const defectType = DEFECT_TYPES[defect.type];
            return (
              <div
                key={defect.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${defectType.color}`}>
                    {defectType.label}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {(defect.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} />
                  {formatTime(defect.timestamp)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};