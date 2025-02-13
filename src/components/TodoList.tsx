import React, { useState } from 'react';
import { CATEGORIES } from '../types/todo';
import useTodos from '../hooks/useTodos';
import ProgressBar from './ProgressBar';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface TodoListProps {
  projectId?: string | null;
}

const TodoList: React.FC<TodoListProps> = ({ projectId }) => {
  const {
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
  } = useTodos(projectId || undefined);

  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      await addTodo(newTodoTitle.trim(), newTodoDescription.trim() || undefined);
      setNewTodoTitle('');
      setNewTodoDescription('');
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Kunde inte lägga till todo');
    }
  };

  if (loading) {
    return <div>Laddar todos...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Vad behöver göras?"
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
            <textarea
              value={newTodoDescription}
              onChange={(e) => setNewTodoDescription(e.target.value)}
              placeholder="Beskrivning (valfritt)"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                minHeight: '100px'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Lägg till
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select
            value={filter.completed === undefined ? '' : filter.completed.toString()}
            onChange={(e) => setFilter({ ...filter, completed: e.target.value === '' ? undefined : e.target.value === 'true' })}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Alla</option>
            <option value="false">Pågående</option>
            <option value="true">Avklarade</option>
          </select>

          <select
            value={sort.field}
            onChange={(e) => setSort({ ...sort, field: e.target.value as any })}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="createdAt">Skapad</option>
            <option value="updatedAt">Uppdaterad</option>
            <option value="dueDate">Deadline</option>
            <option value="priority">Prioritet</option>
            <option value="title">Titel</option>
          </select>

          <button
            onClick={() => setSort({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {sort.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {todos.length === 0 ? (
        <p>Inga todos att visa</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map(todo => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                style={{ marginRight: '10px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#666' : 'inherit'
                }}>
                  {todo.title}
                </div>
                {todo.description && (
                  <div style={{
                    fontSize: '0.9em',
                    color: '#666',
                    marginTop: '5px'
                  }}>
                    {todo.description}
                  </div>
                )}
                {todo.dueDate && (
                  <div style={{
                    fontSize: '0.9em',
                    color: '#666',
                    marginTop: '5px'
                  }}>
                    Deadline: {todo.dueDate.toLocaleDateString()}
                  </div>
                )}
                {todo.assignedTo && (
                  <div style={{
                    fontSize: '0.9em',
                    color: '#666',
                    marginTop: '5px'
                  }}>
                    Tilldelad till: {todo.assignedTo}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Är du säker på att du vill ta bort denna todo?')) {
                    deleteTodo(todo.id);
                  }
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Ta bort
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList; 