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
    <div className="w-16 border-r border-healthcare-200/30 dark:border-healthcare-800/30 bg-gradient-to-b from-healthcare-50 via-healthcare-50/80 to-healthcare-100/50 dark:from-healthcare-950 dark:via-healthcare-950/90 dark:to-healthcare-900/80 flex flex-col items-center py-6 space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <div key={item.id} className="relative group">
            <button
              onClick={() => onChange(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-healthcare-800 text-healthcare-600 dark:text-healthcare-300 shadow-lg shadow-healthcare-500/20 ring-2 ring-healthcare-500/20'
                  : 'text-healthcare-600/60 dark:text-healthcare-400/70 hover:bg-white/60 dark:hover:bg-healthcare-900/60 hover:text-healthcare-600 dark:hover:text-healthcare-300'
              }`}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            </button>

            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
              {item.label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100" />
            </div>
          </div>
        );
      })}
    </div>
  );
}


