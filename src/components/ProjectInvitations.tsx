import React from 'react';
import useProjects from '../hooks/useProjects';

const ProjectInvitations: React.FC = () => {
  const { invitations, handleInvitation } = useProjects();
  if (invitations.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-white p-4 rounded shadow-lg max-w-sm">
      <h3 className="text-lg font-bold mb-3">Projektinbjudningar</h3>
      {invitations.map(inv => (
        <div key={inv.id} className="bg-gray-100 p-3 rounded mb-2">
          <p className="mb-2">Du har blivit inbjuden till projektet "{inv.projectName}"</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleInvitation(inv.id, true)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Acceptera
            </button>
            <button
              onClick={() => handleInvitation(inv.id, false)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Avböj
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectInvitations;
