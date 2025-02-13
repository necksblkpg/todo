import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { Project, ProjectInvitation, ProjectRole, InvitationStatus } from '../types/project';
import useAuth from './useAuth';

export default function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Lyssna på projekt där användaren är medlem
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('ownerId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Project data:', data); // För felsökning
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          members: data.members.map((m: any) => ({
            ...m,
            joinedAt: m.joinedAt.toDate()
          }))
        };
      }) as Project[];
      
      console.log('Hämtade projekt:', projectsData); // För felsökning
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Lyssna på inbjudningar
  useEffect(() => {
    if (!user) {
      setInvitations([]);
      return;
    }

    const invitationsRef = collection(db, 'projectInvitations');
    const q = query(
      invitationsRef, 
      where('toUserId', '==', user.id),
      where('status', '==', InvitationStatus.PENDING)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invitationsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        expiresAt: doc.data().expiresAt.toDate()
      })) as ProjectInvitation[];
      setInvitations(invitationsData);
    });

    return () => unsubscribe();
  }, [user]);

  const createProject = async (name: string, description?: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const member = {
        userId: user.id,
        role: ProjectRole.OWNER,
        joinedAt: new Date()
      };

      const projectData = {
        name,
        ...(description ? { description } : {}),  // Inkludera description endast om det finns
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        ownerId: user.id,
        members: [
          {
            ...member,
            joinedAt: Timestamp.fromDate(member.joinedAt)
          }
        ]
      };

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const inviteToProject = async (projectId: string, userEmail: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      // Hitta användaren med den angivna e-postadressen
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      const invitedUser = querySnapshot.docs[0];
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      if (project.members.some(m => m.userId === invitedUser.id)) {
        throw new Error('User is already a member of this project');
      }

      const invitation: Omit<ProjectInvitation, 'id'> = {
        projectId,
        projectName: project.name,
        fromUserId: user.id,
        toUserId: invitedUser.id,
        status: InvitationStatus.PENDING,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dagar
      };

      await addDoc(collection(db, 'projectInvitations'), {
        ...invitation,
        createdAt: Timestamp.fromDate(invitation.createdAt),
        expiresAt: Timestamp.fromDate(invitation.expiresAt)
      });
    } catch (error) {
      console.error('Error inviting to project:', error);
      throw error;
    }
  };

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const invitationRef = doc(db, 'projectInvitations', invitationId);
      const invitation = invitations.find(i => i.id === invitationId);

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      const status = accept ? InvitationStatus.ACCEPTED : InvitationStatus.REJECTED;
      await updateDoc(invitationRef, { status });

      if (accept) {
        const projectRef = doc(db, 'projects', invitation.projectId);
        const member = {
          userId: user.id,
          role: ProjectRole.MEMBER,
          joinedAt: Timestamp.fromDate(new Date())
        };
        
        await updateDoc(projectRef, {
          members: arrayUnion(member)
        });
      }
    } catch (error) {
      console.error('Error handling invitation:', error);
      throw error;
    }
  };

  const removeProjectMember = async (projectId: string, userId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      if (project.ownerId !== user.id) {
        throw new Error('Only project owner can remove members');
      }

      if (userId === project.ownerId) {
        throw new Error('Cannot remove project owner');
      }

      const projectRef = doc(db, 'projects', projectId);
      const memberToRemove = project.members.find(m => m.userId === userId);
      
      if (memberToRemove) {
        await updateDoc(projectRef, {
          members: arrayRemove(memberToRemove)
        });
      }
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      if (project.ownerId !== user.id) {
        throw new Error('Only project owner can delete the project');
      }

      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  return {
    projects,
    invitations,
    loading,
    createProject,
    inviteToProject,
    handleInvitation,
    removeProjectMember,
    deleteProject
  };
} 