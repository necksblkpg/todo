import { KeyboardEvent } from 'react';
import { TodoItem as TodoItemType, Category, CATEGORIES } from '../types/todo';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  setEditingId: (id: string | null) => void;
  editingTags: string | null;
  tagInput: string;
  setTagInput: (text: string) => void;
  setEditingTags: (id: string | null) => void;
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onAddTag,
  onRemoveTag,
  editingId,
  editText,
  setEditText,
  setEditingId,
  editingTags,
  tagInput,
  setTagInput,
  setEditingTags
}: TodoItemProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEdit(todo.id, editText);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const startEditing = () => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  return (
    <li style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      marginBottom: '8px',
      border: '1px solid #E5E7EB',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
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
            onKeyDown={handleKeyDown}
            onBlur={() => onEdit(todo.id, editText)}
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
            onDoubleClick={startEditing}
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
          onClick={() => onDelete(todo.id)}
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
              onClick={() => onRemoveTag(todo.id, tag)}
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
              onAddTag(todo.id, tagInput);
            }}
            style={{ display: 'inline-flex' }}
          >
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={() => {
                if (tagInput.trim()) {
                  onAddTag(todo.id, tagInput);
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
  );
} 