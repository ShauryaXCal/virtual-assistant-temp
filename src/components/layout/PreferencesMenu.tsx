import { X, RefreshCcw, MapPin, Mail, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PreferencesMenuProps {
  onClose: () => void;
}

interface OrganizationMember {
  id: string;
  full_name: string;
  role: string;
  specialty: string;
  location: string;
  email: string;
}

export function PreferencesMenu({ onClose }: PreferencesMenuProps) {
  const [member, setMember] = useState<OrganizationMember | null>(null);
  const [focusArea, setFocusArea] = useState<string>('');

  useEffect(() => {
    const storedMember = localStorage.getItem('selectedMember');
    const storedFocus = localStorage.getItem('focusArea');
    if (storedMember) {
      setMember(JSON.parse(storedMember));
    }
    if (storedFocus) {
      setFocusArea(storedFocus);
    }
  }, []);

  const handleSwitchRole = () => {
    localStorage.removeItem('selectedMember');
    localStorage.removeItem('focusArea');
    window.location.reload();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Profile</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{member?.full_name}</p>
        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{member?.role}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 mr-2" />
            <span>{member?.email}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{member?.location}</span>
          </div>
        </div>
        {focusArea && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Focus</p>
            <p className="text-xs font-medium text-healthcare-600 dark:text-healthcare-400">{focusArea}</p>
          </div>
        )}
      </div>

      <div className="p-2">
        <button
          onClick={() => {
            onClose();
            handleSwitchRole();
          }}
          className="w-full px-4 py-2 text-left text-sm text-healthcare-600 dark:text-healthcare-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center space-x-2 transition-colors duration-200"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Switch Role</span>
        </button>
      </div>
    </div>
  );
}
