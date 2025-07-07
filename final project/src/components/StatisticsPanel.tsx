import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface DefectStats {
  total: number;
  byType: Record<string, number>;
  recentDetections: number;
  qualityScore: number;
}

interface StatisticsPanelProps {
  stats: DefectStats;
}

const DEFECT_LABELS = {
  torn_paper: 'Torn Paper',
  filter_defect: 'Filter Defect',
  size_variance: 'Size Variance',
  color_anomaly: 'Color Anomaly',
  end_defect: 'End Defect'
};

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats }) => {
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="text-green-500" size={24} />;
    if (score >= 70) return <AlertTriangle className="text-yellow-500" size={24} />;
    return <XCircle className="text-red-500" size={24} />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        Quality Statistics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Quality Score */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quality Score</p>
              <p className={`text-2xl font-bold ${getQualityColor(stats.qualityScore)}`}>
                {stats.qualityScore.toFixed(1)}%
              </p>
            </div>
            {getQualityIcon(stats.qualityScore)}
          </div>
        </div>

        {/* Total Defects */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Defects</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
        </div>

        {/* Recent Detections */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent (Last 30s)</p>
              <p className="text-2xl font-bold text-gray-800">{stats.recentDetections}</p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Defect Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Defect Types</p>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  {DEFECT_LABELS[type as keyof typeof DEFECT_LABELS]}
                </span>
                <span className="text-sm font-semibold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Trend Visualization */}
      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-2">Quality Trend</p>
        <div className="flex items-end gap-1 h-16">
          {Array.from({ length: 20 }, (_, i) => {
            const height = Math.random() * 60 + 20;
            const color = height > 50 ? 'bg-green-500' : height > 30 ? 'bg-yellow-500' : 'bg-red-500';
            return (
              <div
                key={i}
                className={`${color} rounded-sm flex-1 transition-all duration-300`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};