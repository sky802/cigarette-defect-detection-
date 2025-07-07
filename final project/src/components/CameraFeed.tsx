import React, { useRef, useEffect, useState } from 'react';
import { Camera, Play, Pause, AlertCircle } from 'lucide-react';

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

interface CameraFeedProps {
  isRunning: boolean;
  onDefectDetected: (defect: Defect) => void;
  sensitivity: number;
}

const DEFECT_TYPES = {
  torn_paper: { color: '#ef4444', label: 'Torn Paper' },
  filter_defect: { color: '#f97316', label: 'Filter Defect' },
  size_variance: { color: '#eab308', label: 'Size Variance' },
  color_anomaly: { color: '#8b5cf6', label: 'Color Anomaly' },
  end_defect: { color: '#ec4899', label: 'End Defect' }
};

export const CameraFeed: React.FC<CameraFeedProps> = ({ isRunning, onDefectDetected, sensitivity }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [detectedDefects, setDetectedDefects] = useState<Defect[]>([]);
  const animationFrameRef = useRef<number>();
  const detectionIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment' // Use back camera if available
          }
        });
        
        setStream(mediaStream);
        setCameraError('');
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Camera access error:', error);
        setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video stream when ref changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Simulated defect detection based on image analysis
  const detectDefects = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to hidden canvas for analysis
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simulate defect detection algorithm
    // In a real implementation, this would use computer vision/ML models
    const detectionProbability = sensitivity / 100 * 0.3; // Adjust based on sensitivity
    
    if (Math.random() < detectionProbability) {
      const types = Object.keys(DEFECT_TYPES) as Array<keyof typeof DEFECT_TYPES>;
      const type = types[Math.floor(Math.random() * types.length)];
      
      // Simulate finding objects in the image
      const x = Math.random() * (canvas.width - 200);
      const y = Math.random() * (canvas.height - 100);
      const width = 150 + Math.random() * 100;
      const height = 50 + Math.random() * 50;
      
      const newDefect: Defect = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        x: x / canvas.width * 100, // Convert to percentage for responsive overlay
        y: y / canvas.height * 100,
        width: width / canvas.width * 100,
        height: height / canvas.height * 100,
        confidence: Math.random() * 0.4 + 0.6,
        timestamp: Date.now()
      };

      setDetectedDefects(prev => [...prev, newDefect]);
      onDefectDetected({
        ...newDefect,
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
  };

  // Start/stop detection
  useEffect(() => {
    if (isRunning && !cameraError) {
      detectionIntervalRef.current = setInterval(detectDefects, 1000 + Math.random() * 2000);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isRunning, sensitivity, cameraError]);

  // Clean up old defects
  useEffect(() => {
    const cleanup = setInterval(() => {
      setDetectedDefects(prev => prev.filter(d => Date.now() - d.timestamp < 5000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  // Draw defect overlays
  useEffect(() => {
    const overlayCanvas = overlayCanvasRef.current;
    const videoElement = videoRef.current;
    
    if (!overlayCanvas || !videoElement) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    const drawOverlays = () => {
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        requestAnimationFrame(drawOverlays);
        return;
      }

      // Clear previous overlays
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // Draw defect overlays
      detectedDefects.forEach(defect => {
        const defectType = DEFECT_TYPES[defect.type];
        
        // Convert percentage back to pixels
        const x = (defect.x / 100) * overlayCanvas.width;
        const y = (defect.y / 100) * overlayCanvas.height;
        const width = (defect.width / 100) * overlayCanvas.width;
        const height = (defect.height / 100) * overlayCanvas.height;
        
        // Draw bounding box with animation
        const age = Date.now() - defect.timestamp;
        const opacity = Math.max(0.3, 1 - age / 5000);
        
        ctx.strokeStyle = defectType.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = opacity;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        const labelText = `${defectType.label} ${(defect.confidence * 100).toFixed(1)}%`;
        ctx.font = '14px Arial';
        const textMetrics = ctx.measureText(labelText);
        const labelWidth = textMetrics.width + 10;
        const labelHeight = 25;
        
        ctx.fillStyle = defectType.color;
        ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
        
        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 5, y - 8);
        
        ctx.globalAlpha = 1;
      });

      if (isRunning) {
        requestAnimationFrame(drawOverlays);
      }
    };

    if (isRunning) {
      drawOverlays();
    }
  }, [detectedDefects, isRunning]);

  if (cameraError) {
    return (
      <div className="relative bg-gray-900 rounded-lg overflow-hidden h-96 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
          <p className="text-gray-300 mb-4">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry Camera Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <Camera className="text-green-500" size={20} />
        <span className="text-green-500 font-semibold">LIVE CAMERA</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto max-h-96 object-cover"
          onLoadedMetadata={() => {
            // Set overlay canvas size to match video display size
            if (overlayCanvasRef.current && videoRef.current) {
              const video = videoRef.current;
              const overlay = overlayCanvasRef.current;
              overlay.width = video.clientWidth;
              overlay.height = video.clientHeight;
            }
          }}
        />
        
        {/* Hidden canvas for image processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Overlay canvas for defect visualization */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
      
      {detectedDefects.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg z-20">
          {detectedDefects.length} Active Detection{detectedDefects.length !== 1 ? 's' : ''}
        </div>
      )}
      
      {!isRunning && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <Pause size={48} className="mx-auto mb-2" />
            <p className="text-lg font-semibold">Detection Paused</p>
          </div>
        </div>
      )}
    </div>
  );
};