import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, Plus } from 'lucide-react';
import { TaskItem } from './TaskItem';
import type { Task, Project, Label } from './types';

interface ProjectListProps {
  projects: Project[];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  labels: Label[];
}

export function ProjectList({ projects, tasks, onTaskClick, onTaskUpdate, onTaskDelete, labels }: ProjectListProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId && !task.completed);
  };

  const getProjectColor = (color: string) => {
    return {
      backgroundColor: `${color}20`,
      color: color,
    };
  };

  if (projects.length === 0) {
    return (
      <div className="px-2 pb-2">
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <Folder className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No projects yet</p>
          <button className="mt-2 text-xs text-healthcare-600 dark:text-healthcare-400 hover:underline">
            Create your first project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 pb-2">
      <div className="space-y-1">
        {projects.map(project => {
          const projectTasks = getProjectTasks(project.id);
          const isExpanded = expandedProjects.has(project.id);
          
          return (
            <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {project.name}
                  </span>
                  {projectTasks.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                      {projectTasks.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle add task to project
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Add task to ${project.name}`}
                  >
                    <Plus className="w-3 h-3 text-gray-500" />
                  </button>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-2 pb-2">
                  {projectTasks.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400">
                      No tasks in this project
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {projectTasks.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onClick={() => onTaskClick(task)}
                          onUpdate={onTaskUpdate}
                          onDelete={onTaskDelete}
                          labels={labels}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
