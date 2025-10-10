import { useState } from 'react';
import { Calendar, ClipboardList, Brain, Users, Activity, BarChart3, FileText, ArrowRight } from 'lucide-react';

interface OrganizationMember {
  id: string;
  full_name: string;
  role: string;
  specialty: string;
  location: string;
}

interface FocusSelectionProps {
  member: OrganizationMember;
  onSubmit: (focus: string) => void;
}

interface FocusSuggestion {
  icon: React.ElementType;
  title: string;
}

export function FocusSelection({ member, onSubmit }: FocusSelectionProps) {
  const [focusInput, setFocusInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRoleSuggestions = (): FocusSuggestion[] => {
    switch (member.role) {
      case 'Primary Care Physician':
      case 'Cardiologist':
        return [
          { icon: Users, title: 'Patient List Management' },
          { icon: Calendar, title: 'Appointment Scheduling' },
          { icon: ClipboardList, title: 'Personal Task Tracker' },
          { icon: Brain, title: 'Clinical Decision Support' },
        ];
      case 'Nurse':
        return [
          { icon: Users, title: 'Patient List View' },
          { icon: Activity, title: 'Care Coordination' },
          { icon: FileText, title: 'Medication Tracking' },
          { icon: ClipboardList, title: 'Task Management' },
        ];
      case 'Clinical Quality Analyst':
        return [
          { icon: BarChart3, title: 'Quality Metrics Dashboard' },
          { icon: FileText, title: 'Compliance Tracking' },
          { icon: Activity, title: 'Performance Analytics' },
          { icon: ClipboardList, title: 'Quality Improvement' },
        ];
      default:
        return [
          { icon: ClipboardList, title: 'Task Management' },
          { icon: Calendar, title: 'Schedule Review' },
          { icon: Users, title: 'Team Collaboration' },
        ];
    }
  };

  const suggestions = getRoleSuggestions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusInput.trim()) return;

    setIsSubmitting(true);
    await onSubmit(focusInput);
  };

  const handleSuggestionClick = (title: string) => {
    setFocusInput(title);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome, {member.full_name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {member.role} · {member.specialty}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            What would you like to focus on today?
          </label>
          <div className="relative">
            <input
              type="text"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              placeholder="Type or select a suggestion below"
              className="w-full px-4 py-3 pr-32 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-healthcare-500 focus:ring-1 focus:ring-healthcare-500 outline-none transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!focusInput.trim() || isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-healthcare-500 text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-healthcare-600 transition-colors flex items-center gap-1.5"
            >
              <span>{isSubmitting ? 'Starting...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Suggestions
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              const isSelected = focusInput === suggestion.title;
              return (
                <button
                  key={suggestion.title}
                  onClick={() => handleSuggestionClick(suggestion.title)}
                  className={`p-3 rounded-lg border text-left transition-all
                    ${isSelected
                      ? 'border-healthcare-500 bg-healthcare-50 dark:bg-healthcare-950'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isSelected
                        ? 'text-healthcare-600 dark:text-healthcare-400'
                        : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isSelected
                        ? 'text-healthcare-900 dark:text-healthcare-100'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {suggestion.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
