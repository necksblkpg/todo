import React from 'react';
import useProjects from '../hooks/useProjects';

const ProjectInvitations: React.FC = () => {
  const { invitations, handleInvitation } = useProjects();

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 15px 0' }}>Projektinbjudningar</h3>
      {invitations.map(invitation => (
        <div 
          key={invitation.id}
          style={{
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            marginBottom: '10px'
          }}
        >
          <p style={{ margin: '0 0 10px 0' }}>
            Du har blivit inbjuden till projektet "{invitation.projectName}"
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleInvitation(invitation.id, true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Acceptera
            </button>
            <button
              onClick={() => handleInvitation(invitation.id, false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
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