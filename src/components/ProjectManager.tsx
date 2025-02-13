import React, { useState } from 'react';
import useProjects from '../hooks/useProjects';
import useAuth from '../hooks/useAuth';

interface ProjectManagerProps {
  onProjectSelect: (projectId: string | null) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ onProjectSelect }) => {
  const { projects, createProject, inviteToProject, removeProjectMember, deleteProject } = useProjects();
  const { user } = useAuth();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const projectId = await createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowNewProjectForm(false);
      onProjectSelect(projectId);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Kunde inte skapa projekt');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !inviteEmail.trim()) return;

    try {
      await inviteToProject(selectedProjectId, inviteEmail.trim());
      setInviteEmail('');
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Kunde inte bjuda in användaren');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Är du säker på att du vill ta bort projektet?')) {
      try {
        await deleteProject(projectId);
        onProjectSelect(null);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Kunde inte ta bort projektet');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Mina Projekt</h2>
        <button
          onClick={() => setShowNewProjectForm(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Nytt Projekt
        </button>
      </div>

      {showNewProjectForm && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <h3>Skapa nytt projekt</h3>
          <form onSubmit={handleCreateProject}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Projektnamn"
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Projektbeskrivning (valfritt)"
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  minHeight: '100px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
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
                Skapa
              </button>
              <button
                type="button"
                onClick={() => setShowNewProjectForm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.map(project => (
        <div
          key={project.id}
          style={{
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>{project.name}</h3>
            {project.ownerId === user?.id && (
              <button
                onClick={() => handleDeleteProject(project.id)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Ta bort
              </button>
            )}
          </div>

          {project.description && (
            <p style={{ marginBottom: '15px', color: '#666' }}>{project.description}</p>
          )}

          <div style={{ marginBottom: '15px' }}>
            <h4>Medlemmar:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {project.members.map(member => (
                <li
                  key={member.userId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    marginBottom: '5px',
                    borderRadius: '4px'
                  }}
                >
                  <span>{member.userId === user?.id ? 'Du' : member.userId} ({member.role})</span>
                  {project.ownerId === user?.id && member.userId !== user?.id && (
                    <button
                      onClick={() => removeProjectMember(project.id, member.userId)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Ta bort
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {project.ownerId === user?.id && (
            <div>
              <h4>Bjud in medlem</h4>
              <form onSubmit={handleInviteMember} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setSelectedProjectId(project.id);
                  }}
                  placeholder="E-postadress"
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Bjud in
                </button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectManager; 