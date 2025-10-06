import { useState } from 'react';
import { Header } from '../layout/Header';
import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import { RightPanel } from './RightPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '../../data/mockData';

export function Dashboard() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleSelectAppointment = (patientId: string, appointment: Appointment) => {
    setSelectedPatientId(patientId);
    setSelectedAppointment(appointment);
    if (window.innerWidth < 1024) {
      setShowRightPanel(true);
      setShowLeftPanel(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {showLeftPanel && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300 relative">
            <LeftPanel onSelectAppointment={handleSelectAppointment} />
            <button
              onClick={() => setShowLeftPanel(false)}
              className="absolute top-4 -right-3 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Hide left panel"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}

        {!showLeftPanel && (
          <button
            onClick={() => setShowLeftPanel(true)}
            className="absolute top-20 left-0 w-8 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-r-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 z-10"
            aria-label="Show left panel"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        <div className="flex-1 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <CenterPanel patientId={selectedPatientId} appointment={selectedAppointment} rightPanelOpen={showRightPanel}/>
        </div>

        {showRightPanel && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300 relative">
            <RightPanel patientId={selectedPatientId} appointment={selectedAppointment} />
            <button
              onClick={() => setShowRightPanel(false)}
              className="absolute top-4 -left-3 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Hide right panel"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}

        {!showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="absolute top-20 right-0 w-8 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-l-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 z-10"
            aria-label="Show right panel"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
