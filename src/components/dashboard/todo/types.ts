export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'normal' | 'high';
  projectId?: string;
  dueDate?: string;
  labels: string[];
  createdAt: string;
  notes?: string;
  subtasks: Subtask[];
  timeEstimate?: string;
  pinned?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  createdAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  count: number;
}

export interface TaskFilter {
  type: 'all' | 'today' | 'upcoming' | 'completed';
  projectId?: string;
  labelId?: string;
}

export interface TaskSort {
  field: 'due' | 'priority' | 'created' | 'title';
  direction: 'asc' | 'desc';
}
