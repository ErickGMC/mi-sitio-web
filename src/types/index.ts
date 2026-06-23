import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  createdAt: Timestamp | Date;
}

export type ProjectCategory = 'game' | 'store' | 'music' | 'electronics';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  embedUrl?: string;
  repoUrl?: string;
  authorId: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Timestamp | Date;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  text: string;
  likesCount: number;
  createdAt: Timestamp | Date;
}

export interface ProjectLike {
  id: string; // userId_projectId
  userId: string;
  projectId: string;
  createdAt: Timestamp | Date;
}

export interface CommentLike {
  id: string; // userId_commentId
  userId: string;
  commentId: string;
  createdAt: Timestamp | Date;
}
