import React, { useState } from 'react';
import { User } from '../types/todo';

interface ShareTodoDialogProps {
  todoId: string;
  sharedWith: string[];
  onShare: (email: string) => Promise<void>;
  onUnshare: (userId: string) => Promise<void>;
  onClose: () => void;
  sharedUsers: User[];
}

export default function ShareTodoDialog({
  todoId,
  sharedWith,
  onShare,
  onUnshare,
  onClose,
  sharedUsers
}: ShareTodoDialogProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      await onShare(email);
      setEmail('');
    } catch (err) {
      setError('Failed to share todo. Please check the email and try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          marginBottom: '1.5rem'
        }}>
          Share Todo
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          {error && (
            <div style={{ 
              color: '#EF4444', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              backgroundColor: '#4F46E5',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              marginRight: '0.5rem'
            }}
          >
            Share
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#9CA3AF',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </form>

        {sharedUsers.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Shared with
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {sharedUsers.map(user => (
                <li
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || user.email}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%'
                        }}
                      />
                    )}
                    <span>{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={() => onUnshare(user.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 