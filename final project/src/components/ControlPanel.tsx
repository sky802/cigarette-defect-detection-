import React from 'react';
import { Play, Pause, RotateCcw, Settings, Camera, AlertTriangle } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
  alertsEnabled: boolean;
  onToggleAlerts: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onToggleRunning,
  onReset,
  sensitivity,
  onSensitivityChange,
  alertsEnabled,
  onToggleAlerts
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Settings size={20} />
        System Controls
      </h3>
      
      <div className="space-y-4">
        {/* Main Controls */}
        <div className="flex gap-3">
          <button
            onClick={onToggleRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? 'Stop' : 'Start'} Detection
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>

        {/* Sensitivity Control */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Camera size={16} />
            Detection Sensitivity: {sensitivity}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={sensitivity}
            onChange={(e) => onSensitivityChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Alert Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={() => onToggleAlerts()}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-700">
              {isRunning ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${alertsEnabled ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-700">
              Alerts {alertsEnabled ? 'On' : 'Off'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};