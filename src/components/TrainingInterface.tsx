import React, { useState } from 'react';
import { Play, Pause, Square, Download, Upload, BarChart3, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrainingInterface: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingData, setTrainingData] = useState([
    { epoch: 0, loss: 2.5, accuracy: 0.1 },
    { epoch: 100, loss: 1.8, accuracy: 0.3 },
    { epoch: 200, loss: 1.2, accuracy: 0.6 },
    { epoch: 300, loss: 0.8, accuracy: 0.8 },
    { epoch: 400, loss: 0.5, accuracy: 0.9 },
    { epoch: 500, loss: 0.3, accuracy: 0.95 },
  ]);
  const [currentEpoch, setCurrentEpoch] = useState(500);
  const [selectedDataset, setSelectedDataset] = useState('sudoku');

  const startTraining = () => {
    setIsTraining(true);
    // Simulate training progress
    const interval = setInterval(() => {
      setCurrentEpoch(prev => {
        const newEpoch = prev + 10;
        if (newEpoch >= 1000) {
          setIsTraining(false);
          clearInterval(interval);
          return 1000;
        }
        
        // Add new training data point
        setTrainingData(prev => [...prev, {
          epoch: newEpoch,
          loss: Math.max(0.1, 2.5 * Math.exp(-newEpoch / 300) + Math.random() * 0.1),
          accuracy: Math.min(0.99, 1 - Math.exp(-newEpoch / 200) + Math.random() * 0.05)
        }]);
        
        return newEpoch;
      });
    }, 100);
  };

  const stopTraining = () => {
    setIsTraining(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Training</h2>
          <p className="text-gray-600">Train HRM on different reasoning tasks</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isTraining 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isTraining ? 'Training...' : 'Ready'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Training Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Training Progress</h3>
              <div className="flex space-x-2">
                {!isTraining ? (
                  <button onClick={startTraining} className="btn-primary flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Start Training</span>
                  </button>
                ) : (
                  <button onClick={stopTraining} className="btn-secondary flex items-center space-x-2">
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                )}
                <button className="btn-secondary">
                  <Square className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Epoch: {currentEpoch}/1000</span>
                <span>Progress: {Math.round((currentEpoch / 1000) * 100)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentEpoch / 1000) * 100}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Loss</span>
                  <p className="font-semibold text-lg">
                    {trainingData[trainingData.length - 1]?.loss.toFixed(3) || '0.000'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Accuracy</span>
                  <p className="font-semibold text-lg">
                    {((trainingData[trainingData.length - 1]?.accuracy || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Time Remaining</span>
                  <p className="font-semibold text-lg">
                    {isTraining ? `${Math.round((1000 - currentEpoch) / 10)}s` : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Training Charts */}
          <div className="card">
            <h3 className="font-semibold mb-4">Training Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Loss</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trainingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Accuracy</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trainingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Dataset Configuration */}
          <div className="card">
            <h3 className="font-semibold mb-4">Dataset Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dataset Type
                </label>
                <select 
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="sudoku">Sudoku Extreme (1K)</option>
                  <option value="arc">ARC-AGI (960)</option>
                  <option value="maze">Maze 30x30 (1K)</option>
                  <option value="custom">Custom Dataset</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Augmentation Factor
                </label>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="btn-secondary flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Dataset</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Preprocessed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Training Settings */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Model Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Architecture
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>HRM-ACT-V1</option>
                  <option>HRM-ACT-V2</option>
                  <option>Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hidden Size
                </label>
                <input
                  type="number"
                  defaultValue="512"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  H Layers
                </label>
                <input
                  type="number"
                  defaultValue="4"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  L Layers
                </label>
                <input
                  type="number"
                  defaultValue="4"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Training Hyperparameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Rate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  defaultValue="0.0001"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Size
                </label>
                <input
                  type="number"
                  defaultValue="768"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight Decay
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue="0.1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Steps
                </label>
                <input
                  type="number"
                  defaultValue="16"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Checkpoints</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Save Checkpoint</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Load Checkpoint</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Auto-save Settings</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">System Resources</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">GPU Memory</span>
                <span className="text-sm font-medium">8.2GB / 24GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '34%'}} />
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}} />
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RAM Usage</span>
                <span className="text-sm font-medium">12GB / 32GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{width: '37%'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingInterface;