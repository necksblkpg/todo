import React, { useState } from 'react';
import useAuth from './hooks/useAuth';
import useProjects from './hooks/useProjects';
import TodoList from './components/TodoList';
import ProjectManager from './components/ProjectManager';
import ProjectInvitations from './components/ProjectInvitations';

function App() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (authLoading || projectsLoading) {
    return <div>Laddar...</div>;
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <h1>Välkommen till Todo-appen</h1>
        <button
          onClick={signInWithGoogle}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            style={{ width: '20px', height: '20px' }}
          />
          Logga in med Google
        </button>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || user.email}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%'
              }}
            />
          )}
          <span>Välkommen, {user.displayName || user.email}!</span>
        </div>
        <button
          onClick={signOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logga ut
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '300px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Mina Projekt</h2>
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => setSelectedProjectId(null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: selectedProjectId === null ? '#e3f2fd' : 'transparent',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: '5px'
                }}
              >
                Personliga Todos
              </button>
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: selectedProjectId === project.id ? '#e3f2fd' : 'transparent',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    marginBottom: '5px'
                  }}
                >
                  {project.name}
                </button>
              ))}
            </div>
            <ProjectManager onProjectSelect={setSelectedProjectId} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {selectedProject ? selectedProject.name : 'Personliga Todos'}
            </h2>
            <TodoList projectId={selectedProjectId} />
          </div>
        </div>
      </div>

      <ProjectInvitations />
    </div>
  );
}

export default App;
