
import React, { useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XIcon } from './Icons';

interface DiceCategoryProps {
  title: string;
  values: string[];
  onAddValue: (value: string) => void;
  onUpdateValue: (index: number, newValue: string) => void;
  onDeleteValue: (index: number) => void;
}

const DiceCategory: React.FC<DiceCategoryProps> = ({ title, values, onAddValue, onUpdateValue, onDeleteValue }) => {
  const [newValue, setNewValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = () => {
    if (newValue.trim()) {
      onAddValue(newValue);
      setNewValue('');
    }
  };

  const startEditing = (index: number, value: string) => {
    setEditingIndex(index);
    setEditingValue(value);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleUpdate = () => {
    if (editingIndex !== null && editingValue.trim()) {
      onUpdateValue(editingIndex, editingValue);
      cancelEditing();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  }


  return (
    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-gray-700 flex flex-col h-full">
      <h3 className="text-xl font-bold capitalize mb-4 text-purple-300">{title} (d{values.length})</h3>
      <div className="space-y-2 flex-grow overflow-y-auto max-h-60 pr-2">
        {values.map((value, index) => (
          <div key={index} className="group flex items-center justify-between bg-gray-700/50 rounded-md p-2 hover:bg-gray-700 transition-colors">
            {editingIndex === index ? (
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="bg-gray-600 text-white rounded-md p-1 w-full mr-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            ) : (
              <span className="text-gray-300 flex-1">{value}</span>
            )}
            <div className="flex items-center space-x-2">
              {editingIndex === index ? (
                <>
                  <button onClick={handleUpdate} className="text-green-400 hover:text-green-300"><CheckIcon /></button>
                  <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-300"><XIcon /></button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditing(index, value)} className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-opacity"><PencilIcon /></button>
                  <button onClick={() => onDeleteValue(index)} className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"><TrashIcon /></button>
                </>
              )}
            </div>
          </div>
        ))}
         {values.length === 0 && <p className="text-gray-500 text-center py-4">No values yet. Add one below!</p>}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add new ${title}...`}
          className="bg-gray-700 text-white rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
        />
        <button
          onClick={handleAdd}
          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors shrink-0"
          aria-label="Add value"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

export default DiceCategory;
