import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface DataPriority {
  labs: boolean;
  vitals: boolean;
  medications: boolean;
  allergies: boolean;
  procedures: boolean;
  imaging: boolean;
}

interface Preferences {
  dataPriority: DataPriority;
}

interface PreferencesContextType {
  preferences: Preferences;
  updateDataPriority: (priority: Partial<DataPriority>) => void;
}

const defaultPreferences: Preferences = {
  dataPriority: {
    labs: true,
    vitals: true,
    medications: true,
    allergies: true,
    procedures: false,
    imaging: false,
  },
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('preferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const updateDataPriority = (priority: Partial<DataPriority>) => {
    const newPreferences = {
      ...preferences,
      dataPriority: {
        ...preferences.dataPriority,
        ...priority,
      },
    };
    setPreferences(newPreferences);
    localStorage.setItem('preferences', JSON.stringify(newPreferences));
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updateDataPriority }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
