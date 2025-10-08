import { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Tag, Folder } from 'lucide-react';
import type { Project, Label } from './types';

interface QuickAddProps {
  onAddTask: (title: string, projectId?: string, dueDate?: string, labels?: string[]) => void;
  projects: Project[];
  labels: Label[];
}

export function QuickAdd({ onAddTask, projects, labels }: QuickAddProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedProject, setSuggestedProject] = useState<Project | null>(null);
  const [suggestedDueDate, setSuggestedDueDate] = useState<string | null>(null);
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.trim()) {
      parseInput(input);
    } else {
      setSuggestedProject(null);
      setSuggestedDueDate(null);
      setSuggestedLabels([]);
    }
  }, [input]);

  const parseInput = (text: string) => {
    // Parse project suggestions
    const projectMatch = projects.find(p => 
      text.toLowerCase().includes(p.name.toLowerCase())
    );
    setSuggestedProject(projectMatch || null);

    // Parse due date suggestions
    const datePatterns = [
      { pattern: /tomorrow/i, date: getTomorrow() },
      { pattern: /today/i, date: getToday() },
      { pattern: /next week/i, date: getNextWeek() },
      { pattern: /(\d{1,2})\/(\d{1,2})/, date: parseDateMatch(text) },
    ];

    let foundDate = null;
    for (const { pattern, date } of datePatterns) {
      if (pattern.test(text)) {
        foundDate = date;
        break;
      }
    }
    setSuggestedDueDate(foundDate);

    // Parse label suggestions
    const foundLabels = labels
      .filter(label => text.toLowerCase().includes(label.name.toLowerCase()))
      .map(label => label.id);
    setSuggestedLabels(foundLabels);
  };

  const getToday = () => new Date().toISOString().split('T')[0];
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  const getNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };
  const parseDateMatch = (text: string) => {
    const match = text.match(/(\d{1,2})\/(\d{1,2})/);
    if (match) {
      const [, month, day] = match;
      const year = new Date().getFullYear();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Clean the input by removing parsed elements
    let cleanTitle = input.trim();
    
    // Remove project references
    if (suggestedProject) {
      cleanTitle = cleanTitle.replace(new RegExp(suggestedProject.name, 'gi'), '').trim();
    }
    
    // Remove date references
    cleanTitle = cleanTitle.replace(/tomorrow|today|next week|\d{1,2}\/\d{1,2}/gi, '').trim();
    
    // Remove label references
    suggestedLabels.forEach(labelId => {
      const label = labels.find(l => l.id === labelId);
      if (label) {
        cleanTitle = cleanTitle.replace(new RegExp(label.name, 'gi'), '').trim();
      }
    });

    onAddTask(
      cleanTitle,
      suggestedProject?.id,
      suggestedDueDate || undefined,
      suggestedLabels.length > 0 ? suggestedLabels : undefined
    );

    setInput('');
    setSuggestedProject(null);
    setSuggestedDueDate(null);
    setSuggestedLabels([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInput('');
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const hasSuggestions = suggestedProject || suggestedDueDate || suggestedLabels.length > 0;

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Add a task..."
          className="w-full px-3 py-2 pr-8 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Add task"
        >
          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </form>

      {/* Suggestions */}
      {showSuggestions && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="space-y-2">
            {suggestedProject && (
              <div className="flex items-center space-x-2 text-xs">
                <Folder className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Project:</span>
                <span className="font-medium text-gray-900 dark:text-white">{suggestedProject.name}</span>
              </div>
            )}
            {suggestedDueDate && (
              <div className="flex items-center space-x-2 text-xs">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Due:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(suggestedDueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {suggestedLabels.length > 0 && (
              <div className="flex items-center space-x-2 text-xs">
                <Tag className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Labels:</span>
                <div className="flex space-x-1">
                  {suggestedLabels.map(labelId => {
                    const label = labels.find(l => l.id === labelId);
                    return label ? (
                      <span key={labelId} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {label.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
