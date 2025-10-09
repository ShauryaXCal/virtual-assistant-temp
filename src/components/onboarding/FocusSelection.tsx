import { useState } from 'react';
import { Target, Calendar, ClipboardList, Brain, Users, Activity, BarChart3, FileText, ArrowRight } from 'lucide-react';

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
  description: string;
}

export function FocusSelection({ member, onSubmit }: FocusSelectionProps) {
  const [focusInput, setFocusInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRoleSuggestions = (): FocusSuggestion[] => {
    switch (member.role) {
      case 'Primary Care Physician':
      case 'Cardiologist':
        return [
          { icon: Users, title: 'Patient List Management', description: 'Review and manage your patient roster' },
          { icon: Calendar, title: 'Appointment Scheduling', description: 'View and manage upcoming appointments' },
          { icon: ClipboardList, title: 'Personal Task Tracker', description: 'Organize clinical tasks and follow-ups' },
          { icon: Brain, title: 'Clinical Decision Support', description: 'Access evidence-based guidelines and tools' },
        ];
      case 'Nurse':
        return [
          { icon: Users, title: 'Patient List View', description: 'Monitor assigned patients and their status' },
          { icon: Activity, title: 'Care Coordination', description: 'Manage patient care transitions' },
          { icon: FileText, title: 'Medication Tracking', description: 'Review and document medication administration' },
          { icon: ClipboardList, title: 'Task Management', description: 'Track nursing tasks and priorities' },
        ];
      case 'Clinical Quality Analyst':
        return [
          { icon: BarChart3, title: 'Quality Metrics Dashboard', description: 'Monitor clinical quality indicators' },
          { icon: FileText, title: 'Compliance Tracking', description: 'Review regulatory compliance status' },
          { icon: Activity, title: 'Performance Analytics', description: 'Analyze clinical performance data' },
          { icon: Target, title: 'Quality Improvement', description: 'Identify and track improvement initiatives' },
        ];
      default:
        return [
          { icon: ClipboardList, title: 'Task Management', description: 'Organize and track your tasks' },
          { icon: Calendar, title: 'Schedule Review', description: 'View your calendar and appointments' },
          { icon: Users, title: 'Team Collaboration', description: 'Connect with your colleagues' },
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Primary Care Physician':
        return 'from-blue-500 to-blue-600';
      case 'Cardiologist':
        return 'from-red-500 to-red-600';
      case 'Nurse':
        return 'from-green-500 to-green-600';
      case 'Clinical Quality Analyst':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-healthcare-400 to-healthcare-600 rounded-2xl mb-6 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {member.full_name.split(' ')[1]}
            </h1>
            <div className="inline-flex items-center space-x-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${getRoleColor(member.role)} text-white shadow-sm`}>
                {member.role}
              </span>
              <span className="text-gray-600 dark:text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">{member.specialty}</span>
            </div>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-400">
            What would you like to focus on today?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              placeholder="Type your focus area or select a suggestion below..."
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-healthcare-500 focus:ring-4 focus:ring-healthcare-500/20 outline-none transition-all duration-200"
              autoFocus
            />
            <button
              type="submit"
              disabled={!focusInput.trim() || isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-healthcare-500 to-healthcare-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Starting...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Suggested focus areas for your role:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.title}
                  onClick={() => handleSuggestionClick(suggestion.title)}
                  className={`group p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${focusInput === suggestion.title
                      ? 'border-healthcare-500 bg-healthcare-50 dark:bg-healthcare-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-healthcare-300 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                      ${focusInput === suggestion.title
                        ? 'bg-healthcare-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-healthcare-100 group-hover:text-healthcare-600'
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold mb-1 transition-colors
                        ${focusInput === suggestion.title
                          ? 'text-healthcare-700 dark:text-healthcare-400'
                          : 'text-gray-900 dark:text-white group-hover:text-healthcare-600'
                        }`}>
                        {suggestion.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can change your focus area anytime from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
