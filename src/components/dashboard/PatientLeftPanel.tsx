import { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { getPatientsByDoctorId } from '../../lib/database';
import type { Patient } from '../../lib/supabase';

interface PatientLeftPanelProps {
  onSelectPatient?: (patientId: string) => void;
}

export function PatientLeftPanel({ onSelectPatient }: PatientLeftPanelProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatients() {
      const currentDoctorId = 'befec32a-c29a-4b31-a55c-cf23abe50b8d';

      setIsLoading(true);
      const patientData = await getPatientsByDoctorId(currentDoctorId);
      setPatients(patientData);
      setIsLoading(false);
    }

    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    onSelectPatient?.(patientId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Patients</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {patients.length} patient{patients.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No patients found' : 'No patients yet'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient.id)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  selectedPatientId === patient.id
                    ? 'bg-healthcare-50 dark:bg-healthcare-900/20 border border-healthcare-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {patient.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      MRN: {patient.mrn}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {patient.age} yrs • {patient.gender}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



