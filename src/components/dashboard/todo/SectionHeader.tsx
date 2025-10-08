import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Section } from './types';

interface SectionHeaderProps {
  section: Section;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SectionHeader({ section, isExpanded, onToggle }: SectionHeaderProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'inbox':
        return '📥';
      case 'calendar':
        return '📅';
      case 'clock':
        return '⏰';
      case 'folder':
        return '📁';
      case 'tag':
        return '🏷️';
      default:
        return '📋';
    }
  };

  return (
    <button
      onClick={onToggle}
      className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${section.title} section`}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <span className="text-sm">{getIcon(section.icon)}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {section.title}
        </span>
        {section.count > 0 && (
          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full min-w-0">
            {section.count}
          </span>
        )}
      </div>
      <div className="flex-shrink-0 ml-2">
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
        )}
      </div>
    </button>
  );
}
