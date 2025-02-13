import React, { useState } from 'react';
import useProjects from '../hooks/useProjects';
import useAuth from '../hooks/useAuth';

interface ProjectManagerProps {
  onProjectSelect: (projectId: string | null) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ onProjectSelect }) => {
  const { projects, createProject, inviteToProject, removeProjectMember, deleteProject } = useProjects();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    try {
      const id = await createProject(projectName.trim(), projectDescription.trim() || undefined);
      setProjectName('');
      setProjectDescription('');
      setShowForm(false);
      onProjectSelect(id);
    } catch (error) {
      alert('Fel vid skapande av projekt');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !inviteEmail.trim()) return;
    try {
      await inviteToProject(selectedProjectId, inviteEmail.trim());
      setInviteEmail('');
    } catch (error) {
      alert('Fel vid inbjudan');
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded">
      <h3 className="text-lg font-bold mb-3">Hantera Projekt</h3>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {showForm ? 'Stäng formulär' : 'Skapa nytt projekt'}
      </button>
      {showForm && (
        <form onSubmit={handleCreateProject} className="mb-4 space-y-3">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Projektnamn"
            className="w-full p-2 border rounded"
          />
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Projektbeskrivning (valfritt)"
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
            Skapa
          </button>
        </form>
      )}
      {projects.map(project => (
        <div key={project.id} className="border rounded p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">{project.name}</span>
            {project.ownerId === user?.id && (
              <button
                onClick={() => { if(window.confirm('Är du säker?')) deleteProject(project.id); }}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Ta bort
              </button>
            )}
          </div>
          {project.description && <p className="text-sm text-gray-600 mb-2">{project.description}</p>}
          <div>
            <h4 className="font-semibold text-sm mb-1">Bjud in medlem:</h4>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setSelectedProjectId(project.id);
                }}
                placeholder="E-post"
                className="flex-1 p-2 border rounded"
              />
              <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Bjud in
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectManager;
