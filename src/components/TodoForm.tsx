import { FormEvent } from 'react';
import { CATEGORIES } from '../types/todo';

interface TodoFormProps {
  input: string;
  setInput: (input: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function TodoForm({
  input,
  setInput,
  selectedCategory,
  setSelectedCategory,
  onSubmit
}: TodoFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ position: 'relative' }}>
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
  );
} 