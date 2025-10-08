import { ArrowRight, X, ChevronDown, Edit3, Pill, Shield, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface SuggestionCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  suggestions: string[];
}

interface SearchSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
  patientSpecific?: boolean;
}

const GENERAL_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'tough-questions',
    title: 'Complex Clinical Scenarios',
    icon: Edit3,
    suggestions: [
      'What factors should guide the choice between immunotherapy and targeted therapy for metastatic melanoma with BRAF mutation?',
      'How would you optimize heart failure management with reduced EF, chronic kidney disease, and recurrent hyperkalemia?',
      'How do you balance anticoagulation in elderly patients with atrial fibrillation, fall risk, and recent GI bleeding?',
    ],
  },
  {
    id: 'drug-side-effects',
    title: 'Medication Safety & Side Effects',
    icon: Pill,
    suggestions: [
      'What are the most common side effects of metformin?',
      'Are there serious or life-threatening effects from long-term lisinopril use?',
      'What side effects of apixaban should I monitor in elderly or renally impaired patients?',
    ],
  },
  {
    id: 'guidelines',
    title: 'Clinical Guidelines & Protocols',
    icon: Shield,
    suggestions: [
      'What are current IDSA recommendations for multidrug-resistant Pseudomonas infections?',
      'Summarize AHA/ACC guidelines for hypertension management with chronic kidney disease',
      'What has been updated in the 2024 ADA guidelines?',
      'What do ASCO guidelines recommend for immunotherapy in triple-negative breast cancer?',
    ],
  },
  {
    id: 'workup',
    title: 'Diagnostic Workup',
    icon: ClipboardList,
    suggestions: [
      'Normal pap with HPV 18 positive - what is the workup?',
      'Outline workup for suspected pulmonary embolism in pregnancy',
      'What is the appropriate workup for new-onset atrial fibrillation?',
    ],
  },
];

export function SearchSuggestions({ onSelectSuggestion, patientSpecific = false }: SearchSuggestionsProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const displayedSuggestions = GENERAL_CATEGORIES.slice(0, 3).map(category => category.suggestions[0]);

  if (!showAllCategories) {
    return (
      <div className="w-full space-y-3">
        {displayedSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="w-full px-4 py-2.5 text-left border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-between group"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pr-3">
              {suggestion}
            </span>
            <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-healthcare-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
          </button>
        ))}

        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAllCategories(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-healthcare-500 dark:hover:text-healthcare-400 transition-colors"
          >
            <span>Explore More Capabilities</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {GENERAL_CATEGORIES.map(category => {
        const isCategoryExpanded = expandedCategory === category.id;
        const IconComponent = category.icon;

        return (
          <div
            key={category.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-start justify-between group text-sm ${
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

      <div className="flex justify-center pt-2">
        <button
          onClick={() => setShowAllCategories(false)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-healthcare-500 dark:hover:text-healthcare-400 transition-colors"
        >
          <span>Show Less</span>
          <ChevronDown className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
}
