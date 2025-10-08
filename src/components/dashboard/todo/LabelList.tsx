import { useState } from 'react';
import { ChevronDown, ChevronRight, Tag, Plus } from 'lucide-react';
import type { Label } from './types';

interface LabelListProps {
  labels: Label[];
}

export function LabelList({ labels }: LabelListProps) {
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());

  const toggleLabel = (labelId: string) => {
    setExpandedLabels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(labelId)) {
        newSet.delete(labelId);
      } else {
        newSet.add(labelId);
      }
      return newSet;
    });
  };

  if (labels.length === 0) {
    return (
      <div className="px-2 pb-2">
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <Tag className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No labels yet</p>
          <button className="mt-2 text-xs text-healthcare-600 dark:text-healthcare-400 hover:underline">
            Create your first label
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 pb-2">
      <div className="space-y-1">
        {labels.map(label => {
          const isExpanded = expandedLabels.has(label.id);
          
          return (
            <div key={label.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleLabel(label.id)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {label.name}
                  </span>
                  {label.taskCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                      {label.taskCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle filter by label
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Filter by ${label.name}`}
                  >
                    <Tag className="w-3 h-3 text-gray-500" />
                  </button>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  {label.taskCount} task{label.taskCount !== 1 ? 's' : ''} with this label
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
