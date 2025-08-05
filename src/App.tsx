import React, { useState } from 'react';
import { Brain, Zap, Target, Settings, Play, Download, Upload } from 'lucide-react';
import ModelInterface from './components/ModelInterface';
import SudokuSolver from './components/SudokuSolver';
import ARCSolver from './components/ARCSolver';
import MazeSolver from './components/MazeSolver';
import TrainingInterface from './components/TrainingInterface';
import ModelMetrics from './components/ModelMetrics';

type TabType = 'sudoku' | 'arc' | 'maze' | 'training' | 'metrics';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sudoku');
  const [modelLoaded, setModelLoaded] = useState(false);

  const tabs = [
    { id: 'sudoku', label: 'Sudoku Solver', icon: Target },
    { id: 'arc', label: 'ARC-AGI', icon: Brain },
    { id: 'maze', label: 'Maze Solver', icon: Zap },
    { id: 'training', label: 'Training', icon: Play },
    { id: 'metrics', label: 'Metrics', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HRM</h1>
                <p className="text-xs text-gray-500">Hierarchical Reasoning Model</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                modelLoaded 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {modelLoaded ? 'Model Ready' : 'Loading Model...'}
              </div>
              
              <button className="btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <button className="btn-primary">
                <Upload className="w-4 h-4 mr-2" />
                Load Model
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'sudoku' && <SudokuSolver />}
        {activeTab === 'arc' && <ARCSolver />}
        {activeTab === 'maze' && <MazeSolver />}
        {activeTab === 'training' && <TrainingInterface />}
        {activeTab === 'metrics' && <ModelMetrics />}
      </main>

      {/* Model Interface - Always visible */}
      <ModelInterface onModelLoad={setModelLoaded} />
    </div>
  );
}

export default App;