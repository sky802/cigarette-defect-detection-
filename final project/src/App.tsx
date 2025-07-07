import React, { useState, useCallback } from 'react';
import { CameraFeed } from './components/CameraFeed';
import { StatisticsPanel } from './components/StatisticsPanel';
import { ControlPanel } from './components/ControlPanel';
import { DefectLog } from './components/DefectLog';
import { Cigarette, Shield, AlertTriangle } from 'lucide-react';

interface Defect {
  id: string;
  type: 'torn_paper' | 'filter_defect' | 'size_variance' | 'color_anomaly' | 'end_defect';
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  timestamp: number;
}

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [detectedDefects, setDetectedDefects] = useState<Defect[]>([]);

  const handleDefectDetected = useCallback((defect: Defect) => {
    setDetectedDefects(prev => [...prev, defect]);
    
    if (alertsEnabled) {
      // Show browser notification if permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Quality Alert', {
          body: `${defect.type.replace('_', ' ')} detected with ${(defect.confidence * 100).toFixed(1)}% confidence`,
          icon: '/favicon.ico'
        });
      }
    }
  }, [alertsEnabled]);

  const handleToggleRunning = () => {
    setIsRunning(!isRunning);
    
    // Request notification permission when starting
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleReset = () => {
    setDetectedDefects([]);
    setIsRunning(false);
  };

  const handleClearLog = () => {
    setDetectedDefects([]);
  };

  // Calculate statistics
  const stats = {
    total: detectedDefects.length,
    byType: detectedDefects.reduce((acc, defect) => {
      acc[defect.type] = (acc[defect.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentDetections: detectedDefects.filter(d => Date.now() - d.timestamp < 30000).length,
    qualityScore: Math.max(0, 100 - (detectedDefects.length * 2))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cigarette className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QualityVision Pro</h1>
                <p className="text-sm text-gray-600">Real-time Cigarette Defect Detection System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="text-green-500" size={20} />
                <span className="text-sm font-medium text-gray-700">Production Grade</span>
              </div>
              {stats.recentDetections > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">{stats.recentDetections} Active</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Feed - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2">
            <CameraFeed
              isRunning={isRunning}
              onDefectDetected={handleDefectDetected}
              sensitivity={sensitivity}
            />
          </div>

          {/* Controls and Stats */}
          <div className="space-y-6">
            <ControlPanel
              isRunning={isRunning}
              onToggleRunning={handleToggleRunning}
              onReset={handleReset}
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}
              alertsEnabled={alertsEnabled}
              onToggleAlerts={() => setAlertsEnabled(!alertsEnabled)}
            />
            
            <StatisticsPanel stats={stats} />
          </div>
        </div>

        {/* Defect Log */}
        <div className="mt-8">
          <DefectLog defects={detectedDefects} onClearLog={handleClearLog} />
        </div>
      </main>
    </div>
  );
}

export default App;