import { Users, LogOut, X, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { deleteFollowupDataByDate, getAllDoctors } from '../../lib/database';
import type { Doctor } from '../../lib/supabase';

interface PreferencesMenuProps {
  onClose: () => void;
}

export function PreferencesMenu({ onClose }: PreferencesMenuProps) {
  const { user, logout } = useAuth();
  const [showAccountSwitch, setShowAccountSwitch] = useState(false);
  const [accounts, setAccounts] = useState<Doctor[]>([]);

  useEffect(() => {
    async function loadAccounts() {
      const doctors = await getAllDoctors();
      setAccounts(doctors);
    }
    loadAccounts();
  }, []);

  const handleAccountSwitch = (email: string) => {
    logout();
    setTimeout(() => {
      const switchEvent = new CustomEvent('switchAccount', { detail: { email } });
      window.dispatchEvent(switchEvent);
    }, 100);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Menu</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">NPI: {user?.npiId}</p>
      </div>

      {!showAccountSwitch ? (
        <>
          <div className="p-2">
            <button
              onClick={() => setShowAccountSwitch(true)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center space-x-2 transition-colors duration-200"
            >
              <Users className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
            <button
              onClick={() => {
                onClose();
                deleteFollowupDataByDate()
              }}
              className="w-full px-4 py-2 text-left text-sm text-yellow-600 dark:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center space-x-2 transition-colors duration-200"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center space-x-2 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </>
      ) : (
        <div className="p-4">
          <button
            onClick={() => setShowAccountSwitch(false)}
            className="text-xs text-healthcare-500 hover:text-healthcare-600 mb-3 flex items-center"
          >
            ← Back
          </button>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Switch to Account
          </h4>
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleAccountSwitch(account.email)}
                disabled={account.id === user?.id}
                className={`w-full text-left p-3 rounded-lg border transition-colors duration-200 ${
                  account.id === user?.id
                    ? 'border-healthcare-500 bg-healthcare-50 dark:bg-healthcare-900/20 cursor-default'
                    : 'border-gray-200 dark:border-gray-700 hover:border-healthcare-300 dark:hover:border-healthcare-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {account.full_name}
                  {account.id === user?.id && (
                    <span className="ml-2 text-xs text-healthcare-600 dark:text-healthcare-400">
                      (Current)
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{account.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{account.specialty}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
