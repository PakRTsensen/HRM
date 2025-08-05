import React, { useState } from 'react';
import { Play, RotateCcw, Download, Upload, Zap } from 'lucide-react';

const SudokuSolver: React.FC = () => {
  const [sudokuGrid, setSudokuGrid] = useState<number[][]>(
    Array(9).fill(null).map(() => Array(9).fill(0))
  );
  const [originalGrid, setOriginalGrid] = useState<number[][]>(
    Array(9).fill(null).map(() => Array(9).fill(0))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [solveTime, setSolveTime] = useState<number | null>(null);

  // Sample hard Sudoku puzzle
  const loadSamplePuzzle = () => {
    const sample = [
      [0, 0, 0, 6, 0, 0, 4, 0, 0],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 0, 0, 0, 9, 1, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 1, 8, 0, 0, 0, 3],
      [0, 0, 0, 3, 0, 6, 0, 4, 5],
      [0, 4, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 1, 0, 0]
    ];
    setSudokuGrid(sample);
    setOriginalGrid(sample.map(row => [...row]));
    setSolveTime(null);
  };

  const solveSudoku = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    // Simulate HRM solving process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Sample solution (in real implementation, this would call the HRM model)
    const solution = [
      [2, 6, 1, 6, 3, 7, 4, 9, 5],
      [7, 8, 9, 4, 2, 3, 6, 1, 2],
      [3, 4, 5, 8, 9, 1, 7, 8, 6],
      [1, 9, 7, 5, 4, 2, 8, 3, 6],
      [6, 5, 2, 1, 8, 9, 9, 7, 3],
      [8, 3, 4, 3, 7, 6, 2, 4, 5],
      [5, 4, 8, 2, 1, 3, 3, 6, 7],
      [9, 1, 3, 7, 6, 4, 5, 2, 8],
      [4, 2, 6, 9, 5, 8, 1, 3, 9]
    ];
    
    // Animate solution
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (originalGrid[i][j] === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setSudokuGrid(prev => {
            const newGrid = prev.map(row => [...row]);
            newGrid[i][j] = solution[i][j];
            return newGrid;
          });
        }
      }
    }
    
    const endTime = Date.now();
    setSolveTime(endTime - startTime);
    setIsLoading(false);
  };

  const resetGrid = () => {
    setSudokuGrid(Array(9).fill(null).map(() => Array(9).fill(0)));
    setOriginalGrid(Array(9).fill(null).map(() => Array(9).fill(0)));
    setSolveTime(null);
  };

  const updateCell = (row: number, col: number, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 9) {
      setSudokuGrid(prev => {
        const newGrid = prev.map(r => [...r]);
        newGrid[row][col] = numValue;
        return newGrid;
      });
      setOriginalGrid(prev => {
        const newGrid = prev.map(r => [...r]);
        newGrid[row][col] = numValue;
        return newGrid;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sudoku Solver</h2>
          <p className="text-gray-600">Solve 9x9 Sudoku puzzles using HRM</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {solveTime && (
            <div className="flex items-center space-x-2 text-green-600">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">{solveTime}ms</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sudoku Grid */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Puzzle Grid</h3>
              <div className="flex space-x-2">
                <button onClick={loadSamplePuzzle} className="btn-secondary text-sm">
                  Load Sample
                </button>
                <button onClick={resetGrid} className="btn-secondary text-sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-9 gap-1 p-4 bg-gray-50 rounded-lg">
              {sudokuGrid.map((row, i) =>
                row.map((cell, j) => (
                  <input
                    key={`${i}-${j}`}
                    type="text"
                    value={cell === 0 ? '' : cell}
                    onChange={(e) => updateCell(i, j, e.target.value)}
                    className={`sudoku-cell ${
                      originalGrid[i][j] !== 0 ? 'given' : 
                      cell !== 0 && originalGrid[i][j] === 0 ? 'solved' : 'bg-white'
                    } ${
                      (i + 1) % 3 === 0 && i !== 8 ? 'border-b-2 border-b-gray-600' : ''
                    } ${
                      (j + 1) % 3 === 0 && j !== 8 ? 'border-r-2 border-r-gray-600' : ''
                    }`}
                    maxLength={1}
                    disabled={isLoading}
                  />
                ))
              )}
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={solveSudoku}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{isLoading ? 'Solving...' : 'Solve with HRM'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls & Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Model Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Steps
                </label>
                <input
                  type="range"
                  min="1"
                  max="32"
                  defaultValue="16"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>16</span>
                  <span>32</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0.1"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span>1.0</span>
                  <span>2.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Filled Cells</span>
                <span className="text-sm font-medium">
                  {sudokuGrid.flat().filter(cell => cell !== 0).length}/81
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Empty Cells</span>
                <span className="text-sm font-medium">
                  {sudokuGrid.flat().filter(cell => cell === 0).length}
                </span>
              </div>
              {solveTime && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Solve Time</span>
                  <span className="text-sm font-medium text-green-600">
                    {solveTime}ms
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Import Puzzle</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Solution</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SudokuSolver;