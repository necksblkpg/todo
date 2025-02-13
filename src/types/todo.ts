export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  projectId?: string;  // ID för projektet som todo:n tillhör
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  category?: string;
  assignedTo?: string;  // ID för användaren som todo:n är tilldelad till
}

export interface TodoFilter {
  completed?: boolean;
  projectId?: string;
  category?: string;
  tags?: string[];
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TodoSort {
  field: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  direction: 'asc' | 'desc';
}

export type Filter = 'all' | 'active' | 'completed';
export type SortBy = 'date' | 'status' | 'alphabetical' | 'deadline' | 'order';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#EF4444' },
  { id: 'personal', name: 'Personal', color: '#3B82F6' },
  { id: 'shopping', name: 'Shopping', color: '#10B981' },
  { id: 'health', name: 'Health', color: '#8B5CF6' },
  { id: 'finance', name: 'Finance', color: '#F59E0B' }
];
