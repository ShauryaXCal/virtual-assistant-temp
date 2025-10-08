import { useState, useRef, useEffect } from 'react';
import { X, Calendar, Tag, Flag, Clock, FileText, Plus, Check, Trash2 } from 'lucide-react';
import type { Task, Project, Label, Subtask } from './types';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  projects: Project[];
  labels: Label[];
}

export function TaskDetails({ task, onClose, onUpdate, onDelete, projects, labels }: TaskDetailsProps) {
  const [editedTask, setEditedTask] = useState(task);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDueDateMenu, setShowDueDateMenu] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingNotes && notesTextareaRef.current) {
      notesTextareaRef.current.focus();
    }
  }, [isEditingNotes]);

  const handleSave = () => {
    onUpdate(editedTask);
  };

  const handleTitleSubmit = () => {
    if (editedTask.title.trim()) {
      handleSave();
    }
    setIsEditingTitle(false);
  };

  const handleNotesSubmit = () => {
    handleSave();
    setIsEditingNotes(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const subtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtask.trim(),
      completed: false,
    };
    
    setEditedTask(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, subtask]
    }));
    setNewSubtask('');
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    }));
  };

  const handleSubtaskDelete = (subtaskId: string) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== subtaskId)
    }));
  };

  const handleProjectSelect = (projectId: string) => {
    setEditedTask(prev => ({ ...prev, projectId }));
    setShowProjectMenu(false);
  };

  const handleLabelToggle = (labelId: string) => {
    setEditedTask(prev => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter(id => id !== labelId)
        : [...prev.labels, labelId]
    }));
    setShowLabelMenu(false);
  };

  const handlePrioritySelect = (priority: 'low' | 'normal' | 'high') => {
    setEditedTask(prev => ({ ...prev, priority }));
    setShowPriorityMenu(false);
  };

  const handleDueDateChange = (date: string) => {
    setEditedTask(prev => ({ ...prev, dueDate: date }));
    setShowDueDateMenu(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'normal': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getTaskProject = () => {
    return projects.find(p => p.id === editedTask.projectId);
  };

  const getTaskLabels = () => {
    return labels.filter(label => editedTask.labels.includes(label.id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="w-96 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Details</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="w-full text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white"
              />
            ) : (
              <h3
                className="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {editedTask.title}
              </h3>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {/* Project */}
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Tag className="w-3 h-3" />
                <span>{getTaskProject()?.name || 'No project'}</span>
              </button>
              {showProjectMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleProjectSelect('')}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      No project
                    </button>
                    {projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project.id)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {project.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="relative">
              <button
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Flag className={`w-3 h-3 ${getPriorityColor(editedTask.priority)}`} />
                <span className="capitalize">{editedTask.priority}</span>
              </button>
              {showPriorityMenu && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    {(['low', 'normal', 'high'] as const).map(priority => (
                      <button
                        key={priority}
                        onClick={() => handlePrioritySelect(priority)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Flag className={`w-3 h-3 ${getPriorityColor(priority)}`} />
                        <span className="capitalize">{priority}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Due date */}
            <div className="relative">
              <button
                onClick={() => setShowDueDateMenu(!showDueDateMenu)}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Calendar className="w-3 h-3" />
                <span>{editedTask.dueDate ? new Date(editedTask.dueDate).toLocaleDateString() : 'No due date'}</span>
              </button>
              {showDueDateMenu && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <input
                    type="date"
                    value={editedTask.dueDate || ''}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                  />
                  <button
                    onClick={() => handleDueDateChange('')}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Remove due date
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Labels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Labels</h4>
              <button
                onClick={() => setShowLabelMenu(!showLabelMenu)}
                className="text-xs text-healthcare-600 dark:text-healthcare-400 hover:underline"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {getTaskLabels().map(label => (
                <span
                  key={label.id}
                  className="px-2 py-1 text-xs rounded"
                  style={{ backgroundColor: `${label.color}20`, color: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
            {showLabelMenu && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  {labels.map(label => (
                    <button
                      key={label.id}
                      onClick={() => handleLabelToggle(label.id)}
                      className="w-full text-left px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span>{label.name}</span>
                      {editedTask.labels.includes(label.id) && (
                        <Check className="w-3 h-3 text-healthcare-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Notes</h4>
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-healthcare-600 dark:text-healthcare-400 hover:underline"
              >
                {editedTask.notes ? 'Edit' : 'Add'}
              </button>
            </div>
            {isEditingNotes ? (
              <textarea
                ref={notesTextareaRef}
                value={editedTask.notes || ''}
                onChange={(e) => setEditedTask(prev => ({ ...prev, notes: e.target.value }))}
                onBlur={handleNotesSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsEditingNotes(false);
                }}
                placeholder="Add notes..."
                className="w-full h-24 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none"
              />
            ) : (
              <div
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsEditingNotes(true)}
              >
                {editedTask.notes || 'Click to add notes...'}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Subtasks</h4>
            </div>
            <div className="space-y-2">
              {editedTask.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSubtaskToggle(subtask.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      subtask.completed
                        ? 'bg-healthcare-500 border-healthcare-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-healthcare-500'
                    }`}
                  >
                    {subtask.completed && <Check className="w-3 h-3" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => handleSubtaskDelete(subtask.id)}
                    className="w-4 h-4 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add subtask..."
                  className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Delete
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-healthcare-500 text-white text-sm rounded-lg hover:bg-healthcare-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
