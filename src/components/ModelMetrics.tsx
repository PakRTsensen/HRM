import React, { useState } from 'react';
import { BarChart3, TrendingUp, Target, Zap, Download, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const ModelMetrics: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('hrm-sudoku');
  
  const performanceData = [
    { task: 'Sudoku Easy', accuracy: 99.8, time: 120 },
    { task: 'Sudoku Hard', accuracy: 97.5, time: 450 },
    { task: 'Sudoku Extreme', accuracy: 94.2, time: 1200 },
    { task: 'ARC Simple', accuracy: 89.3, time: 800 },
    { task: 'ARC Complex', accuracy: 76.8, time: 2100 },
    { task: 'Maze 10x10', accuracy: 100, time: 80 },
    { task: 'Maze 30x30', accuracy: 98.7, time: 340 },
  ];

  const radarData = [
    { subject: 'Pattern Recognition', A: 92, B: 85, fullMark: 100 },
    { subject: 'Logical Reasoning', A: 88, B: 78, fullMark: 100 },
    { subject: 'Spatial Understanding', A: 95, B: 82, fullMark: 100 },
    { subject: 'Sequential Planning', A: 91, B: 79, fullMark: 100 },
    { subject: 'Abstract Thinking', A: 87, B: 73, fullMark: 100 },
    { subject: 'Problem Solving', A: 93, B: 81, fullMark: 100 },
  ];

  const modelComparison = [
    { model: 'HRM-V1', parameters: '27M', sudoku: 94.2, arc: 76.8, maze: 98.7 },
    { model: 'GPT-4', parameters: '1.7T', sudoku: 87.3, arc: 42.1, maze: 91.2 },
    { model: 'Claude-3', parameters: '~200B', sudoku: 89.7, arc: 38.9, maze: 93.4 },
    { model: 'Gemini-Pro', parameters: '~540B', sudoku: 85.1, arc: 35.2, maze: 88.9 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Metrics</h2>
          <p className="text-gray-600">Performance analysis and benchmarks</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="hrm-sudoku">HRM-Sudoku</option>
            <option value="hrm-arc">HRM-ARC</option>
            <option value="hrm-maze">HRM-Maze</option>
          </select>
          
          <button className="btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Key Metrics Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Accuracy</p>
                <p className="text-2xl font-bold text-green-600">94.2%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+2.3% from last week</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Solve Time</p>
                <p className="text-2xl font-bold text-blue-600">1.2s</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-blue-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>15% faster</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Parameters</p>
                <p className="text-2xl font-bold text-purple-600">27M</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-purple-600">
                <span>Efficient architecture</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Energy Efficiency</p>
                <p className="text-2xl font-bold text-orange-600">98.5%</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-orange-600">
                <span>Low power consumption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance by Task */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold mb-4">Performance by Task</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="task" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capability Radar */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold mb-4">Capability Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="HRM" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="Baseline" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Comparison */}
        <div className="lg:col-span-4">
          <div className="card">
            <h3 className="font-semibold mb-4">Model Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Model</th>
                    <th className="text-left py-2">Parameters</th>
                    <th className="text-left py-2">Sudoku Accuracy</th>
                    <th className="text-left py-2">ARC Accuracy</th>
                    <th className="text-left py-2">Maze Accuracy</th>
                    <th className="text-left py-2">Efficiency Score</th>
                  </tr>
                </thead>
                <tbody>
                  {modelComparison.map((model, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{model.model}</td>
                      <td className="py-3">{model.parameters}</td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <span>{model.sudoku}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${model.sudoku}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <span>{model.arc}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${model.arc}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <span>{model.maze}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${model.maze}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          model.model === 'HRM-V1' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {model.model === 'HRM-V1' ? 'Excellent' : 'Good'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold mb-4">Detailed Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Training Accuracy</span>
                  <span className="text-sm font-medium">99.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '99.2%'}} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Validation Accuracy</span>
                  <span className="text-sm font-medium">94.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '94.2%'}} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Generalization Score</span>
                  <span className="text-sm font-medium">87.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '87.8%'}} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Robustness Score</span>
                  <span className="text-sm font-medium">91.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '91.5%'}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold mb-4">Recent Evaluations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Sudoku Extreme Test</p>
                  <p className="text-sm text-gray-600">1000 puzzles</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">94.2%</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">ARC Validation</p>
                  <p className="text-sm text-gray-600">400 tasks</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">76.8%</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Maze Pathfinding</p>
                  <p className="text-sm text-gray-600">500 mazes</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-purple-600">98.7%</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelMetrics;