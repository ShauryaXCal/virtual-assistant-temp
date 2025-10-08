import { ArrowRight, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface SuggestionCategory {
  id: string;
  title: string;
  icon: string;
  suggestions: string[];
}

interface SearchSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
  patientSpecific?: boolean;
}

const GENERAL_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'tough-questions',
    title: 'Ask a Tough Question',
    icon: '✏️',
    suggestions: [
      'What are the key factors to consider when selecting between immunotherapy and targeted therapy for a patient with metastatic melanoma and BRAF mutation?',
      'What strategies would you use to optimize heart failure management in a patient with reduced ejection fraction, chronic kidney disease, and recurrent hyperkalemia?',
      'How do you balance the risks and benefits of anticoagulation in an elderly patient with atrial fibrillation, recurrent falls, and a recent GI bleed?',
    ],
  },
  {
    id: 'drug-side-effects',
    title: 'Ask about Drug Side Effects',
    icon: '💊',
    suggestions: [
      'What are the most common side effects of metformin?',
      'Are there any serious or life-threatening side effects associated with long-term use of lisinopril?',
      'What are the known side effects of apixaban, particularly in elderly patients or those with kidney impairment?',
    ],
  },
  {
    id: 'guidelines',
    title: 'Ask about Guidelines',
    icon: '🛡️',
    suggestions: [
      'What are the current IDSA recommendations for treating multidrug-resistant Pseudomonas infections?',
      'Summarize the AHA/ACC guidelines for managing hypertension in patients with chronic kidney disease.',
      'What has been updated in the 2024 ADA guidelines?',
      'What do the ASCO guidelines recommend for the use of immunotherapy in triple-negative breast cancer?',
    ],
  },
  {
    id: 'workup',
    title: 'Construct a Workup',
    icon: '📋',
    suggestions: [
      'Normal pap HPV 18 whats the work up',
      'Outline the workup for suspected pulmonary embolism in a pregnant patient',
      'What is the appropriate workup for new-onset atrial fibrillation?',
    ],
  },
];

export function SearchSuggestions({ onSelectSuggestion, patientSpecific = false }: SearchSuggestionsProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className="w-full space-y-3">
      {GENERAL_CATEGORIES.map(category => {
        const isCategoryExpanded = expandedCategories.has(category.id);

        return (
          <div
            key={category.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {category.title}
                </span>
              </div>
              {isCategoryExpanded ? (
                <X className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {isCategoryExpanded && (
              <div className="space-y-0 border-t border-gray-200 dark:border-gray-700">
                {category.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectSuggestion(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-healthcare-50 dark:hover:bg-healthcare-900/20 transition-all duration-200 flex items-start justify-between group text-sm ${
                      index < category.suggestions.length - 1
                        ? 'border-b border-gray-100 dark:border-gray-800'
                        : ''
                    }`}
                  >
                    <span className="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed pr-3">
                      {suggestion}
                    </span>
                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 group-hover:text-healthcare-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-healthcare-500 hover:text-healthcare-600 hover:bg-healthcare-50 dark:hover:bg-healthcare-900/20 rounded-lg transition-colors"
        >
          <span>Explore More Capabilities</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
