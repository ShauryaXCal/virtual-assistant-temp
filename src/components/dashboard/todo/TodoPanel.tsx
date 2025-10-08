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

  // Sample data
  const sampleTasks: Task[] = [
    // Administrative tasks
    { id: '1', title: 'Update patient records and sign charts', completed: false, priority: 'high', projectId: 'admin', dueDate: new Date().toISOString().split('T')[0], labels: ['urgent'], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    { id: '2', title: 'Review lab and imaging results', completed: false, priority: 'normal', projectId: 'admin', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], labels: ['review'], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    { id: '3', title: 'Complete medical forms or insurance paperwork', completed: false, priority: 'normal', projectId: 'admin', labels: [], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    
    // Clinical tasks
    { id: '4', title: 'Write or renew prescriptions', completed: false, priority: 'high', projectId: 'clinical', dueDate: new Date().toISOString().split('T')[0], labels: ['urgent'], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    { id: '5', title: 'Order or follow up on diagnostic tests', completed: false, priority: 'normal', projectId: 'clinical', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], labels: ['follow-up'], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    { id: '6', title: 'Coordinate with nurses or specialists', completed: false, priority: 'normal', projectId: 'clinical', labels: [], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    
    // Professional tasks
    { id: '7', title: 'Read new medical updates or guidelines', completed: false, priority: 'low', projectId: 'professional', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], labels: ['review'], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    { id: '8', title: 'Attend department or team meetings', completed: false, priority: 'normal', projectId: 'professional', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], labels: [], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    { id: '9', title: 'Work on research or teaching materials', completed: false, priority: 'low', projectId: 'professional', labels: [], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    
    // Personal/Management tasks
    { id: '10', title: 'Check inventory or equipment needs', completed: false, priority: 'normal', projectId: 'personal', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], labels: [], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
    { id: '11', title: 'Plan next day\'s rounds or clinic schedule', completed: false, priority: 'high', projectId: 'personal', dueDate: new Date().toISOString().split('T')[0], labels: ['urgent'], createdAt: new Date().toISOString(), notes: '', subtasks: [] },
  ];

  const projects: Project[] = [
    { id: 'admin', name: '🧾 Administrative', color: '#3B82F6', taskCount: 3, createdAt: new Date().toISOString() },
    { id: 'clinical', name: '🔬 Clinical', color: '#10B981', taskCount: 3, createdAt: new Date().toISOString() },
    { id: 'professional', name: '📚 Professional', color: '#8B5CF6', taskCount: 3, createdAt: new Date().toISOString() },
    { id: 'personal', name: '⚙️ Personal / Management', color: '#F59E0B', taskCount: 2, createdAt: new Date().toISOString() },
  ];

  const labels: Label[] = [
    { id: 'urgent', name: 'Urgent', color: '#EF4444', taskCount: 3 },
    { id: 'review', name: 'Review', color: '#3B82F6', taskCount: 2 },
    { id: 'follow-up', name: 'Follow-up', color: '#10B981', taskCount: 1 },
  ];

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    // In a real app, this would update the task in the state
    console.log('Task updated:', updatedTask);
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    // In a real app, this would remove the task from the state
    console.log('Task deleted:', taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
      setShowDetails(false);
    }
  };

  const getFilteredTasks = (): Task[] => {
    switch (selectedSection) {
      case 'inbox':
        return sampleTasks.filter(t => !t.projectId && !t.completed);
      case 'today':
        return sampleTasks.filter(t => t.dueDate && isToday(t.dueDate) && !t.completed);
      case 'upcoming':
        return sampleTasks.filter(t => t.dueDate && isUpcoming(t.dueDate) && !t.completed);
      case 'projects':
        return sampleTasks.filter(t => t.projectId && !t.completed);
      case 'project-admin':
        return sampleTasks.filter(t => t.projectId === 'admin' && !t.completed);
      case 'project-clinical':
        return sampleTasks.filter(t => t.projectId === 'clinical' && !t.completed);
      case 'project-professional':
        return sampleTasks.filter(t => t.projectId === 'professional' && !t.completed);
      case 'project-personal':
        return sampleTasks.filter(t => t.projectId === 'personal' && !t.completed);
      default:
        return sampleTasks;
    }
  };

  function isToday(date: string): boolean {
    const today = new Date().toDateString();
    return new Date(date).toDateString() === today;
  }

  function isUpcoming(date: string): boolean {
    const today = new Date();
    const taskDate = new Date(date);
    return taskDate > today && taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const getSectionTitle = () => {
    switch (selectedSection) {
      case 'inbox':
        return 'Inbox';
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      case 'projects':
        return 'All Projects';
      case 'project-admin':
        return '🧾 Administrative';
      case 'project-clinical':
        return '🔬 Clinical';
      case 'project-professional':
        return '📚 Professional';
      case 'project-personal':
        return '⚙️ Personal / Management';
      default:
        return 'Tasks';
    }
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
                {selectedSection === 'inbox' 
                  ? 'All caught up! Your inbox is empty.'
                  : `No tasks in ${getSectionTitle().toLowerCase()}.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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
