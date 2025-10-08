import { useState } from 'react';
import { TaskItem } from './TaskItem';
import { TaskDetails } from './TaskDetails';
import type { Task, Project, Label } from './types';

interface TodoPanelProps {
  selectedSection: string;
  isOpen: boolean;
  onToggle: () => void;
  width: number;
  onWidthChange: (width: number) => void;
}

export function TodoPanel({ selectedSection, isOpen, onToggle, width, onWidthChange }: TodoPanelProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getDateInDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const initialTasks: Task[] = [
    {
      id: '1',
      title: "Review John Michael Doe's latest renal function (eGFR 68) and repeat labs in 2 weeks to monitor for medication-related kidney impact after starting Metoprolol and Clopidogrel.",
      completed: false,
      priority: 'high',
      patientName: 'John Michael Doe',
      dueDate: getDateInDays(3),
      labels: ['lab-follow-up'],
      createdAt: new Date().toISOString(),
      notes: '',
      subtasks: []
    },
    {
      id: '2',
      title: "Confirm John Michael Doe's cardiology follow-up appointment scheduled for 2025-11-01 and ensure cardiac rehab referral is active.",
      completed: false,
      priority: 'normal',
      patientName: 'John Michael Doe',
      dueDate: getDateInDays(5),
      labels: ['appointment'],
      createdAt: new Date().toISOString(),
      notes: '',
      subtasks: []
    },
    {
      id: '3',
      title: "Review John Michael Doe's blood pressure and symptom diary for any new chest discomfort, fatigue, or weight gain suggestive of heart-failure progression.",
      completed: false,
      priority: 'normal',
      patientName: 'John Michael Doe',
      dueDate: getDateInDays(2),
      labels: ['monitoring'],
      createdAt: new Date().toISOString(),
      notes: '',
      subtasks: []
    },
    {
      id: '4',
      title: 'Order updated HbA1c, lipid panel, and urine microalbumin for Robert Johnson as part of annual diabetes monitoring (last labs >1 year ago).',
      completed: false,
      priority: 'high',
      patientName: 'Robert Johnson',
      dueDate: getDateInDays(1),
      labels: ['lab-order'],
      createdAt: new Date().toISOString(),
      notes: '',
      subtasks: []
    },
    {
      id: '5',
      title: 'Verify Robert Johnson has completed annual diabetic retinal and foot exams or schedule them within the next month.',
      completed: false,
      priority: 'normal',
      patientName: 'Robert Johnson',
      dueDate: getDateInDays(4),
      labels: ['screening'],
      createdAt: new Date().toISOString(),
      notes: '',
      subtasks: []
    },
    {
      id: '6',
      title: "Review Robert Johnson's home blood pressure readings and adjust antihypertensive regimen if average >130/80 mmHg.",
      completed: false,
      priority: 'normal',
      patientName: 'Robert Johnson',
      dueDate: getDateInDays(2),
      labels: ['monitoring'],
      createdAt: new Date().toISOString(),
      notes: '',
      subtasks: []
    },
    {
      id: '7',
      title: "Reassess Emily Chen's peak flow measurement after steroid taper (previous 380 L/min, goal ≥450) to evaluate asthma control.",
      completed: false,
      priority: 'high',
      patientName: 'Emily Chen',
      dueDate: getDateInDays(1),
      labels: ['assessment'],
      createdAt: new Date().toISOString(),
      notes: '',
      subtasks: []
    },
    {
      id: '8',
      title: "Evaluate Emily Chen's allergy management plan — consider adding montelukast or antihistamine for elevated IgE (250 IU/mL) and seasonal triggers.",
      completed: false,
      priority: 'normal',
      patientName: 'Emily Chen',
      dueDate: getDateInDays(3),
      labels: ['medication'],
      createdAt: new Date().toISOString(),
      notes: '',
      subtasks: []
    },
  ];

  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const projects: Project[] = [
    { id: 'admin', name: '🧾 Administrative', color: '#3B82F6', taskCount: 3, createdAt: new Date().toISOString() },
    { id: 'clinical', name: '🔬 Clinical', color: '#10B981', taskCount: 3, createdAt: new Date().toISOString() },
    { id: 'professional', name: '📚 Professional', color: '#8B5CF6', taskCount: 3, createdAt: new Date().toISOString() },
    { id: 'personal', name: '⚙️ Personal / Management', color: '#F59E0B', taskCount: 2, createdAt: new Date().toISOString() },
  ];

  const labels: Label[] = [
    { id: 'lab-follow-up', name: 'Lab Follow-up', color: '#3B82F6', taskCount: 1 },
    { id: 'appointment', name: 'Appointment', color: '#8B5CF6', taskCount: 1 },
    { id: 'monitoring', name: 'Monitoring', color: '#10B981', taskCount: 2 },
    { id: 'lab-order', name: 'Lab Order', color: '#EF4444', taskCount: 1 },
    { id: 'screening', name: 'Screening', color: '#F59E0B', taskCount: 1 },
    { id: 'assessment', name: 'Assessment', color: '#EC4899', taskCount: 1 },
    { id: 'medication', name: 'Medication', color: '#06B6D4', taskCount: 1 },
  ];

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
      setShowDetails(false);
    }
  };

  const getFilteredTasks = (): Task[] => {
    switch (selectedSection) {
      case 'today':
        return tasks.filter(t => t.dueDate && isToday(t.dueDate));
      case 'week':
        return tasks.filter(t => t.dueDate && isThisWeek(t.dueDate));
      case 'patients':
        return tasks;
      default:
        return tasks;
    }
  };

  function isToday(date: string): boolean {
    const today = new Date().toDateString();
    return new Date(date).toDateString() === today;
  }

  function isThisWeek(date: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return taskDate >= today && taskDate <= weekFromNow;
  }

  const getSectionTitle = () => {
    switch (selectedSection) {
      case 'today':
        return 'Due Today';
      case 'week':
        return 'Due This Week';
      case 'patients':
        return 'All Patients';
      default:
        return 'Tasks';
    }
  };

  const groupTasksByPatient = (tasks: Task[]) => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const patient = task.patientName || 'Other';
      if (!grouped[patient]) {
        grouped[patient] = [];
      }
      grouped[patient].push(task);
    });
    return grouped;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <>
      <div className="bg-white dark:bg-gray-900 flex flex-col h-full w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {getSectionTitle()}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tasks found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All caught up! No tasks {getSectionTitle().toLowerCase()}.
              </p>
            </div>
          ) : selectedSection === 'patients' ? (
            <div className="space-y-6">
              {Object.entries(groupTasksByPatient(filteredTasks)).map(([patientName, tasks]) => (
                <div key={patientName}>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span className="text-base">👤</span>
                    {patientName}
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({tasks.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                        labels={labels}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                  labels={labels}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Drawer */}
      {showDetails && selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setShowDetails(false)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
          projects={projects}
          labels={labels}
        />
      )}
    </>
  );
}
