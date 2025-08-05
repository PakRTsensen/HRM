import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Zap, AlertCircle } from 'lucide-react';

interface ModelInterfaceProps {
  onModelLoad: (loaded: boolean) => void;
}

const ModelInterface: React.FC<ModelInterfaceProps> = ({ onModelLoad }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [modelInfo, setModelInfo] = useState({
    parameters: '27M',
    architecture: 'HRM-ACT-V1',
    device: 'CPU',
    precision: 'FP32'
  });

  useEffect(() => {
    // Simulate model loading
    const loadModel = async () => {
      setIsLoading(true);
      setModelStatus('loading');
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setModelStatus('ready');
      setIsLoading(false);
      onModelLoad(true);
    };

    loadModel();
  }, [onModelLoad]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="card w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Model Status</h3>
          <div className={`w-3 h-3 rounded-full ${
            modelStatus === 'ready' ? 'bg-green-500' :
            modelStatus === 'loading' ? 'bg-yellow-500 animate-pulse' :
            modelStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
          }`} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{modelInfo.architecture}</p>
              <p className="text-xs text-gray-500">{modelInfo.parameters} parameters</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">{modelInfo.device}</p>
              <p className="text-xs text-gray-500">{modelInfo.precision}</p>
            </div>
          </div>

          {modelStatus === 'loading' && (
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-600 animate-pulse" />
              <div>
                <p className="text-sm font-medium">Loading Model...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}} />
                </div>
              </div>
            </div>
          )}

          {modelStatus === 'ready' && (
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Model Ready</p>
                <p className="text-xs text-gray-500">Ready for inference</p>
              </div>
            </div>
          )}

          {modelStatus === 'error' && (
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Error Loading</p>
                <p className="text-xs text-gray-500">Check console for details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelInterface;