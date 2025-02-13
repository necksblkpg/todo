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
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Laddar...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-5">
        <h1 className="text-3xl font-bold mb-4">Välkommen till Todo-appen</h1>
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Logga in med Google
        </button>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Mina Projekt</h2>
          <button
            onClick={() => setSelectedProjectId(null)}
            className={`block w-full text-left px-3 py-2 mt-2 rounded ${
              selectedProjectId === null ? 'bg-blue-100' : 'hover:bg-gray-200'
            }`}
          >
            Personliga Todos
          </button>
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`block w-full text-left px-3 py-2 mt-2 rounded ${
                selectedProjectId === project.id ? 'bg-blue-100' : 'hover:bg-gray-200'
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
        <ProjectManager onProjectSelect={setSelectedProjectId} />
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {selectedProject ? selectedProject.name : 'Personliga Todos'}
          </h1>
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || user.email}
                className="w-10 h-10 rounded-full"
              />
            )}
            <span className="text-lg">{user.displayName || user.email}</span>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logga ut
            </button>
          </div>
        </header>
        <TodoList projectId={selectedProjectId} />
      </main>
      <ProjectInvitations />
    </div>
  );
}

export default App;
