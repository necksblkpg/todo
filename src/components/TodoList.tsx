import React, { useState } from 'react';
import useTodos from '../hooks/useTodos';

const TodoList: React.FC<{ projectId?: string | null }> = ({ projectId }) => {
  const { todos, loading, addTodo, deleteTodo, toggleTodo } = useTodos(projectId || undefined);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await addTodo(newTask.trim(), newDescription.trim() || undefined);
      setNewTask('');
      setNewDescription('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Laddar todos...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <form onSubmit={handleAddTask} className="mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Vad behöver göras?"
          className="w-full p-3 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Beskrivning (valfritt)"
          className="w-full p-3 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Lägg till
        </button>
      </form>
      {todos.length === 0 ? (
        <p className="text-center text-gray-500">Inga todos att visa</p>
      ) : (
        <ul className="space-y-4">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center p-4 border rounded hover:shadow transition">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="mr-4 w-5 h-5"
              />
              <div className="flex-1">
                <div className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.title}
                </div>
                {todo.description && <div className="text-sm text-gray-600">{todo.description}</div>}
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Är du säker på att du vill ta bort denna todo?')) {
                    deleteTodo(todo.id);
                  }
                }}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
