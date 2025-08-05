import React, { useState } from 'react';
import { Play, RotateCcw, MapPin, Target, Navigation } from 'lucide-react';

const MazeSolver: React.FC = () => {
  const [maze, setMaze] = useState<string[][]>(
    Array(20).fill(null).map(() => Array(20).fill(' '))
  );
  const [solution, setSolution] = useState<string[][]>(
    Array(20).fill(null).map(() => Array(20).fill(' '))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [startPos, setStartPos] = useState<{row: number, col: number} | null>(null);
  const [goalPos, setGoalPos] = useState<{row: number, col: number} | null>(null);
  const [mode, setMode] = useState<'wall' | 'start' | 'goal'>('wall');

  const loadSampleMaze = () => {
    const sampleMaze = Array(20).fill(null).map(() => Array(20).fill(' '));
    
    // Create walls
    for (let i = 0; i < 20; i++) {
      sampleMaze[0][i] = '#';
      sampleMaze[19][i] = '#';
      sampleMaze[i][0] = '#';
      sampleMaze[i][19] = '#';
    }
    
    // Add some internal walls
    for (let i = 2; i < 18; i += 3) {
      for (let j = 2; j < 18; j += 2) {
        sampleMaze[i][j] = '#';
      }
    }
    
    // Set start and goal
    sampleMaze[1][1] = 'S';
    sampleMaze[18][18] = 'G';
    
    setMaze(sampleMaze);
    setSolution(sampleMaze.map(row => [...row]));
    setStartPos({row: 1, col: 1});
    setGoalPos({row: 18, col: 18});
  };

  const solveMaze = async () => {
    if (!startPos || !goalPos) {
      alert('Please set both start and goal positions');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate HRM solving process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple path finding simulation (in real implementation, HRM would solve this)
    const newSolution = maze.map(row => [...row]);
    
    // Draw a simple path (this would be the actual HRM solution)
    const path = [
      {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}, {row: 2, col: 3},
      {row: 3, col: 3}, {row: 4, col: 3}, {row: 5, col: 3}, {row: 6, col: 3},
      {row: 7, col: 3}, {row: 8, col: 3}, {row: 9, col: 3}, {row: 10, col: 3},
      {row: 11, col: 3}, {row: 12, col: 3}, {row: 13, col: 3}, {row: 14, col: 3},
      {row: 15, col: 3}, {row: 16, col: 3}, {row: 17, col: 3}, {row: 18, col: 3},
      {row: 18, col: 4}, {row: 18, col: 5}, {row: 18, col: 6}, {row: 18, col: 7},
      {row: 18, col: 8}, {row: 18, col: 9}, {row: 18, col: 10}, {row: 18, col: 11},
      {row: 18, col: 12}, {row: 18, col: 13}, {row: 18, col: 14}, {row: 18, col: 15},
      {row: 18, col: 16}, {row: 18, col: 17}, {row: 18, col: 18}
    ];
    
    // Animate path drawing
    for (const pos of path) {
      if (newSolution[pos.row][pos.col] === ' ') {
        newSolution[pos.row][pos.col] = 'o';
        setSolution([...newSolution]);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setIsLoading(false);
  };

  const resetMaze = () => {
    const emptyMaze = Array(20).fill(null).map(() => Array(20).fill(' '));
    setMaze(emptyMaze);
    setSolution(emptyMaze);
    setStartPos(null);
    setGoalPos(null);
  };

  const handleCellClick = (row: number, col: number) => {
    const newMaze = maze.map(r => [...r]);
    const newSolution = solution.map(r => [...r]);
    
    if (mode === 'wall') {
      newMaze[row][col] = newMaze[row][col] === '#' ? ' ' : '#';
      newSolution[row][col] = newMaze[row][col];
    } else if (mode === 'start') {
      // Clear previous start
      if (startPos) {
        newMaze[startPos.row][startPos.col] = ' ';
        newSolution[startPos.row][startPos.col] = ' ';
      }
      newMaze[row][col] = 'S';
      newSolution[row][col] = 'S';
      setStartPos({row, col});
    } else if (mode === 'goal') {
      // Clear previous goal
      if (goalPos) {
        newMaze[goalPos.row][goalPos.col] = ' ';
        newSolution[goalPos.row][goalPos.col] = ' ';
      }
      newMaze[row][col] = 'G';
      newSolution[row][col] = 'G';
      setGoalPos({row, col});
    }
    
    setMaze(newMaze);
    setSolution(newSolution);
  };

  const getCellStyle = (cell: string) => {
    switch (cell) {
      case '#': return 'bg-gray-800';
      case 'S': return 'bg-green-500';
      case 'G': return 'bg-red-500';
      case 'o': return 'bg-blue-400';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maze Solver</h2>
          <p className="text-gray-600">Solve pathfinding problems using HRM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Maze Grid */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Maze Grid (20x20)</h3>
              <div className="flex space-x-2">
                <button onClick={loadSampleMaze} className="btn-secondary text-sm">
                  Load Sample
                </button>
                <button onClick={resetMaze} className="btn-secondary text-sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-20 gap-0 p-4 bg-gray-50 rounded-lg" style={{gridTemplateColumns: 'repeat(20, 1fr)'}}>
              {solution.map((row, i) =>
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`w-4 h-4 border cursor-pointer ${getCellStyle(cell)} hover:opacity-80`}
                    onClick={() => handleCellClick(i, j)}
                  />
                ))
              )}
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={solveMaze}
                disabled={isLoading || !startPos || !goalPos}
                className="btn-primary flex items-center space-x-2"
              >
                <Navigation className="w-4 h-4" />
                <span>{isLoading ? 'Finding Path...' : 'Solve with HRM'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Drawing Mode</h3>
            <div className="space-y-2">
              <button
                onClick={() => setMode('wall')}
                className={`w-full p-2 rounded-lg border-2 transition-colors ${
                  mode === 'wall' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-800 rounded"></div>
                  <span>Wall</span>
                </div>
              </button>
              
              <button
                onClick={() => setMode('start')}
                className={`w-full p-2 rounded-lg border-2 transition-colors ${
                  mode === 'start' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>Start (S)</span>
                </div>
              </button>
              
              <button
                onClick={() => setMode('goal')}
                className={`w-full p-2 rounded-lg border-2 transition-colors ${
                  mode === 'goal' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span>Goal (G)</span>
                </div>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-800 rounded"></div>
                <span>Wall (#)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Start (S)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Goal (G)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span>Path (o)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span>Empty</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Model Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Depth
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  defaultValue="25"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Algorithm
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>HRM Pathfinding</option>
                  <option>A* (comparison)</option>
                  <option>Dijkstra (comparison)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Position</span>
                <span className="font-medium">
                  {startPos ? `(${startPos.row}, ${startPos.col})` : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goal Position</span>
                <span className="font-medium">
                  {goalPos ? `(${goalPos.row}, ${goalPos.col})` : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Walls</span>
                <span className="font-medium">
                  {maze.flat().filter(cell => cell === '#').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MazeSolver;