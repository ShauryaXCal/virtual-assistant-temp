import { useState } from 'react';
import { Header } from '../layout/Header';
import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import { RightPanel } from './RightPanel';
import { NavRail, type DashboardView } from './NavRail';
import { PatientLeftPanel } from './PatientLeftPanel';
import { InstructionsLeftPanel } from './InstructionsLeftPanel';
import { TodoPanel } from './todo/TodoPanel';
// import { TodoLeftSidebar } from './todo/TodoLeftSidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// Force recompilation

interface SelectedAppointment {
  id: string;
  time: string;
  reason: string;
}

export function Dashboard() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);
  const [view, setView] = useState<DashboardView>('calendar');
  const [selectedTodoSection, setSelectedTodoSection] = useState<string>('inbox');

  const handleSelectAppointment = (patientId: string, appointment: { id: string; time: string; reason: string }) => {
    setSelectedPatientId(patientId);
    setSelectedAppointment({ id: appointment.id, time: appointment.time, reason: appointment.reason });
    if (window.innerWidth < 1024) {
      setShowRightPanel(true);
      setShowLeftPanel(false);
    }
  };


  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Left-most navigation rail */}
        <NavRail activeView={view} onChange={(v) => setView(v)} />

        {showLeftPanel && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300 relative">
            {view === 'calendar' && (
              <LeftPanel onSelectAppointment={handleSelectAppointment} />
            )}
            {view === 'patient' && <PatientLeftPanel />}
            {view === 'instructions' && <InstructionsLeftPanel />}
            {view === 'todo' && (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">To-Do</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-1">
                    {[
                      { id: 'inbox', title: 'Inbox', icon: '📥', count: 0 },
                      { id: 'today', title: 'Today', icon: '📅', count: 5 },
                      { id: 'upcoming', title: 'Upcoming', icon: '⏰', count: 6 },
                      { id: 'projects', title: 'Projects', icon: '📁', count: 4 },
                      { id: 'project-admin', title: '🧾 Administrative', icon: '📋', count: 3 },
                      { id: 'project-clinical', title: '🔬 Clinical', icon: '📋', count: 3 },
                      { id: 'project-professional', title: '📚 Professional', icon: '📋', count: 3 },
                      { id: 'project-personal', title: '⚙️ Personal / Management', icon: '📋', count: 2 },
                    ].map(section => (
                      <button
                        key={section.id}
                        onClick={() => setSelectedTodoSection(section.id)}
                        className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group ${
                          selectedTodoSection === section.id ? 'bg-healthcare-50 dark:bg-healthcare-900/20 border-r-2 border-healthcare-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="text-sm">{section.icon}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {section.title}
                          </span>
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                            {section.count}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
            className="absolute top-20 left-14 w-8 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-r-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 z-10"
            aria-label="Show left panel"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        <div className="flex-1 bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-y-auto">
          {view === 'todo' ? (
            <TodoPanel
              selectedSection={selectedTodoSection}
              isOpen={true}
              onToggle={() => {}}
              width={320}
              onWidthChange={() => {}}
            />
          ) : (
            <CenterPanel
              patientId={selectedPatientId}
              appointment={selectedAppointment}
              rightPanelOpen={showRightPanel}
            />
          )}
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
