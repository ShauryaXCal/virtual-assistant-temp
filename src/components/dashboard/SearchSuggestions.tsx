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
  patientSuggestions?: string[];
}

const GENERAL_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'complex-cases',
    title: 'Complex Clinical Decisions',
    icon: Edit3,
    suggestions: [
      'How do I manage a diabetic patient with declining renal function on metformin?',
      'What treatment options exist for refractory hypertension despite triple therapy?',
      'How should I approach polypharmacy in elderly patients with multiple comorbidities?',
    ],
  },
  {
    id: 'drug-information',
    title: 'Drug Information',
    icon: Pill,
    suggestions: [
      'What are the contraindications for starting a patient on warfarin?',
      'Explain the mechanism of action and common adverse effects of statins',
      'What monitoring parameters are required for patients on lithium therapy?',
    ],
  },
  {
    id: 'clinical-guidelines',
    title: 'Evidence-Based Guidelines',
    icon: Shield,
    suggestions: [
      'What are the latest ACC/AHA guidelines for heart failure management?',
      'Summarize current CDC recommendations for adult immunization schedules',
      'What are the GOLD criteria for COPD staging and treatment?',
      'Describe the current guidelines for DVT prophylaxis in hospitalized patients',
    ],
  },
  {
    id: 'diagnostic-approach',
    title: 'Diagnostic Approaches',
    icon: ClipboardList,
    suggestions: [
      'What is the diagnostic workup for unexplained weight loss in adults?',
      'How do I evaluate a patient with suspected thyroid dysfunction?',
      'What tests should be ordered for a patient presenting with chest pain?',
    ],
  },
];

function categorizePatientSuggestions(suggestions: string[]): SuggestionCategory[] {
  const categories: SuggestionCategory[] = [
    {
      id: 'medications',
      title: 'Medications',
      icon: Pill,
      suggestions: suggestions.filter(s => s.includes('💊')).map(s => s.replace('💊 ', '')),
    },
    {
      id: 'conditions',
      title: 'Conditions',
      icon: Shield,
      suggestions: suggestions.filter(s => s.includes('⚠️')).map(s => s.replace('⚠️ ', '')),
    },
    {
      id: 'encounters',
      title: 'Encounters & Visits',
      icon: ClipboardList,
      suggestions: suggestions.filter(s => s.includes('🗓️')).map(s => s.replace('🗓️ ', '')),
    },
    {
      id: 'labs',
      title: 'Lab Results',
      icon: Edit3,
      suggestions: suggestions.filter(s => s.includes('📊')).map(s => s.replace('📊 ', '')),
    },
  ];

  return categories.filter(cat => cat.suggestions.length > 0);
}

export function SearchSuggestions({ onSelectSuggestion, patientSpecific = false, patientSuggestions = [] }: SearchSuggestionsProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  const categories = patientSpecific && patientSuggestions.length > 0
    ? categorizePatientSuggestions(patientSuggestions)
    : GENERAL_CATEGORIES;

  const handleShowAllCategories = () => {
    setShowAllCategories(true);
    setExpandedCategories(new Set(categories.map(cat => cat.id)));
  };

  if (!showAllCategories) {
    return (
      <div className="w-full space-y-2">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(category.suggestions[0])}
            className="w-full px-3 py-2 text-left border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-between group"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pr-3">
              {category.suggestions[0]}
            </span>
            <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-healthcare-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
          </button>
        ))}

        <div className="flex justify-center pt-2">
          <button
            onClick={handleShowAllCategories}
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
      {categories.map(category => {
        const isCategoryExpanded = expandedCategories.has(category.id);
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
                <ChevronDown className="w-4 h-4 text-gray-500 rotate-180" />
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
