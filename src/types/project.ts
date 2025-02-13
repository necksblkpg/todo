import { User } from './todo';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: ProjectMember[];
  membersIds: string[]; // Nytt fält för att underlätta queries
}

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectName: string;
  fromUserId: string;
  toUserId: string;
  status: InvitationStatus;
  createdAt: Date;
  expiresAt: Date;
}

export enum ProjectRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}
