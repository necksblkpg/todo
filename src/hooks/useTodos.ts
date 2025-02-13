import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { Todo, TodoFilter, TodoSort } from '../types/todo';
import useAuth from './useAuth';

export default function useTodos(projectId?: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TodoFilter>({});
  const [sort, setSort] = useState<TodoSort>({ field: 'createdAt', direction: 'desc' });
  const { user } = useAuth();

  // Lyssna på todos för det aktuella projektet eller användarens personliga todos
  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const todosRef = collection(db, 'todos');
    let q = query(todosRef);

    // Filtrera efter projekt eller personliga todos
    if (projectId) {
      q = query(q, where('projectId', '==', projectId));
    } else {
      q = query(q, where('userId', '==', user.id), where('projectId', '==', null));
    }

    // Lägg till filter
    if (filter.completed !== undefined) {
      q = query(q, where('completed', '==', filter.completed));
    }
    if (filter.category) {
      q = query(q, where('category', '==', filter.category));
    }
    if (filter.tags && filter.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filter.tags));
    }
    if (filter.assignedTo) {
      q = query(q, where('assignedTo', '==', filter.assignedTo));
    }
    if (filter.priority) {
      q = query(q, where('priority', '==', filter.priority));
    }

    // Lägg till sortering
    q = query(q, orderBy(sort.field, sort.direction));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        dueDate: doc.data().dueDate ? doc.data().dueDate.toDate() : undefined
      })) as Todo[];
      setTodos(todosData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, projectId, filter, sort]);

  const addTodo = async (title: string, description?: string) => {
    if (!user) throw new Error('User must be logged in');

    const todoData: Omit<Todo, 'id'> = {
      title,
      description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
      projectId: projectId || undefined
    };

    await addDoc(collection(db, 'todos'), {
      ...todoData,
      createdAt: Timestamp.fromDate(todoData.createdAt),
      updatedAt: Timestamp.fromDate(todoData.updatedAt)
    });
  };

  const updateTodo = async (todoId: string, updates: Partial<Todo>) => {
    const todoRef = doc(db, 'todos', todoId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }

    await updateDoc(todoRef, updateData);
  };

  const deleteTodo = async (todoId: string) => {
    await deleteDoc(doc(db, 'todos', todoId));
  };

  const toggleTodo = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      await updateTodo(todoId, { completed: !todo.completed });
    }
  };

  const assignTodo = async (todoId: string, userId: string) => {
    await updateTodo(todoId, { assignedTo: userId });
  };

  return {
    todos,
    loading,
    filter,
    setFilter,
    sort,
    setSort,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    assignTodo
  };
} 