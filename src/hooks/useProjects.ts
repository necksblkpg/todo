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

  // Lyssna på projekt där användaren är medlem (via fältet membersIds)
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('membersIds', 'array-contains', user.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          members: data.members?.map((m: any) => ({
            ...m,
            joinedAt: m.joinedAt?.toDate()
          })) || [],
          membersIds: data.membersIds || []
        };
      }) as Project[];

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
    if (!user) throw new Error('Användare måste vara inloggad');

    try {
      const member = { userId: user.id, role: ProjectRole.OWNER, joinedAt: new Date() };
      const projectData = {
        name,
        ...(description ? { description } : {}),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        ownerId: user.id,
        members: [{ ...member, joinedAt: Timestamp.fromDate(member.joinedAt) }],
        membersIds: [user.id]
      };

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      return docRef.id;
    } catch (error) {
      console.error('Fel vid skapande av projekt:', error);
      throw error;
    }
  };

  const inviteToProject = async (projectId: string, userEmail: string) => {
    if (!user) throw new Error('Användare måste vara inloggad');

    try {
      // Hitta användaren med den angivna e-postadressen
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Användare hittades inte');
      }

      const invitedUser = querySnapshot.docs[0];
      const project = projects.find(p => p.id === projectId);
      
      if (!project) throw new Error('Projektet hittades inte');

      if (project.membersIds.includes(invitedUser.id)) {
        throw new Error('Användaren är redan medlem i detta projekt');
      }

      const invitation = {
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
      console.error('Fel vid inbjudan:', error);
      throw error;
    }
  };

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    if (!user) throw new Error('Användare måste vara inloggad');

    try {
      const invitationRef = doc(db, 'projectInvitations', invitationId);
      const invitation = invitations.find(i => i.id === invitationId);
      if (!invitation) throw new Error('Inbjudan hittades inte');

      const status = accept ? InvitationStatus.ACCEPTED : InvitationStatus.REJECTED;
      await updateDoc(invitationRef, { status });

      if (accept) {
        const projectRef = doc(db, 'projects', invitation.projectId);
        const member = { userId: user.id, role: ProjectRole.MEMBER, joinedAt: Timestamp.fromDate(new Date()) };
        await updateDoc(projectRef, {
          members: arrayUnion(member),
          membersIds: arrayUnion(user.id)
        });
      }
    } catch (error) {
      console.error('Fel vid hantering av inbjudan:', error);
      throw error;
    }
  };

  const removeProjectMember = async (projectId: string, userId: string) => {
    if (!user) throw new Error('Användare måste vara inloggad');

    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Projektet hittades inte');

      if (project.ownerId !== user.id) throw new Error('Endast projektägaren kan ta bort medlemmar');
      if (userId === project.ownerId) throw new Error('Kan inte ta bort projektägaren');

      const projectRef = doc(db, 'projects', projectId);
      const memberToRemove = project.members.find(m => m.userId === userId);
      
      if (memberToRemove) {
        await updateDoc(projectRef, {
          members: arrayRemove(memberToRemove),
          membersIds: arrayRemove(userId)
        });
      }
    } catch (error) {
      console.error('Fel vid borttagning av projektmedlem:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('Användare måste vara inloggad');

    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Projektet hittades inte');
      if (project.ownerId !== user.id) throw new Error('Endast projektägaren kan ta bort projektet');

      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      console.error('Fel vid borttagning av projekt:', error);
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
