import { useState, useEffect, KeyboardEvent } from 'react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  timestamp: Date;
  category?: string;
  tags: string[];
}

type Filter = 'all' | 'active' | 'completed';
type SortBy = 'date' | 'status' | 'alphabetical';

const CATEGORIES = [
  { id: 'work', name: 'Work', color: '#EF4444' },
  { id: 'personal', name: 'Personal', color: '#3B82F6' },
  { id: 'shopping', name: 'Shopping', color: '#10B981' },
  { id: 'health', name: 'Health', color: '#8B5CF6' },
  { id: 'finance', name: 'Finance', color: '#F59E0B' }
];

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [editingTags, setEditingTags] = useState<string | null>(null);

  // Fetch todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const q = query(collection(db, 'todos'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const todosData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as TodoItem[];
        setTodos(todosData);
      } catch (error) {
        console.error('Error fetching todos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    try {
      const timestamp = new Date();
      const docRef = await addDoc(collection(db, 'todos'), {
        text: input,
        completed: false,
        timestamp,
        category: selectedCategory,
        tags: []
      });
      setTodos([{ 
        id: docRef.id, 
        text: input, 
        completed: false, 
        timestamp,
        category: selectedCategory,
        tags: []
      }, ...todos]);
      setInput('');
      setSelectedCategory('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todoToToggle = todos.find(todo => todo.id === id);
      if (!todoToToggle) return;

      const todoRef = doc(db, 'todos', id);
      const newCompleted = !todoToToggle.completed;
      
      await updateDoc(todoRef, {
        completed: newCompleted
      });

      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, completed: newCompleted }
          : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const todoRef = doc(db, 'todos', id);
      await deleteDoc(todoRef);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleEdit = async (id: string) => {
    if (editText.trim() === '') return;
    if (editingId === null) return;

    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, {
        text: editText
      });

      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, text: editText }
          : todo
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      handleEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const addTag = async (todoId: string, tag: string) => {
    if (!tag.trim()) return;
    
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;

      const newTags = [...(todo.tags || []), tag.trim()];
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, { tags: newTags });

      setTodos(todos.map(t => 
        t.id === todoId 
          ? { ...t, tags: newTags }
          : t
      ));
      setTagInput('');
      setEditingTags(null);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const removeTag = async (todoId: string, tagToRemove: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;

      const newTags = todo.tags.filter(tag => tag !== tagToRemove);
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, { tags: newTags });

      setTodos(todos.map(t => 
        t.id === todoId 
          ? { ...t, tags: newTags }
          : t
      ));
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const filteredAndSortedTodos = todos
    .filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter(todo => {
      if (!categoryFilter) return true;
      return todo.category === categoryFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'status':
          return Number(b.completed) - Number(a.completed);
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#4F46E5', 
        borderRadius: '12px 12px 0 0',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '24px', 
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          My Tasks
        </h1>

        {/* Progress Bar */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          height: '8px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: 'white',
            height: '100%',
            width: `${progressPercentage}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{
          color: 'white',
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {completedCount} of {totalCount} tasks completed ({Math.round(progressPercentage)}%)
        </div>

        <form onSubmit={addTodo} style={{ position: 'relative' }}>
          <div style={{ marginBottom: '12px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                marginBottom: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 100px 12px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px'
            }}
            placeholder="What needs to be done?"
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '4px',
              bottom: '4px',
              padding: '8px 16px',
              backgroundColor: '#4F46E5',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
          >
            Add Task
          </button>
        </form>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB'
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB'
            }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #E5E7EB'
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="status">Sort by Status</option>
          <option value="alphabetical">Sort Alphabetically</option>
        </select>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '0 0 12px 12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB',
        borderTop: 'none'
      }}>
        <div style={{
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #E5E7EB'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
              Loading tasks...
            </div>
          ) : filteredAndSortedTodos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ color: '#9CA3AF', fontSize: '18px', marginBottom: '8px' }}>
                No tasks found
              </div>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filteredAndSortedTodos.map((todo) => (
                <li
                  key={todo.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginRight: '12px',
                        cursor: 'pointer',
                        accentColor: '#4F46E5'
                      }}
                    />
                    {editingId === todo.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, todo.id)}
                        onBlur={() => handleEdit(todo.id)}
                        autoFocus
                        style={{
                          flex: 1,
                          fontSize: '16px',
                          padding: '4px 8px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <span
                        onDoubleClick={() => startEditing(todo)}
                        style={{
                          flex: 1,
                          fontSize: '16px',
                          color: todo.completed ? '#9CA3AF' : '#1F2937',
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {todo.text}
                      </span>
                    )}
                    {todo.category && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: CATEGORIES.find(c => c.id === todo.category)?.color + '20',
                        color: CATEGORIES.find(c => c.id === todo.category)?.color,
                        marginLeft: '8px'
                      }}>
                        {CATEGORIES.find(c => c.id === todo.category)?.name}
                      </span>
                    )}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#EF4444',
                        marginLeft: '8px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Tags section */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '4px',
                    marginLeft: '32px'
                  }}>
                    {todo.tags?.map(tag => (
                      <span
                        key={tag}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#E5E7EB',
                          borderRadius: '12px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(todo.id, tag)}
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: '0 2px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#6B7280'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {editingTags === todo.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          addTag(todo.id, tagInput);
                        }}
                        style={{ display: 'inline-flex' }}
                      >
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onBlur={() => {
                            if (tagInput.trim()) {
                              addTag(todo.id, tagInput);
                            }
                            setEditingTags(null);
                          }}
                          autoFocus
                          placeholder="Add tag..."
                          style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            fontSize: '12px',
                            width: '80px'
                          }}
                        />
                      </form>
                    ) : (
                      <button
                        onClick={() => setEditingTags(todo.id)}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'transparent',
                          border: '1px dashed #E5E7EB',
                          borderRadius: '12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: '#6B7280'
                        }}
                      >
                        + Add Tag
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
