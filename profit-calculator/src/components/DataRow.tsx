import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { DataRow as DataRowType } from '../types';

interface DataRowProps {
  data: DataRowType;
  onUpdate: (id: string, field: keyof DataRowType, value: number) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export const DataRow: React.FC<DataRowProps> = ({ data, onUpdate, onAdd, onDelete }) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-1">
        <input
          type="number"
          step="0.01"
          value={data.uprofit || ''}
          onChange={(e) => onUpdate(data.id, 'uprofit', parseFloat(e.target.value))}
          placeholder="Unit Profit"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />
      </div>
      <div className="flex-1">
        <input
          type="number"
          step="0.01"
          value={data.units || ''}
          onChange={(e) => onUpdate(data.id, 'units', parseFloat(e.target.value))}
          placeholder="Units"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />
      </div>
      <div className="flex-1">
        <input
          type="number"
          step="0.01"
          value={data.hours || ''}
          onChange={(e) => onUpdate(data.id, 'hours', parseFloat(e.target.value))}
          placeholder="Hours"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAdd}
          className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={() => onDelete(data.id)}
          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};