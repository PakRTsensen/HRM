import React, { useState } from 'react';
import { Play, RotateCcw, Upload, Download, Grid3X3 } from 'lucide-react';

const ARCSolver: React.FC = () => {
  const [inputGrid, setInputGrid] = useState<number[][]>(
    Array(10).fill(null).map(() => Array(10).fill(0))
  );
  const [outputGrid, setOutputGrid] = useState<number[][]>(
    Array(10).fill(null).map(() => Array(10).fill(0))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [examples, setExamples] = useState<Array<{input: number[][], output: number[][]}>>([]);

  const arcColors = [
    '#000000', // 0: black
    '#0074D9', // 1: blue
    '#FF4136', // 2: red
    '#2ECC40', // 3: green
    '#FFDC00', // 4: yellow
    '#AAAAAA', // 5: grey
    '#F012BE', // 6: fuschia
    '#FF851B', // 7: orange
    '#7FDBFF', // 8: teal
    '#870C25'  // 9: brown
  ];

  const loadSamplePuzzle = () => {
    // Sample ARC puzzle pattern
    const sampleInput = [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 3]
    ];
    
    setInputGrid(sampleInput);
    setOutputGrid(Array(10).fill(null).map(() => Array(10).fill(0)));
  };

  const solveARC = async () => {
    setIsLoading(true);
    
    // Simulate HRM solving process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Sample solution pattern
    const solution = [
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 3, 3, 3],
      [0, 0, 0, 0, 0, 0, 0, 3, 3, 3],
      [0, 0, 0, 0, 0, 0, 0, 3, 3, 3]
    ];
    
    setOutputGrid(solution);
    setIsLoading(false);
  };

  const resetGrids = () => {
    setInputGrid(Array(10).fill(null).map(() => Array(10).fill(0)));
    setOutputGrid(Array(10).fill(null).map(() => Array(10).fill(0)));
  };

  const updateInputCell = (row: number, col: number, color: number) => {
    setInputGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = color;
      return newGrid;
    });
  };

  const GridComponent: React.FC<{
    grid: number[][];
    title: string;
    editable?: boolean;
    onCellClick?: (row: number, col: number) => void;
  }> = ({ grid, title, editable = false, onCellClick }) => (
    <div className="card">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-10 gap-1 p-4 bg-gray-50 rounded-lg">
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`grid-cell cursor-pointer border-2 ${
                editable ? 'hover:border-blue-400' : ''
              }`}
              style={{ backgroundColor: arcColors[cell] }}
              onClick={() => editable && onCellClick?.(i, j)}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ARC-AGI Solver</h2>
          <p className="text-gray-600">Solve Abstraction and Reasoning Corpus puzzles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input/Output Grids */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GridComponent
              grid={inputGrid}
              title="Input Pattern"
              editable={true}
              onCellClick={(row, col) => {
                // Cycle through colors 0-9
                const currentColor = inputGrid[row][col];
                const nextColor = (currentColor + 1) % 10;
                updateInputCell(row, col, nextColor);
              }}
            />
            
            <GridComponent
              grid={outputGrid}
              title="Predicted Output"
            />
          </div>
          
          <div className="flex justify-center space-x-4">
            <button onClick={loadSamplePuzzle} className="btn-secondary">
              Load Sample
            </button>
            <button onClick={resetGrids} className="btn-secondary">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={solveARC}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{isLoading ? 'Solving...' : 'Solve with HRM'}</span>
            </button>
          </div>
        </div>

        {/* Controls & Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Color Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {arcColors.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:border-blue-400"
                  style={{ backgroundColor: color }}
                  title={`Color ${index}`}
                />
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Model Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reasoning Steps
                </label>
                <input
                  type="range"
                  min="1"
                  max="32"
                  defaultValue="16"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern Complexity
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Simple</option>
                  <option>Medium</option>
                  <option>Complex</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Training Examples</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Load Examples</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Grid3X3 className="w-4 h-4" />
                <span>View Dataset</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Instructions</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Click cells in the input grid to change colors</p>
              <p>2. Colors cycle from 0-9 (black to brown)</p>
              <p>3. Click "Solve with HRM" to generate output</p>
              <p>4. The model will identify patterns and transformations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARCSolver;