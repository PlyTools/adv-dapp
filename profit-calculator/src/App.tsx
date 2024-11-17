import React, { useState } from 'react';
import regression from 'regression';
import { DataRow as DataRowComponent } from './components/DataRow';
import { ResultChart } from './components/ResultChart';
import { DataRow, ChartData } from './types';
import { PlayCircle } from 'lucide-react';

function App() {
  const [rows, setRows] = useState<DataRow[]>([
    { id: '1', uprofit: 0, units: 0, hours: 0 },
  ]);
  const [results, setResults] = useState<{
    chartData: ChartData[];
    regressionLine: ChartData[];
    maxPoint: ChartData;
  } | null>(null);

  const handleUpdate = (id: string, field: keyof DataRow, value: number) => {
    if (value < 0) {
      alert("Values must be non-negative.");
      return;
    }
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleAdd = () => {
    setRows((prev) => [
      ...prev,
      { id: String(Date.now()), uprofit: 0, units: 0, hours: 0 },
    ]);
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const calculateResults = () => {
    const calculatedData = rows.map((row) => {
      if (row.hours <= 0) {
        return { ...row, hprofit: 0 };
      }
      return {
        ...row,
        hprofit: (row.uprofit * row.units) / row.hours,
      };
    });

    const points = calculatedData.map((row) => [row.uprofit, row.hprofit]);
    const result = regression.polynomial(points, { order: 2 });

    const profitRangeMin = Math.min(...points.map((p) => p[0]));
    const profitRangeMax = Math.max(...points.map((p) => p[0]));
    const step = (profitRangeMax - profitRangeMin) / 50;
    
    const regressionPoints = Array.from({ length: 51 }, (_, i) => {
      const x = profitRangeMin + i * step;
      return { uprofit: x, hprofit: result.predict(x)[1] };
    });

    const maxPoint = regressionPoints.reduce((prev, current) => {
      return (prev.hprofit > current.hprofit) ? prev : current;
    });

    setResults({
      chartData: calculatedData.map((row) => ({
        uprofit: parseFloat(row.uprofit.toFixed(2)),
        hprofit: parseFloat((row.hprofit || 0).toFixed(2)),
      })),
      regressionLine: regressionPoints,
      maxPoint: { uprofit: parseFloat(maxPoint.uprofit.toFixed(2)), hprofit: parseFloat(maxPoint.hprofit.toFixed(2)) },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Profit Calculator
          </h1>

          <div className="space-y-6">
            {rows.map((row) => (
              <DataRowComponent
                key={row.id}
                data={row}
                onUpdate={handleUpdate}
                onAdd={handleAdd}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <button
            onClick={calculateResults}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlayCircle size={24} />
            Calculate Results
          </button>

          {results && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Analysis Results
              </h2>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-lg">
                  Maximum Hourly Profit: ${results.maxPoint.hprofit.toFixed(2)}/hr
                </p>
                <p className="text-lg">
                  Optimal Unit Profit: ${results.maxPoint.uprofit.toFixed(2)}
                </p>
              </div>
              <ResultChart
                data={results.chartData}
                regressionLine={results.regressionLine}
                maxPoint={results.maxPoint}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;