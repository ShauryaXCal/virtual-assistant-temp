import { useState, useRef, useEffect } from 'react';
import { Check, Clock, Flag, MoreHorizontal, Pin, PinOff } from 'lucide-react';
import type { Task, Label } from './types';

interface TaskItemProps {
  task: Task;
  onClick: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  labels: Label[];
}

export function TaskItem({ task, onClick, onUpdate, onDelete, labels }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onUpdate({ ...task, completed: e.target.checked });
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate({ ...task, title: editTitle.trim() });
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handlePriorityChange = (priority: 'low' | 'normal' | 'high') => {
    onUpdate({ ...task, priority });
    setShowMenu(false);
  };

  const handlePinToggle = () => {
    onUpdate({ ...task, pinned: !task.pinned });
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowMenu(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'normal':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const getTaskLabels = () => {
    return labels.filter(label => task.labels.includes(label.id));
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div
      className={`group relative p-2 rounded-lg border transition-all duration-200 ${
        task.completed
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      } ${task.pinned ? 'ring-1 ring-healthcare-500' : ''}`}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      {/* Main row */}
      <div className="flex items-start space-x-2">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxChange}
          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-healthcare-500 border-healthcare-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-healthcare-500'
          }`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <Check className="w-3 h-3" />}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white"
            />
          ) : (
            <div
              className={`text-sm cursor-pointer ${
                task.completed
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
              onClick={handleTitleClick}
            >
              {task.title}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center space-x-2 mt-1">
            {/* Priority indicator */}
            {task.priority !== 'normal' && (
              <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
            )}

            {/* Time estimate */}
            {task.timeEstimate && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {task.timeEstimate}
                </span>
              </div>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  isOverdue
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {formatDueDate(task.dueDate)}
              </span>
            )}

            {/* Labels */}
            {getTaskLabels().map(label => (
              <span
                key={label.id}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${label.color}20`, color: label.color }}
              >
                {label.name}
              </span>
            ))}

            {/* Note preview */}
            {task.notes && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-20">
                {task.notes}
              </span>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-1">
          {/* Pin indicator */}
          {task.pinned && (
            <Pin className="w-3 h-3 text-healthcare-500" />
          )}

          {/* Menu button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                showMenu || showQuickActions
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Task options"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <div className="py-1">
                  <button
                    onClick={handlePinToggle}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    {task.pinned ? (
                      <>
                        <PinOff className="w-4 h-4" />
                        <span>Unpin</span>
                      </>
                    ) : (
                      <>
                        <Pin className="w-4 h-4" />
                        <span>Pin</span>
                      </>
                    )}
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  <div className="px-3 py-1">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</div>
                    <div className="space-y-1">
                      {(['low', 'normal', 'high'] as const).map(priority => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(priority)}
                          className={`w-full text-left text-sm px-2 py-1 rounded flex items-center space-x-2 ${
                            task.priority === priority
                              ? 'bg-healthcare-100 dark:bg-healthcare-900/30 text-healthcare-700 dark:text-healthcare-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Flag className={`w-3 h-3 ${getPriorityColor(priority)}`} />
                          <span className="capitalize">{priority}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
