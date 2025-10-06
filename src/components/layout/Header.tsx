import { Moon, Sun, User, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { PreferencesMenu } from './PreferencesMenu';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <div className="flex content-center justify-center w-12 h-12">
          <img src="xclogo.svg" alt="XC Logo" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Virtual Assistant</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Clarity when it matters most</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-healthcare-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.specialty}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          {showMenu && <PreferencesMenu onClose={() => setShowMenu(false)} />}
        </div>
      </div>
    </header>
  );
}
