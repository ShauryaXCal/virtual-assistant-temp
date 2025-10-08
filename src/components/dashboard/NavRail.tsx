import { Calendar, ClipboardList, ListTodo, Users } from 'lucide-react';

export type DashboardView = 'patient' | 'calendar' | 'instructions' | 'todo';

interface NavRailProps {
  activeView: DashboardView;
  onChange: (view: DashboardView) => void;
}

export function NavRail({ activeView, onChange }: NavRailProps) {
  const items: { id: DashboardView; label: string; icon: typeof Users }[] = [
    { id: 'patient', label: 'Patients', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'instructions', label: 'Instructions', icon: ClipboardList },
    { id: 'todo', label: 'To-Do', icon: ListTodo },
  ];

  return (
    <div className="w-14 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col items-center py-3 space-y-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-healthcare-100 dark:bg-healthcare-900/30 text-healthcare-600 dark:text-healthcare-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label={item.label}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}


